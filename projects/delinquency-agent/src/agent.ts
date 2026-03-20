// agent.ts — core delinquency agent logic
// All functions accept injected clients (SnowflakeClient, SupabaseClient) for testability.

import type { TenantArrears, DelinquencyCase, DelinquencyAction, ActionType } from './types.js';
import type { SnowflakeClient } from './snowflake.js';
import type { SupabaseClient } from './supabase.js';
import { generateNotice, logSimulatedNotice } from './notices.js';
import { postSlackEscalation } from './slack.js';

// ---- Sprint 1: Core Detection Loop ------------------------------------------

/**
 * Query Snowflake for delinquent tenants.
 * Filters: days_past_due >= thresholdDays, balance > 0, no payment plan.
 */
export async function queryDelinquentTenants(
  snowflake: SnowflakeClient,
  propertyId: string,
  thresholdDays: number
): Promise<TenantArrears[]> {
  return snowflake.queryDelinquentTenants(propertyId, thresholdDays);
}

/**
 * Create (or return existing) case for a tenant on a given cycle date.
 * Uses UNIQUE(tenant_id, cycle_date) for idempotency — safe to call twice.
 */
export async function createCase(
  supabase: SupabaseClient,
  tenant: TenantArrears,
  propertyId: string,
  cycleDate: string,
  sandbox: boolean
): Promise<DelinquencyCase> {
  return supabase.upsertCase({
    tenant_id: tenant.tenant_id,
    unit_id: tenant.unit_id,
    property_id: propertyId,
    cycle_date: cycleDate,
    balance_due: tenant.balance_due,
    days_past_due: tenant.days_past_due,
    status: 'noticed',
    sandbox_mode: sandbox,
  });
}

/**
 * Render a notice string for the given tenant.
 */
export function generateNoticeText(
  tenant: TenantArrears,
  ctx: { paymentUrl?: string; propertyPhone?: string; propertyName?: string } = {}
): string {
  return generateNotice(tenant, ctx);
}

/**
 * Simulate sending a notice (sandbox mode).
 * Logs the notice text to console and writes a notice_simulated action.
 */
export async function simulateNoticeSend(
  supabase: SupabaseClient,
  caseId: string,
  tenantId: string,
  noticeText: string,
  agentId: string,
  sandbox: boolean
): Promise<DelinquencyAction> {
  logSimulatedNotice(caseId, tenantId, noticeText, sandbox);
  return logAction(supabase, caseId, tenantId, 'notice_simulated', agentId, {
    notice_text: noticeText,
    reason: 'sandbox_mode',
  }, sandbox);
}

/**
 * Append an action to delinquency_actions. Append-only — no updates or deletes.
 */
export async function logAction(
  supabase: SupabaseClient,
  caseId: string,
  tenantId: string,
  actionType: ActionType,
  agentId: string,
  payload: Record<string, unknown>,
  sandbox: boolean
): Promise<DelinquencyAction> {
  return supabase.insertAction({
    case_id: caseId,
    tenant_id: tenantId,
    action_type: actionType,
    agent_id: agentId,
    payload,
    sandbox_mode: sandbox,
  });
}

// ---- Sprint 2: Escalation Loop ----------------------------------------------

const ESCALATION_WINDOW_HOURS = 48;

/**
 * Check whether a case is ready for escalation.
 * - If < 48h since notice: no action
 * - If >= 48h and balance cleared: resolve
 * - If >= 48h and balance still owed: escalate to Slack
 */
export async function checkEscalation(
  supabase: SupabaseClient,
  snowflake: SnowflakeClient,
  delinquencyCase: DelinquencyCase,
  tenant: TenantArrears,
  agentId: string,
  config: {
    sandbox: boolean;
    slackWebhookUrl?: string;
    dashboardBaseUrl?: string;
    propertyName?: string;
    nowOverride?: Date;   // injectable for testing
  }
): Promise<'too_early' | 'resolved' | 'escalated'> {
  const noticeSentAt = delinquencyCase.notice_sent_at;
  if (!noticeSentAt) return 'too_early';

  const now = config.nowOverride ?? new Date();
  const hoursSinceNotice =
    (now.getTime() - new Date(noticeSentAt).getTime()) / (1000 * 60 * 60);

  if (hoursSinceNotice < ESCALATION_WINDOW_HOURS) {
    return 'too_early';
  }

  // Re-check balance
  await logAction(
    supabase,
    delinquencyCase.id,
    tenant.tenant_id,
    'balance_checked',
    agentId,
    { hours_since_notice: Math.round(hoursSinceNotice) },
    config.sandbox
  );

  const currentBalance = await snowflake.getTenantBalance(tenant.tenant_id);
  const balanceDue = currentBalance?.balance_due ?? 0;

  if (balanceDue <= 0) {
    // Resolved
    await supabase.updateCase(delinquencyCase.id, {
      status: 'resolved',
      resolved_at: now.toISOString(),
    });
    await logAction(
      supabase,
      delinquencyCase.id,
      tenant.tenant_id,
      'resolved',
      agentId,
      { reason: 'balance_cleared' },
      config.sandbox
    );
    return 'resolved';
  }

  // Escalate
  await postSlackEscalation(delinquencyCase, tenant, balanceDue, {
    sandbox: config.sandbox,
    webhookUrl: config.slackWebhookUrl,
    dashboardBaseUrl: config.dashboardBaseUrl,
    propertyName: config.propertyName,
  });

  await supabase.updateCase(delinquencyCase.id, {
    status: 'escalated',
    escalated_at: now.toISOString(),
  });

  await logAction(
    supabase,
    delinquencyCase.id,
    tenant.tenant_id,
    'escalated',
    agentId,
    {
      current_balance: balanceDue,
      days_since_notice: Math.round(hoursSinceNotice / 24),
    },
    config.sandbox
  );

  return 'escalated';
}

// ---- Orchestration ----------------------------------------------------------

export interface DailyCycleConfig {
  propertyId: string;
  thresholdDays?: number;
  sandbox: boolean;
  agentId?: string;
  slackWebhookUrl?: string;
  dashboardBaseUrl?: string;
  propertyName?: string;
  propertyPhone?: string;
  paymentUrl?: string;
  nowOverride?: Date;
}

export interface DailyCycleResult {
  newCases: number;
  existingCases: number;
  resolved: number;
  escalated: number;
  errors: string[];
}

/**
 * Orchestrate the full daily delinquency cycle for a property.
 *
 * 1. Query Snowflake for past-due tenants
 * 2. For each tenant:
 *    a. If no case exists → create case, generate + simulate notice, log action
 *    b. If case exists with status=awaiting → check escalation window
 */
export async function runDailyCycle(
  snowflake: SnowflakeClient,
  supabase: SupabaseClient,
  config: DailyCycleConfig
): Promise<DailyCycleResult> {
  const {
    propertyId,
    thresholdDays = 5,
    sandbox,
    agentId = 'delinquency-agent-v1',
    slackWebhookUrl,
    dashboardBaseUrl,
    propertyName,
    propertyPhone,
    paymentUrl,
    nowOverride,
  } = config;

  const now = nowOverride ?? new Date();
  const cycleDate = now.toISOString().slice(0, 10); // YYYY-MM-DD

  console.log(
    `[Agent] runDailyCycle | property=${propertyId} | date=${cycleDate} | sandbox=${sandbox}`
  );

  const result: DailyCycleResult = {
    newCases: 0,
    existingCases: 0,
    resolved: 0,
    escalated: 0,
    errors: [],
  };

  // Step 1: Query delinquent tenants
  let tenants: TenantArrears[];
  try {
    tenants = await queryDelinquentTenants(snowflake, propertyId, thresholdDays);
    console.log(`[Agent] Found ${tenants.length} delinquent tenant(s).`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    result.errors.push(`Snowflake query failed: ${msg}`);
    return result;
  }

  // Step 2: Process each tenant
  for (const tenant of tenants) {
    try {
      // Check today's cycle first (exact date match — idempotency key)
      const todayCase = await supabase.findCase(tenant.tenant_id, cycleDate);

      // Also check if there's an open case from a prior cycle (awaiting escalation)
      const openCase = todayCase ?? await supabase.findOpenCase(tenant.tenant_id);

      if (openCase) {
        result.existingCases++;

        if (openCase.status === 'awaiting') {
          const outcome = await checkEscalation(supabase, snowflake, openCase, tenant, agentId, {
            sandbox,
            slackWebhookUrl,
            dashboardBaseUrl,
            propertyName,
            nowOverride: now,
          });

          if (outcome === 'resolved') result.resolved++;
          else if (outcome === 'escalated') result.escalated++;
        }
        continue;
      }

      // New case
      const delinquencyCase = await createCase(supabase, tenant, propertyId, cycleDate, sandbox);
      result.newCases++;

      // Log detection
      await logAction(
        supabase,
        delinquencyCase.id,
        tenant.tenant_id,
        'detected',
        agentId,
        {
          balance_due: tenant.balance_due,
          days_past_due: tenant.days_past_due,
        },
        sandbox
      );

      // Generate notice
      const noticeText = generateNoticeText(tenant, { paymentUrl, propertyPhone, propertyName });

      await logAction(
        supabase,
        delinquencyCase.id,
        tenant.tenant_id,
        'notice_generated',
        agentId,
        { notice_length: noticeText.length },
        sandbox
      );

      // Send or simulate
      if (sandbox) {
        await simulateNoticeSend(
          supabase,
          delinquencyCase.id,
          tenant.tenant_id,
          noticeText,
          agentId,
          sandbox
        );
      } else {
        // Production: Twilio/SendGrid integration point
        // await sendNoticeViaTwilio(tenant, noticeText);
        await logAction(
          supabase,
          delinquencyCase.id,
          tenant.tenant_id,
          'notice_sent',
          agentId,
          { notice_text: noticeText, channel: 'sms' },
          sandbox
        );
      }

      // Update case to awaiting
      await supabase.updateCase(delinquencyCase.id, {
        status: 'awaiting',
        notice_sent_at: now.toISOString(),
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[Agent] Error processing tenant ${tenant.tenant_id}: ${msg}`);
      result.errors.push(`tenant=${tenant.tenant_id}: ${msg}`);
    }
  }

  console.log(
    `[Agent] Cycle complete | new=${result.newCases} | existing=${result.existingCases} ` +
    `| resolved=${result.resolved} | escalated=${result.escalated} | errors=${result.errors.length}`
  );

  return result;
}
