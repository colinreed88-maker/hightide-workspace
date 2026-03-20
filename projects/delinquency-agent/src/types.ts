// types.ts — shared types for the delinquency agent

// Raw row from ANALYTICS.FINANCIAL.TENANT_ARREARS (Snowflake actual schema)
export interface TenantArrearsRaw {
  TENANT_ID: number;
  TENANT_CODE: string;
  TENANT_FIRST_NAME: string;
  TENANT_LAST_NAME: string;
  UNIT_ID: number;
  UNIT_CODE: string;
  PROPERTY_ID: number;
  PROPERTY_NAME: string;
  TENANT_STATUS: string;
  THIRTY_DAY_PAST_DUE: number;
  SIXTY_DAY_PAST_DUE: number;
  NINETY_DAY_PAST_DUE: number;
  OVER_NINETY_DAY_PAST_DUE: number;
  ONE_TWENTY_DAYS_PAST_DUE: number;
  DATE_TS: string;
}

// Normalized tenant record used throughout the agent
export interface TenantArrears {
  tenant_id: string;
  unit_id: string;
  property_id: string;
  tenant_name: string;
  balance_due: number;          // sum of all aging buckets
  days_past_due: number;        // derived: earliest non-zero bucket midpoint
  payment_plan_flag?: boolean;  // not in source schema — defaults to false
  as_of_date?: string;
}

export type CaseStatus = 'noticed' | 'awaiting' | 'escalated' | 'resolved';

export interface DelinquencyCase {
  id: string;
  tenant_id: string;
  unit_id: string;
  property_id: string;
  cycle_date: string;          // ISO date string: YYYY-MM-DD
  balance_due: number;
  days_past_due: number;
  status: CaseStatus;
  notice_sent_at?: string | null;
  escalated_at?: string | null;
  resolved_at?: string | null;
  sandbox_mode: boolean;
  created_at?: string;
  updated_at?: string;
}

export type ActionType =
  | 'detected'
  | 'notice_generated'
  | 'notice_simulated'
  | 'notice_sent'
  | 'balance_checked'
  | 'escalated'
  | 'resolved';

export interface DelinquencyAction {
  id?: string;
  case_id: string;
  tenant_id: string;
  action_type: ActionType;
  agent_id: string;
  payload?: Record<string, unknown>;
  sandbox_mode: boolean;
  created_at?: string;
}

export interface AgentConfig {
  propertyId: string;
  thresholdDays: number;
  sandbox: boolean;
  agentId: string;
  slackWebhookUrl?: string;
  dashboardBaseUrl?: string;
  propertyName?: string;
  propertyPhone?: string;
  paymentUrl?: string;
}
