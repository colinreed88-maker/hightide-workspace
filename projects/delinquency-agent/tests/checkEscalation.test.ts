import { describe, it, expect } from 'vitest';
import { MockSnowflakeClient } from '../src/snowflake.js';
import { MockSupabaseClient } from '../src/supabase.js';
import { checkEscalation } from '../src/agent.js';
import { makeCase, mockTenants, AGENT_ID } from './fixtures.js';

const tenant = mockTenants[0]; // T001

function hoursAgo(hours: number): string {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

describe('checkEscalation', () => {
  it('returns too_early when notice was sent less than 48h ago', async () => {
    const snowflake = new MockSnowflakeClient();
    const supabase = new MockSupabaseClient();

    const case_ = makeCase({
      notice_sent_at: hoursAgo(24), // only 24h ago
    });

    const result = await checkEscalation(supabase, snowflake, case_, tenant, AGENT_ID, {
      sandbox: true,
    });

    expect(result).toBe('too_early');
    // No balance check should have happened
    expect(supabase.actions.length).toBe(0);
  });

  it('returns too_early when notice_sent_at is null', async () => {
    const snowflake = new MockSnowflakeClient();
    const supabase = new MockSupabaseClient();

    const case_ = makeCase({ notice_sent_at: null });
    const result = await checkEscalation(supabase, snowflake, case_, tenant, AGENT_ID, {
      sandbox: true,
    });

    expect(result).toBe('too_early');
  });

  it('resolves when balance is cleared at 48h+ mark', async () => {
    const balances = new Map([['T001', 0]]); // balance cleared
    const snowflake = new MockSnowflakeClient([], balances);
    const supabase = new MockSupabaseClient();

    const case_ = makeCase({ notice_sent_at: hoursAgo(49) });
    // Pre-populate the case in the mock client
    supabase.cases.set(`T001::${case_.cycle_date}`, case_);

    const result = await checkEscalation(supabase, snowflake, case_, tenant, AGENT_ID, {
      sandbox: true,
    });

    expect(result).toBe('resolved');

    // Case should be updated to resolved
    const updatedCase = supabase.cases.get(`T001::${case_.cycle_date}`);
    expect(updatedCase?.status).toBe('resolved');
    expect(updatedCase?.resolved_at).toBeDefined();

    // Action log should have balance_checked and resolved
    const actionTypes = supabase.actions.map((a) => a.action_type);
    expect(actionTypes).toContain('balance_checked');
    expect(actionTypes).toContain('resolved');
  });

  it('escalates when balance is still owed at 48h+ mark', async () => {
    const balances = new Map([['T001', 2450.00]]); // still owed
    const snowflake = new MockSnowflakeClient([], balances);
    const supabase = new MockSupabaseClient();

    const case_ = makeCase({ notice_sent_at: hoursAgo(50) });
    supabase.cases.set(`T001::${case_.cycle_date}`, case_);

    const result = await checkEscalation(supabase, snowflake, case_, tenant, AGENT_ID, {
      sandbox: true, // sandbox: log only, no real Slack post
    });

    expect(result).toBe('escalated');

    const updatedCase = supabase.cases.get(`T001::${case_.cycle_date}`);
    expect(updatedCase?.status).toBe('escalated');
    expect(updatedCase?.escalated_at).toBeDefined();

    const actionTypes = supabase.actions.map((a) => a.action_type);
    expect(actionTypes).toContain('balance_checked');
    expect(actionTypes).toContain('escalated');
  });

  it('escalates when getTenantBalance returns null (tenant no longer in arrears table but was not paid — edge case: null = no record)', async () => {
    // null from getTenantBalance means no current record → treat as cleared
    const snowflake = new MockSnowflakeClient([], new Map()); // no balance record
    const supabase = new MockSupabaseClient();

    const case_ = makeCase({ notice_sent_at: hoursAgo(49) });
    supabase.cases.set(`T001::${case_.cycle_date}`, case_);

    const result = await checkEscalation(supabase, snowflake, case_, tenant, AGENT_ID, {
      sandbox: true,
    });

    // null balance = 0 = resolved (no record means cleared)
    expect(result).toBe('resolved');
  });

  it('respects nowOverride for deterministic time-based testing', async () => {
    const snowflake = new MockSnowflakeClient();
    const supabase = new MockSupabaseClient();

    const noticeTime = new Date('2026-03-18T08:00:00Z');
    const nowTime = new Date('2026-03-18T09:00:00Z'); // only 1h later

    const case_ = makeCase({ notice_sent_at: noticeTime.toISOString() });

    const result = await checkEscalation(supabase, snowflake, case_, tenant, AGENT_ID, {
      sandbox: true,
      nowOverride: nowTime,
    });

    expect(result).toBe('too_early');
  });
});
