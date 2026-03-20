# Flow Rent Delinquency Workflow Agent

An autonomous TypeScript agent that identifies delinquent tenants, generates notices, logs all actions immutably, and escalates to property managers when human judgment is needed.

**Phase 1: Sandbox prototype** — no real tenant communication.

---

## Architecture

```
Scheduler (cron 8AM ET)
        │
        ▼
Delinquency Agent
  1. Query Snowflake → past-due tenants
  2. Create/find case in Supabase (idempotent)
  3. Generate + simulate notice (sandbox: log only)
  4. After 48h: re-check balance
     - Cleared → resolve case
     - Still owed → post Slack escalation (sandbox: log only)
  5. Log every action to delinquency_actions (append-only)
        │
        ├── Snowflake (ANALYTICS.FINANCIAL.TENANT_ARREARS — read-only)
        └── Supabase (delinquency_cases + delinquency_actions)
```

---

## Setup

```bash
cp .env.example .env
# Fill in SUPABASE_URL, SUPABASE_SERVICE_KEY, Snowflake creds
npm install
npm run build
npm start
```

## Environment Variables

See [.env.example](./.env.example) for the full list.

Key variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `SANDBOX` | `true` | Must be explicitly `false` for production |
| `DELINQUENCY_THRESHOLD_DAYS` | `5` | Days past due before flagging |
| `DELINQUENCY_PROPERTY_ID` | `brickell` | Property to scan |
| `SUPABASE_URL` | — | Supabase project URL |
| `SUPABASE_SERVICE_KEY` | — | Supabase service role key |
| `SNOWFLAKE_ACCOUNT` | — | Snowflake account identifier |
| `SLACK_WEBHOOK_URL` | — | Slack incoming webhook URL |

---

## Database Migrations

Run migrations against your Supabase project:

```bash
# Via Supabase CLI
supabase db push

# Or manually via SQL editor:
# 1. migrations/001_create_delinquency_cases.sql
# 2. migrations/002_create_delinquency_actions.sql
```

---

## Running Tests

```bash
npm test               # run all tests
npm run test:watch     # watch mode
npm run test:coverage  # with coverage report
```

Tests use Vitest with fully mocked Snowflake and Supabase clients. No live credentials required.

---

## File Structure

```
delinquency-agent/
├── src/
│   ├── types.ts          # Shared TypeScript interfaces
│   ├── config.ts         # Env var loading (SANDBOX defaults true)
│   ├── snowflake.ts      # Snowflake client (real + mock)
│   ├── supabase.ts       # Supabase client (real + mock)
│   ├── notices.ts        # Notice template rendering
│   ├── slack.ts          # Slack escalation formatting + posting
│   ├── agent.ts          # Core agent logic (all sprints)
│   └── main.ts           # Entry point
├── tests/
│   ├── fixtures.ts           # Shared test data
│   ├── config.test.ts        # SANDBOX default tests
│   ├── queryDelinquentTenants.test.ts
│   ├── createCase.test.ts    # Idempotency tests
│   ├── generateNotice.test.ts
│   ├── logAction.test.ts
│   ├── checkEscalation.test.ts
│   ├── runDailyCycle.test.ts # E2E orchestration tests
│   └── slack.test.ts
├── migrations/
│   ├── 001_create_delinquency_cases.sql
│   └── 002_create_delinquency_actions.sql
├── .env.example
├── package.json
├── tsconfig.json
├── vitest.config.ts
└── README.md
```

---

## Safety Constraints

- `SANDBOX=true` is the default. The agent **cannot** set it to false.
- In sandbox mode: no SMS, no email, no real Slack posts — all simulated and logged.
- Action log is append-only (enforced by Supabase RLS).
- All Snowflake access is read-only.
- Idempotent: running twice on the same day produces no duplicate cases.

---

## Sprints

| Sprint | Status | Scope |
|--------|--------|-------|
| S0 | ✅ | Foundation: project scaffold, migrations, env vars |
| S1 | ✅ | Core detection loop: query, create case, notice, log |
| S2 | ✅ | Escalation loop: 48h check, resolve or escalate to Slack |
| S3 | 🔲 | Scheduler + Dashboard (flow-intranet) |
| S4 | 🔲 | Hardening + acceptance tests |
