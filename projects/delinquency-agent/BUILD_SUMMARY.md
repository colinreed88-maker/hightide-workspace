# Build Summary — Flow Rent Delinquency Workflow Agent

**Date:** 2026-03-20  
**Status:** ✅ All tests passing

---

## What Was Built

A complete TypeScript/Node.js delinquency workflow agent covering Sprints 0, 1, and 2.

### Sprint 0 — Foundation
- `package.json` with npm scripts (start, build, test, test:watch, test:coverage)
- `tsconfig.json` with strict TypeScript config targeting ES2022/ESNext modules
- `vitest.config.ts` for unit testing
- `.env.example` with all environment variables documented
- `migrations/001_create_delinquency_cases.sql` — cases table with RLS, idempotency constraint, indexes
- `migrations/002_create_delinquency_actions.sql` — append-only action log with RLS (INSERT only, no UPDATE/DELETE)

### Sprint 1 — Core Detection Loop
- `src/types.ts` — shared TypeScript interfaces for all domain objects
- `src/config.ts` — env var loading; SANDBOX defaults to `true`, never overridable by the agent
- `src/snowflake.ts` — `SnowflakeClient` interface, `MockSnowflakeClient` (tests), `RealSnowflakeClient` (prod), factory
- `src/supabase.ts` — `SupabaseClient` interface, `MockSupabaseClient` (tests), `RealSupabaseClient` (prod), factory
- `src/notices.ts` — `generateNotice()` template renderer, `logSimulatedNotice()`
- `src/agent.ts` — `queryDelinquentTenants()`, `createCase()`, `generateNoticeText()`, `simulateNoticeSend()`, `logAction()`, `runDailyCycle()`

### Sprint 2 — Escalation Loop
- `src/slack.ts` — `formatSlackEscalation()`, `postSlackEscalation()` (sandbox: console log only)
- `src/agent.ts` — `checkEscalation()`: re-queries balance at 48h window, resolves or escalates; wired into `runDailyCycle()`

### Entry Point
- `src/main.ts` — reads config, creates clients, runs daily cycle

---

## Test Results

**52 tests / 52 passed / 0 failed** (Vitest 1.6.1)

```
Test Files  8 passed (8)
     Tests  52 passed (52)
  Duration  ~1s
```

| Test File | Tests | Coverage |
|-----------|-------|----------|
| config.test.ts | 6 | SANDBOX default, threshold, property defaults |
| queryDelinquentTenants.test.ts | 6 | Threshold filter, payment plan exclusion, property filter, boundary |
| createCase.test.ts | 5 | New case creation, idempotency (same tenant+date → 1 record), multi-tenant |
| generateNotice.test.ts | 10 | Template fields, formatting, singular/plural days, defaults |
| logAction.test.ts | 4 | Fields written, append-only, sandbox_mode, all action_type values |
| checkEscalation.test.ts | 6 | <48h = too_early, 48h+cleared = resolved, 48h+balance = escalated, nowOverride |
| runDailyCycle.test.ts | 8 | 3 tenants→3 cases, action counts, awaiting status, idempotency, escalation at 48h, resolution, below-threshold skip |
| slack.test.ts | 7 | Property name, tenant info, balance, days past due, dashboard link, emoji, 48h context |

---

## File Structure

```
delinquency-agent/
├── src/
│   ├── types.ts              # TenantArrears, DelinquencyCase, DelinquencyAction, AgentConfig
│   ├── config.ts             # loadConfig() — SANDBOX defaults true
│   ├── snowflake.ts          # SnowflakeClient, MockSnowflakeClient, RealSnowflakeClient
│   ├── supabase.ts           # SupabaseClient, MockSupabaseClient, RealSupabaseClient
│   ├── notices.ts            # generateNotice(), logSimulatedNotice()
│   ├── slack.ts              # formatSlackEscalation(), postSlackEscalation()
│   ├── agent.ts              # All core agent functions + runDailyCycle()
│   └── main.ts               # Entry point
├── tests/
│   ├── fixtures.ts
│   ├── config.test.ts
│   ├── queryDelinquentTenants.test.ts
│   ├── createCase.test.ts
│   ├── generateNotice.test.ts
│   ├── logAction.test.ts
│   ├── checkEscalation.test.ts
│   ├── runDailyCycle.test.ts
│   └── slack.test.ts
├── migrations/
│   ├── 001_create_delinquency_cases.sql
│   └── 002_create_delinquency_actions.sql
├── .env.example
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── README.md
└── BUILD_SUMMARY.md
```

---

## Key Design Decisions

1. **SANDBOX=true is the default** — `loadConfig()` returns `sandbox=true` unless `SANDBOX=false` is explicitly set. The agent never sets `sandbox=false` in code.

2. **Injected clients** — all functions accept `SnowflakeClient` and `SupabaseClient` interfaces, enabling full mock-based testing with no live credentials.

3. **Idempotency** — `createCase()` uses Supabase upsert with `UNIQUE(tenant_id, cycle_date)`. `runDailyCycle()` also calls `findOpenCase()` to detect prior-cycle awaiting cases, preventing duplicate case creation when a new cycle runs before the first one resolves.

4. **Append-only action log** — `delinquency_actions` table has no UPDATE RLS policy, enforcing append-only at the database level.

5. **Time injection** — `checkEscalation()` and `runDailyCycle()` accept a `nowOverride?: Date` parameter, making all time-based logic fully testable without real clock dependencies.

---

## Blockers / Open Items

1. **npm install broken in this environment** — `npm install` creates empty placeholder directories for scoped packages but does not write files. Workaround: use `pnpm install` (available at `/usr/local/bin/pnpm`). All scripts updated to use `pnpm exec vitest`. The `npm run test` script works if pnpm is in PATH.

2. **Snowflake SDK not installed** — `snowflake-sdk` is an optional dependency (not in package.json). `RealSnowflakeClient` uses dynamic import at runtime. Add `snowflake-sdk` to dependencies when connecting to real Snowflake.

3. **Sprint 3 not built** — Scheduler (cron) and dashboard (flow-intranet) components are out of scope for this sprint. Next steps: add `node-cron` dependency, build `/api/delinquency/*` endpoints, and wire into the intranet dashboard.

4. **TENANT_ARREARS schema** — `payment_plan_flag` existence in the real table is unconfirmed (OQ-03). The mock and query handle `null` gracefully (treated as `false`), so this is a low-risk concern.
