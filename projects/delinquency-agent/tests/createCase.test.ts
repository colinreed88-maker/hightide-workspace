import { describe, it, expect } from 'vitest';
import { MockSupabaseClient } from '../src/supabase.js';
import { createCase } from '../src/agent.js';
import { mockTenants, CYCLE_DATE } from './fixtures.js';

describe('createCase', () => {
  it('creates a new case for a tenant', async () => {
    const client = new MockSupabaseClient();
    const tenant = mockTenants[0]; // T001

    const result = await createCase(client, tenant, 'brickell', CYCLE_DATE, true);

    expect(result.tenant_id).toBe('T001');
    expect(result.unit_id).toBe('101');
    expect(result.property_id).toBe('brickell');
    expect(result.cycle_date).toBe(CYCLE_DATE);
    expect(result.balance_due).toBe(2450.00);
    expect(result.days_past_due).toBe(7);
    expect(result.status).toBe('noticed');
    expect(result.sandbox_mode).toBe(true);
    expect(result.id).toBeDefined();
  });

  it('idempotency: calling twice with same tenant+date returns the same case', async () => {
    const client = new MockSupabaseClient();
    const tenant = mockTenants[0]; // T001

    const first = await createCase(client, tenant, 'brickell', CYCLE_DATE, true);
    const second = await createCase(client, tenant, 'brickell', CYCLE_DATE, true);

    expect(first.id).toBe(second.id);
    expect(client.cases.size).toBe(1); // Only one record
  });

  it('different cycle dates create separate cases', async () => {
    const client = new MockSupabaseClient();
    const tenant = mockTenants[0];

    const case1 = await createCase(client, tenant, 'brickell', '2026-03-20', true);
    const case2 = await createCase(client, tenant, 'brickell', '2026-03-21', true);

    expect(case1.id).not.toBe(case2.id);
    expect(client.cases.size).toBe(2);
  });

  it('different tenants on same date create separate cases', async () => {
    const client = new MockSupabaseClient();

    await createCase(client, mockTenants[0], 'brickell', CYCLE_DATE, true); // T001
    await createCase(client, mockTenants[1], 'brickell', CYCLE_DATE, true); // T002

    expect(client.cases.size).toBe(2);
  });

  it('sandbox_mode defaults to true in test', async () => {
    const client = new MockSupabaseClient();
    const result = await createCase(client, mockTenants[0], 'brickell', CYCLE_DATE, true);
    expect(result.sandbox_mode).toBe(true);
  });
});
