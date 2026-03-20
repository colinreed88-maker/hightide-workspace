import { describe, it, expect } from 'vitest';
import { MockSupabaseClient } from '../src/supabase.js';
import { logAction } from '../src/agent.js';
import { AGENT_ID } from './fixtures.js';

describe('logAction', () => {
  it('writes an action with correct fields', async () => {
    const client = new MockSupabaseClient();
    const action = await logAction(
      client,
      'case-001',
      'T001',
      'detected',
      AGENT_ID,
      { balance_due: 2450.00, days_past_due: 7 },
      true
    );

    expect(action.case_id).toBe('case-001');
    expect(action.tenant_id).toBe('T001');
    expect(action.action_type).toBe('detected');
    expect(action.agent_id).toBe(AGENT_ID);
    expect(action.payload).toEqual({ balance_due: 2450.00, days_past_due: 7 });
    expect(action.sandbox_mode).toBe(true);
    expect(action.id).toBeDefined();
    expect(action.created_at).toBeDefined();
  });

  it('appends multiple actions (append-only)', async () => {
    const client = new MockSupabaseClient();

    await logAction(client, 'case-001', 'T001', 'detected', AGENT_ID, {}, true);
    await logAction(client, 'case-001', 'T001', 'notice_generated', AGENT_ID, {}, true);
    await logAction(client, 'case-001', 'T001', 'notice_simulated', AGENT_ID, {}, true);

    expect(client.actions.length).toBe(3);
    expect(client.actions.map((a) => a.action_type)).toEqual([
      'detected',
      'notice_generated',
      'notice_simulated',
    ]);
  });

  it('sandbox_mode is set correctly on the action', async () => {
    const client = new MockSupabaseClient();

    const sandboxAction = await logAction(client, 'c1', 'T001', 'detected', AGENT_ID, {}, true);
    expect(sandboxAction.sandbox_mode).toBe(true);
  });

  it('supports all action_type values', async () => {
    const client = new MockSupabaseClient();
    const types = [
      'detected',
      'notice_generated',
      'notice_simulated',
      'notice_sent',
      'balance_checked',
      'escalated',
      'resolved',
    ] as const;

    for (const type of types) {
      await logAction(client, 'c1', 'T001', type, AGENT_ID, {}, true);
    }

    expect(client.actions.length).toBe(types.length);
    expect(client.actions.map((a) => a.action_type)).toEqual(types);
  });
});
