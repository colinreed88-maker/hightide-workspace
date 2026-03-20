// fixtures.ts — shared test data

import type { TenantArrears, DelinquencyCase } from '../src/types.js';

export const mockTenants: TenantArrears[] = [
  {
    tenant_id: 'T001',
    unit_id: '101',
    property_id: 'brickell',
    tenant_name: 'Alice Johnson',
    balance_due: 2450.00,
    days_past_due: 7,
    payment_plan_flag: false,
    as_of_date: '2026-03-20',
  },
  {
    tenant_id: 'T002',
    unit_id: '205',
    property_id: 'brickell',
    tenant_name: 'Bob Martinez',
    balance_due: 1800.00,
    days_past_due: 12,
    payment_plan_flag: false,
    as_of_date: '2026-03-20',
  },
  {
    tenant_id: 'T003',
    unit_id: '310',
    property_id: 'brickell',
    tenant_name: 'Carol Davis',
    balance_due: 3200.00,
    days_past_due: 32,
    payment_plan_flag: false,
    as_of_date: '2026-03-20',
  },
  // Below threshold — should NOT be returned
  {
    tenant_id: 'T004',
    unit_id: '402',
    property_id: 'brickell',
    tenant_name: 'Dan Thompson',
    balance_due: 1500.00,
    days_past_due: 3,
    payment_plan_flag: false,
    as_of_date: '2026-03-20',
  },
  // On payment plan — should NOT be returned
  {
    tenant_id: 'T005',
    unit_id: '501',
    property_id: 'brickell',
    tenant_name: 'Eve Wilson',
    balance_due: 2100.00,
    days_past_due: 10,
    payment_plan_flag: true,
    as_of_date: '2026-03-20',
  },
];

export const CYCLE_DATE = '2026-03-20';
export const AGENT_ID = 'test-agent-v1';

export function makeCase(overrides: Partial<DelinquencyCase> = {}): DelinquencyCase {
  return {
    id: 'case-001',
    tenant_id: 'T001',
    unit_id: '101',
    property_id: 'brickell',
    cycle_date: CYCLE_DATE,
    balance_due: 2450.00,
    days_past_due: 7,
    status: 'awaiting',
    notice_sent_at: new Date(Date.now() - 49 * 60 * 60 * 1000).toISOString(), // 49h ago
    sandbox_mode: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}
