# Technical Design: Rent Delinquency Workflow Agent
**Version:** 0.1  
**Date:** March 2026  

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                  Scheduler (cron)                    │
│              Daily @ 8:00 AM ET                      │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│            Delinquency Agent (OpenClaw)              │
│                                                      │
│  1. Query Snowflake → identify past-due tenants      │
│  2. Check workflow state → skip already-notified     │
│  3. Generate notices → log to action table           │
│  4. (Sandbox) Log simulated send                     │
│  5. (Production) Send via Twilio/SendGrid            │
│  6. After 48h: re-check balance → escalate or close  │
└──────┬───────────────────────────────────────────────┘
       │                            │
       ▼                            ▼
┌─────────────┐            ┌────────────────────┐
│  Snowflake  │            │  Supabase          │
│  (read-only)│            │  delinquency_cases │
│  TENANT_    │            │  delinquency_      │
│  ARREARS    │            │  actions           │
└─────────────┘            └────────────────────┘
                                    │
                                    ▼
                           ┌────────────────────┐
                           │  flow-intranet     │
                           │  Dashboard         │
                           └────────────────────┘
```

---

## 2. Data Model

### 2.1 Snowflake (read-only)
```sql
-- Source table (actual schema — confirmed March 2026)
ANALYTICS.FINANCIAL.TENANT_ARREARS
  PROPERTY_ID               INTEGER
  PROPERTY_NAME             VARCHAR
  TENANT_ID                 INTEGER
  TENANT_CODE               VARCHAR
  TENANT_FIRST_NAME         VARCHAR
  TENANT_LAST_NAME          VARCHAR
  TENANT_STATUS             VARCHAR   -- 'Current' | 'Past' | etc
  UNIT_ID                   INTEGER
  UNIT_CODE                 VARCHAR
  THIRTY_DAY_PAST_DUE       DECIMAL   -- balance 1-30 days past due
  SIXTY_DAY_PAST_DUE        DECIMAL   -- balance 31-60 days past due
  NINETY_DAY_PAST_DUE       DECIMAL   -- balance 61-90 days past due
  OVER_NINETY_DAY_PAST_DUE  DECIMAL   -- balance 91-120 days past due
  ONE_TWENTY_DAYS_PAST_DUE  DECIMAL   -- balance 120+ days past due
  DATE_TS                   TIMESTAMPTZ  -- last updated

-- NOTE: No single balance_due or days_past_due column.
-- Agent normalizes: balance_due = sum of all buckets
-- Agent derives: days_past_due = earliest non-zero bucket (30/60/90/91/120)
-- NOTE: No payment_plan_flag in source — agent defaults to false
-- Filter active tenants only: TENANT_STATUS = 'Current'
```

### 2.2 Supabase (read/write)

```sql
-- Workflow state per tenant per cycle
CREATE TABLE delinquency_cases (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         VARCHAR NOT NULL,
  unit_id           VARCHAR NOT NULL,
  property_id       VARCHAR NOT NULL,
  cycle_date        DATE NOT NULL,           -- date the cycle was initiated
  balance_due       DECIMAL(10,2) NOT NULL,
  days_past_due     INTEGER NOT NULL,
  status            VARCHAR NOT NULL,        -- 'noticed' | 'awaiting' | 'escalated' | 'resolved'
  notice_sent_at    TIMESTAMPTZ,
  escalated_at      TIMESTAMPTZ,
  resolved_at       TIMESTAMPTZ,
  sandbox_mode      BOOLEAN NOT NULL DEFAULT true,
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now(),
  UNIQUE (tenant_id, cycle_date)             -- idempotency key
);

-- Append-only action log
CREATE TABLE delinquency_actions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id       UUID REFERENCES delinquency_cases(id),
  tenant_id     VARCHAR NOT NULL,
  action_type   VARCHAR NOT NULL,   -- 'detected' | 'notice_generated' | 'notice_sent' | 'notice_simulated' | 'balance_checked' | 'escalated' | 'resolved'
  agent_id      VARCHAR NOT NULL,
  payload       JSONB,              -- notice text, balance snapshot, etc.
  sandbox_mode  BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT now()
);
```

---

## 3. Agent Logic (Pseudocode)

```python
def run_delinquency_cycle(property_id: str, sandbox: bool = True):
    today = date.today()
    threshold_days = int(os.getenv("DELINQUENCY_THRESHOLD_DAYS", 5))

    # Step 1: Query past-due tenants
    arrears = snowflake.query("""
        SELECT tenant_id, unit_id, tenant_name, balance_due, days_past_due
        FROM ANALYTICS.FINANCIAL.TENANT_ARREARS
        WHERE property_id = %s
          AND days_past_due >= %s
          AND balance_due > 0
          AND (payment_plan_flag IS NULL OR payment_plan_flag = false)
          AND as_of_date = CURRENT_DATE
    """, [property_id, threshold_days])

    for tenant in arrears:
        # Step 2: Idempotency check
        existing = supabase.select("delinquency_cases")
            .eq("tenant_id", tenant.tenant_id)
            .eq("cycle_date", today)
            .execute()

        if existing.data:
            # Already processed this cycle — check for escalation
            case = existing.data[0]
            if case["status"] == "awaiting":
                check_escalation(case, tenant, sandbox)
            continue

        # Step 3: Create case
        case = supabase.insert("delinquency_cases", {
            "tenant_id": tenant.tenant_id,
            "unit_id": tenant.unit_id,
            "property_id": property_id,
            "cycle_date": today,
            "balance_due": tenant.balance_due,
            "days_past_due": tenant.days_past_due,
            "status": "noticed",
            "sandbox_mode": sandbox
        })

        # Step 4: Generate notice
        notice_text = render_notice_template(tenant)

        # Step 5: Send or simulate
        if sandbox:
            log_action(case.id, tenant.tenant_id, "notice_simulated", {
                "notice_text": notice_text,
                "reason": "sandbox_mode"
            }, sandbox=True)
        else:
            twilio.send_sms(tenant.phone, notice_text)
            log_action(case.id, tenant.tenant_id, "notice_sent", {
                "notice_text": notice_text,
                "channel": "sms"
            }, sandbox=False)

        # Update case status
        supabase.update("delinquency_cases", case.id, {
            "status": "awaiting",
            "notice_sent_at": now()
        })


def check_escalation(case: dict, tenant: Tenant, sandbox: bool):
    hours_since_notice = (now() - case["notice_sent_at"]).total_seconds() / 3600

    if hours_since_notice < 48:
        return  # Too early

    # Re-check balance
    current_balance = snowflake.query("""
        SELECT balance_due FROM ANALYTICS.FINANCIAL.TENANT_ARREARS
        WHERE tenant_id = %s AND as_of_date = CURRENT_DATE
    """, [tenant.tenant_id])

    if not current_balance or current_balance[0]["balance_due"] <= 0:
        # Resolved
        supabase.update("delinquency_cases", case["id"], {
            "status": "resolved",
            "resolved_at": now()
        })
        log_action(case["id"], tenant.tenant_id, "resolved", {
            "reason": "balance_cleared"
        }, sandbox=sandbox)
    else:
        # Escalate
        slack.post_escalation(case, tenant, current_balance[0]["balance_due"])
        supabase.update("delinquency_cases", case["id"], {
            "status": "escalated",
            "escalated_at": now()
        })
        log_action(case["id"], tenant.tenant_id, "escalated", {
            "current_balance": current_balance[0]["balance_due"],
            "days_since_notice": round(hours_since_notice / 24, 1)
        }, sandbox=sandbox)
```

---

## 4. Notice Template

```
Hi {tenant_name},

This is a reminder that your rent payment of ${balance_due} for unit {unit_id} 
is {days_past_due} days past due.

Please submit payment at: {payment_url}

If you have already submitted payment or have questions, please contact 
the leasing office at {property_phone}.

Thank you,
Flow Residential
```

---

## 5. Slack Escalation Message Format

```
🔴 Delinquency Escalation — {property_name}

Tenant: {tenant_name} — Unit {unit_id}
Balance: ${balance_due} ({days_past_due} days past due)
Notice sent: {notice_sent_at}
No response in 48 hours.

Action log: {dashboard_link}

React ✅ to acknowledge | 🔒 to mark resolved
```

---

## 6. Environment Variables

```env
SANDBOX=true                          # MUST be explicitly set to false for production
DELINQUENCY_THRESHOLD_DAYS=5
DELINQUENCY_PROPERTY_ID=brickell
DELINQUENCY_SCHEDULE_CRON=0 8 * * *   # 8 AM daily
PM_SLACK_CHANNEL=#property-brickell
TWILIO_ACCOUNT_SID=                   # sandbox: leave blank
TWILIO_AUTH_TOKEN=                    # sandbox: leave blank
TWILIO_FROM_NUMBER=                   # sandbox: leave blank
SNOWFLAKE_ACCOUNT=
SNOWFLAKE_USER=
SNOWFLAKE_PASSWORD=
SNOWFLAKE_DATABASE=ANALYTICS
SNOWFLAKE_SCHEMA=FINANCIAL
SUPABASE_URL=
SUPABASE_SERVICE_KEY=
```

---

## 7. API Endpoints (Dashboard Integration)

```
GET  /api/delinquency/cases?property_id=brickell&status=escalated
GET  /api/delinquency/cases/:id/actions
POST /api/delinquency/cases/:id/resolve
GET  /api/delinquency/summary?property_id=brickell
```

---

## 8. Security Considerations

- Snowflake access is read-only via a dedicated service account
- `SANDBOX=false` requires explicit operator action — cannot be set by the agent itself
- Tenant PII (name, unit, balance) is stored in Supabase but not logged to Slack in full — Slack messages use case IDs with dashboard links
- Action log is append-only at the database level (row-level security, no DELETE)
