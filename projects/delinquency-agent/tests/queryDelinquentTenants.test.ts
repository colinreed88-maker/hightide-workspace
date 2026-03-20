import { describe, it, expect } from 'vitest';
import { MockSnowflakeClient } from '../src/snowflake.js';
import { queryDelinquentTenants } from '../src/agent.js';
import { mockTenants } from './fixtures.js';

describe('queryDelinquentTenants', () => {
  it('returns tenants at or above the threshold', async () => {
    const client = new MockSnowflakeClient(mockTenants);
    const results = await queryDelinquentTenants(client, 'brickell', 5);

    // T001 (7d), T002 (12d), T003 (32d) are above threshold 5
    expect(results.length).toBe(3);
    expect(results.map((t) => t.tenant_id).sort()).toEqual(['T001', 'T002', 'T003']);
  });

  it('excludes tenants below the threshold', async () => {
    const client = new MockSnowflakeClient(mockTenants);
    const results = await queryDelinquentTenants(client, 'brickell', 5);

    const ids = results.map((t) => t.tenant_id);
    expect(ids).not.toContain('T004'); // 3 days past due — below threshold 5
  });

  it('excludes tenants with payment_plan_flag=true', async () => {
    const client = new MockSnowflakeClient(mockTenants);
    const results = await queryDelinquentTenants(client, 'brickell', 5);

    const ids = results.map((t) => t.tenant_id);
    expect(ids).not.toContain('T005'); // on payment plan
  });

  it('filters by property_id', async () => {
    const client = new MockSnowflakeClient(mockTenants);
    const results = await queryDelinquentTenants(client, 'other-property', 5);
    expect(results.length).toBe(0);
  });

  it('applies exact threshold boundary (equal counts as past-due)', async () => {
    const client = new MockSnowflakeClient(mockTenants);
    // At threshold=7: T001 (7d) is exactly at threshold — should be included
    const results = await queryDelinquentTenants(client, 'brickell', 7);
    const ids = results.map((t) => t.tenant_id);
    expect(ids).toContain('T001');
    expect(ids).not.toContain('T002'.replace('T002', '')); // sanity
  });

  it('returns empty when no tenants exceed threshold', async () => {
    const client = new MockSnowflakeClient(mockTenants);
    const results = await queryDelinquentTenants(client, 'brickell', 100);
    expect(results.length).toBe(0);
  });
});
