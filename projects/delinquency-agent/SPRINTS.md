# Sprint Plan: Rent Delinquency Workflow Agent
**Target:** Working sandbox prototype at Flow Brickell  
**Demo deadline:** April 28, 2026  

---

## Sprint 0 — Foundation (2 days)
*Goal: repo, env, database, and Snowflake query confirmed working*

| # | Task | Owner | Done When |
|---|------|-------|-----------|
| S0-1 | Create repo `flow-delinquency-agent` | Coding agent | Repo exists, README committed |
| S0-2 | Set up Supabase tables: `delinquency_cases`, `delinquency_actions` | Coding agent | Tables created, migrations committed |
| S0-3 | Validate Snowflake query against `TENANT_ARREARS` | Coding agent | Query returns expected schema, sample data logged |
| S0-4 | Configure environment variables (sandbox defaults) | Coding agent | `.env.example` committed, local run succeeds |
| S0-5 | Basic project scaffold (TypeScript or Python, TBD) | Coding agent | `npm run start` or `python main.py` executes without error |

---

## Sprint 1 — Core Detection Loop (3 days)
*Goal: agent detects delinquent tenants, creates cases, logs actions — all in sandbox*

| # | Task | Owner | Done When |
|---|------|-------|-----------|
| S1-1 | Implement `queryDelinquentTenants()` with threshold filter | Coding agent | Unit test: 5 tenants above threshold returned, 0 below |
| S1-2 | Implement `createCase()` with idempotency check | Coding agent | Unit test: second call with same tenant+date returns existing case |
| S1-3 | Implement `generateNotice()` with template rendering | Coding agent | Unit test: output matches expected format for mock tenant |
| S1-4 | Implement `simulateNoticeSend()` (sandbox mode) | Coding agent | Action log receives `notice_simulated` entry with correct payload |
| S1-5 | Implement `logAction()` append-only write | Coding agent | Unit test: insert succeeds; update/delete rejected by RLS |
| S1-6 | Wire full daily cycle end-to-end | Coding agent | E2E test: 3 mock tenants → 3 cases created → 3 actions logged |

---

## Sprint 2 — Escalation Loop (2 days)
*Goal: 48-hour re-check, escalation to Slack, resolution detection*

| # | Task | Owner | Done When |
|---|------|-------|-----------|
| S2-1 | Implement `checkEscalation()` with mocked time | Coding agent | Unit test: case with notice_sent_at = now()-49h triggers escalation |
| S2-2 | Implement balance re-query logic | Coding agent | Unit test: cleared balance → resolved; nonzero → escalates |
| S2-3 | Implement Slack escalation message | Coding agent | Integration test: message posted to test channel with correct fields |
| S2-4 | Implement `resolveCase()` on balance clear | Coding agent | Unit test: status transitions to `resolved`, `resolved_at` set |
| S2-5 | E2E test: full lifecycle (detect → notice → 48h → escalate) | Coding agent | Passes with mocked Snowflake + Slack responses |

---

## Sprint 3 — Scheduler + Dashboard (3 days)
*Goal: runs on cron, dashboard shows live data*

| # | Task | Owner | Done When |
|---|------|-------|-----------|
| S3-1 | Implement cron scheduler (8 AM daily) | Coding agent | Cron fires on schedule in dev, confirmed by log timestamp |
| S3-2 | Dashboard: Delinquency Summary Card (total $, # accounts, WoW) | Coding agent | Card renders with live Supabase data |
| S3-3 | Dashboard: Aging Breakdown chart (3 buckets) | Coding agent | Chart renders with correct bucket distribution |
| S3-4 | Dashboard: Case Feed with status column | Coding agent | Feed shows all cases, status filters work |
| S3-5 | Dashboard: Action Log Drawer (click case → history) | Coding agent | Drawer opens, shows ordered action history |
| S3-6 | Dashboard: Property P&L — add delinquency line | Coding agent | Line appears in revenue section with correct value |

---

## Sprint 4 — Hardening + Acceptance Tests (2 days)
*Goal: all acceptance criteria pass, ready for demo*

| # | Task | Owner | Done When |
|---|------|-------|-----------|
| S4-1 | Idempotency test: run agent twice, verify no duplicates | Coding agent | AC-06 passes |
| S4-2 | Sandbox flag test: verify `SANDBOX=true` default | Coding agent | AC-09 passes |
| S4-3 | Performance test: 500 tenant accounts under 60s | Coding agent | NFR-01 passes |
| S4-4 | Full acceptance criteria sweep (AC-01 through AC-09) | Coding agent | All 9 ACs green |
| S4-5 | Load demo data for April 28 sandbox presentation | Human | 3–5 realistic mock tenant cases visible in dashboard |
| S4-6 | Documentation: README, deployment guide, env var reference | Coding agent | README complete, tested by fresh install |

---

## Testing Strategy

### Unit Tests
- `queryDelinquentTenants()` — threshold filtering, payment plan exclusion
- `generateNotice()` — template rendering with edge cases (missing fields)
- `createCase()` — idempotency, field validation
- `logAction()` — append-only enforcement
- `checkEscalation()` — time-based trigger logic with mocked clock

### Integration Tests
- Snowflake → agent query pipeline (read-only, test schema)
- Supabase write pipeline (cases + actions)
- Slack message formatting and delivery (test channel)

### End-to-End Tests
- Full cycle: mock tenants → detection → notice simulation → 48h check → escalation
- Idempotency: run twice on same mock data → verify no duplicates
- Resolution path: balance clears → case resolves without escalation

### UI Tests (Playwright)
- Dashboard delinquency card renders with expected values
- Case feed filters by status
- Action log drawer opens and displays history
- Property P&L delinquency line is visible

---

## Definition of Done

A sprint is done when:
1. All tasks in the sprint are complete
2. All new code has unit tests with >80% coverage
3. No open critical bugs
4. Code is committed to main and CI passes
5. Acceptance criteria for the sprint are verified

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| `TENANT_ARREARS` schema differs from assumed | Medium | High | Validate in Sprint 0 before building |
| Snowflake payment_plan_flag missing | Medium | Medium | Query without it; add manual exclusion list |
| Twilio not available for Phase 2 | Low | Low | Sandbox simulation is sufficient for demo |
| Dashboard scope creep delays Sprint 3 | Medium | Medium | Cap dashboard to 4 components; defer MBR integration |
