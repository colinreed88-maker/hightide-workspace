// slack.ts — Slack escalation posting
// In sandbox mode, logs the message to stdout — never posts to Slack.

import type { DelinquencyCase, TenantArrears } from './types.js';

interface SlackConfig {
  webhookUrl?: string;
  dashboardBaseUrl?: string;
  propertyName?: string;
}

/**
 * Format the Slack escalation message for a delinquent tenant.
 */
export function formatSlackEscalation(
  delinquencyCase: DelinquencyCase,
  tenant: TenantArrears,
  currentBalance: number,
  config: SlackConfig = {}
): string {
  const {
    dashboardBaseUrl = 'https://app.flow.life',
    propertyName = 'Flow Brickell',
  } = config;

  const balance = currentBalance.toFixed(2);
  const noticeSentAt = delinquencyCase.notice_sent_at
    ? new Date(delinquencyCase.notice_sent_at).toLocaleString('en-US', {
        timeZone: 'America/New_York',
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : 'unknown';

  const actionLink = `${dashboardBaseUrl}/delinquency/cases/${delinquencyCase.id}`;

  return (
    `🔴 Delinquency Escalation — ${propertyName}\n\n` +
    `Tenant: ${tenant.tenant_name} — Unit ${tenant.unit_id}\n` +
    `Balance: $${balance} (${tenant.days_past_due} days past due)\n` +
    `Notice sent: ${noticeSentAt}\n` +
    `No response in 48 hours.\n\n` +
    `Action log: ${actionLink}\n\n` +
    `React ✅ to acknowledge | 🔒 to mark resolved`
  );
}

/**
 * Post an escalation message.
 * - sandbox=true: log to console only
 * - sandbox=false: POST to Slack webhook
 */
export async function postSlackEscalation(
  delinquencyCase: DelinquencyCase,
  tenant: TenantArrears,
  currentBalance: number,
  config: SlackConfig & { sandbox: boolean }
): Promise<void> {
  const message = formatSlackEscalation(delinquencyCase, tenant, currentBalance, config);

  if (config.sandbox) {
    console.log(`[SANDBOX] slack_escalation_simulated | case=${delinquencyCase.id} | tenant=${tenant.tenant_id}`);
    console.log(`--- SLACK MESSAGE ---\n${message}\n--- END MESSAGE ---`);
    return;
  }

  if (!config.webhookUrl) {
    console.error('[Slack] No webhook URL configured — escalation not sent.');
    return;
  }

  const response = await fetch(config.webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: message }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Slack webhook failed: ${response.status} ${body}`);
  }
}
