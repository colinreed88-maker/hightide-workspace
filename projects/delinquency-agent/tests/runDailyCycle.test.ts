import { describe, it, expect } from 'vitest';
import { MockSnowflakeClient } from '../src/snowflake.js';
import { MockSupabaseClient } from '../src/supabase.js';
import { runDailyCycle } from '../src/agent.js';
import { mockTenants, AGENT_ID } from './fixtures.js';

// Only T001, T002, T003 are above threshold (days_past_due >= 5, no payment plan)
const eligibleTenants = mockTenants.filter((t) => !t.payment_plan_flag && t.days_past_due >= 5);

describe('runDailyCycle', () => {
  it('processes 3 delinquent tenants, creates 3 cases, logs actions for each', async () => {
    const snowflake = new MockSnowflakeClient(mockTenants);
    const supabase = new MockSupabaseClient();

    const result = await runDailyCycle(snowflake, supabase, {
      propertyId: 'brickell',
      thresholdDays: 5,
      sandbox: true,
      agentId: AGENT_ID,
    });

    expect(result.newCases).toBe(3);
    expect(result.existingCases).toBe(0);
    expect(result.errors.length).toBe(0);

    // 3 cases created
    expect(supabase.cases.size).toBe(3);

    // Actions: for each tenant: detected, notice_generated, notice_simulated = 3 actions × 3 tenants = 9
    expect(supabase.actions.length).toBe(9);
  });

  it('each new case has at least detected, notice_generated, notice_simulated actions', async () => {
    const snowflake = new MockSnowflakeClient(mockTenants);
    const supabase = new MockSupabaseClient();

    await runDailyCycle(snowflake, supabase, {
      propertyId: 'brickell',
      thresholdDays: 5,
      sandbox: true,
      agentId: AGENT_ID,
    });

    const tenantIds = eligibleTenants.map((t) => t.tenant_id);
    for (const tid of tenantIds) {
      const tenantActions = supabase.actions.filter((a) => a.tenant_id === tid);
      const types = tenantActions.map((a) => a.action_type);
      expect(types).toContain('detected');
      expect(types).toContain('notice_generated');
      expect(types).toContain('notice_simulated');
    }
  });

  it('cases are in awaiting status after first run', async () => {
    const snowflake = new MockSnowflakeClient(mockTenants);
    const supabase = new MockSupabaseClient();

    await runDailyCycle(snowflake, supabase, {
      propertyId: 'brickell',
      thresholdDays: 5,
      sandbox: true,
      agentId: AGENT_ID,
    });

    for (const c of supabase.cases.values()) {
      expect(c.status).toBe('awaiting');
      expect(c.notice_sent_at).toBeDefined();
    }
  });

  it('sandbox mode is always true by default (no config.sandbox=false in tests)', async () => {
    const snowflake = new MockSnowflakeClient(mockTenants);
    const supabase = new MockSupabaseClient();

    await runDailyCycle(snowflake, supabase, {
      propertyId: 'brickell',
      thresholdDays: 5,
      sandbox: true, // explicitly true
      agentId: AGENT_ID,
    });

    for (const action of supabase.actions) {
      expect(action.sandbox_mode).toBe(true);
    }

    for (const c of supabase.cases.values()) {
      expect(c.sandbox_mode).toBe(true);
    }
  });

  it('idempotency: running twice on same day does not duplicate cases', async () => {
    const snowflake = new MockSnowflakeClient(mockTenants);
    const supabase = new MockSupabaseClient();

    const now = new Date('2026-03-20T08:00:00Z');

    const result1 = await runDailyCycle(snowflake, supabase, {
      propertyId: 'brickell',
      thresholdDays: 5,
      sandbox: true,
      agentId: AGENT_ID,
      nowOverride: now,
    });

    const result2 = await runDailyCycle(snowflake, supabase, {
      propertyId: 'brickell',
      thresholdDays: 5,
      sandbox: true,
      agentId: AGENT_ID,
      nowOverride: now, // same day, same time (within 48h window)
    });

    expect(result1.newCases).toBe(3);
    expect(result2.newCases).toBe(0);      // no new cases
    expect(result2.existingCases).toBe(3); // existing cases found, no escalation (<48h)
    expect(supabase.cases.size).toBe(3);   // still 3 cases, not 6
  });

  it('triggers escalation on second run after 48h have passed', async () => {
    const balances = new Map([
      ['T001', 2450.00], // still owed
      ['T002', 1800.00], // still owed
      ['T003', 3200.00], // still owed
    ]);
    const snowflake = new MockSnowflakeClient(mockTenants, balances);
    const supabase = new MockSupabaseClient();

    const day1 = new Date('2026-03-20T08:00:00Z');
    const day3 = new Date('2026-03-22T08:01:00Z'); // 48h+1min later

    // First run: create cases
    await runDailyCycle(snowflake, supabase, {
      propertyId: 'brickell',
      thresholdDays: 5,
      sandbox: true,
      agentId: AGENT_ID,
      nowOverride: day1,
    });

    // Second run: 48h later — should escalate all 3
    const result2 = await runDailyCycle(snowflake, supabase, {
      propertyId: 'brickell',
      thresholdDays: 5,
      sandbox: true,
      agentId: AGENT_ID,
      nowOverride: day3,
    });

    expect(result2.existingCases).toBe(3);
    expect(result2.escalated).toBe(3);
    expect(result2.resolved).toBe(0);
  });

  it('resolves cases on second run if balances are cleared', async () => {
    const balances = new Map([
      ['T001', 0],    // cleared
      ['T002', 0],    // cleared
      ['T003', 0],    // cleared
    ]);
    const snowflake = new MockSnowflakeClient(mockTenants, balances);
    const supabase = new MockSupabaseClient();

    const day1 = new Date('2026-03-20T08:00:00Z');
    const day3 = new Date('2026-03-22T09:00:00Z'); // 49h later

    await runDailyCycle(snowflake, supabase, {
      propertyId: 'brickell',
      thresholdDays: 5,
      sandbox: true,
      agentId: AGENT_ID,
      nowOverride: day1,
    });

    const result2 = await runDailyCycle(snowflake, supabase, {
      propertyId: 'brickell',
      thresholdDays: 5,
      sandbox: true,
      agentId: AGENT_ID,
      nowOverride: day3,
    });

    expect(result2.resolved).toBe(3);
    expect(result2.escalated).toBe(0);
  });

  it('skips tenants below threshold', async () => {
    const snowflake = new MockSnowflakeClient(mockTenants);
    const supabase = new MockSupabaseClient();

    await runDailyCycle(snowflake, supabase, {
      propertyId: 'brickell',
      thresholdDays: 5,
      sandbox: true,
      agentId: AGENT_ID,
    });

    // T004 (3 days) and T005 (on payment plan) should not have cases
    const caseIds = Array.from(supabase.cases.keys());
    expect(caseIds.some((k) => k.startsWith('T004'))).toBe(false);
    expect(caseIds.some((k) => k.startsWith('T005'))).toBe(false);
  });
});
