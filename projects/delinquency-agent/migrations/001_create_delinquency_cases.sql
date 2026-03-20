-- Migration 001: Create delinquency_cases table
-- Workflow state per tenant per billing cycle.
-- UNIQUE(tenant_id, cycle_date) enforces idempotency — agent can run twice safely.

CREATE TABLE IF NOT EXISTS delinquency_cases (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         VARCHAR NOT NULL,
  unit_id           VARCHAR NOT NULL,
  property_id       VARCHAR NOT NULL,
  cycle_date        DATE NOT NULL,
  balance_due       DECIMAL(10,2) NOT NULL,
  days_past_due     INTEGER NOT NULL,
  status            VARCHAR NOT NULL DEFAULT 'noticed',  -- noticed | awaiting | escalated | resolved
  notice_sent_at    TIMESTAMPTZ,
  escalated_at      TIMESTAMPTZ,
  resolved_at       TIMESTAMPTZ,
  sandbox_mode      BOOLEAN NOT NULL DEFAULT true,
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now(),
  UNIQUE (tenant_id, cycle_date)
);

-- Index for dashboard queries by property + status
CREATE INDEX IF NOT EXISTS idx_delinquency_cases_property_status
  ON delinquency_cases (property_id, status);

-- Index for escalation loop (find awaiting cases older than 48h)
CREATE INDEX IF NOT EXISTS idx_delinquency_cases_status_notice
  ON delinquency_cases (status, notice_sent_at);

-- Auto-update updated_at on row change
CREATE OR REPLACE FUNCTION update_delinquency_cases_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER delinquency_cases_updated_at
  BEFORE UPDATE ON delinquency_cases
  FOR EACH ROW EXECUTE FUNCTION update_delinquency_cases_updated_at();

-- Row-level security: service role bypasses; all others read-only
ALTER TABLE delinquency_cases ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (via SUPABASE_SERVICE_KEY)
CREATE POLICY "service_role_full_access" ON delinquency_cases
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Allow authenticated users to read (for dashboard)
CREATE POLICY "authenticated_read" ON delinquency_cases
  FOR SELECT TO authenticated USING (true);
