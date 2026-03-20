-- Migration 002: Create delinquency_actions table
-- Append-only audit log. No UPDATE or DELETE permitted via RLS.
-- Every agent action writes one row here.

CREATE TABLE IF NOT EXISTS delinquency_actions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id       UUID REFERENCES delinquency_cases(id) ON DELETE RESTRICT,
  tenant_id     VARCHAR NOT NULL,
  action_type   VARCHAR NOT NULL,
  -- action_type values:
  --   detected           — tenant identified as past-due
  --   notice_generated   — notice text rendered
  --   notice_simulated   — sandbox: notice logged, not sent
  --   notice_sent        — production: notice sent via Twilio/SendGrid
  --   balance_checked    — re-check query at escalation window
  --   escalated          — Slack escalation posted (or simulated)
  --   resolved           — balance cleared, case closed
  agent_id      VARCHAR NOT NULL,
  payload       JSONB,
  sandbox_mode  BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT now()
  -- NO updated_at — this table is append-only
);

-- Index for case history lookups (dashboard action log drawer)
CREATE INDEX IF NOT EXISTS idx_delinquency_actions_case_id
  ON delinquency_actions (case_id, created_at DESC);

-- Index for tenant history across cycles
CREATE INDEX IF NOT EXISTS idx_delinquency_actions_tenant_id
  ON delinquency_actions (tenant_id, created_at DESC);

-- Row-level security: append-only enforcement
ALTER TABLE delinquency_actions ENABLE ROW LEVEL SECURITY;

-- Service role can INSERT only (no UPDATE, no DELETE)
CREATE POLICY "service_role_insert" ON delinquency_actions
  FOR INSERT TO service_role WITH CHECK (true);

-- Service role can SELECT (for dashboard reads)
CREATE POLICY "service_role_select" ON delinquency_actions
  FOR SELECT TO service_role USING (true);

-- Dashboard users can read
CREATE POLICY "authenticated_read" ON delinquency_actions
  FOR SELECT TO authenticated USING (true);

-- Explicit: no UPDATE policy means UPDATE is denied for all roles
-- Explicit: no DELETE policy means DELETE is denied for all roles
