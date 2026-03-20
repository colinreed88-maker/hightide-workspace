# PRD: Rent Delinquency Workflow Agent
**Version:** 0.1 Draft  
**Date:** March 2026  
**Status:** Sandbox Prototype  

---

## 1. Overview

Build an autonomous agent that identifies delinquent tenants, generates notices, logs all actions, and escalates to a property manager only when human judgment is required. The initial phase is sandbox-only — no real tenant contacts are made.

---

## 2. Problem Statement

Today, rent delinquency follow-up is entirely manual. A property manager must:
- Log into Yardi/Snowflake to identify past-due accounts
- Manually draft and send notices
- Track responses in a spreadsheet or email
- Escalate internally based on personal judgment

This takes 2–4 hours per property per week and is inconsistently executed. Late follow-up means longer resolution cycles and higher delinquency rates.

---

## 3. Goals

- Automate the identification, notice generation, and escalation loop for delinquent accounts
- Reduce PM time spent on routine delinquency follow-up by 80%
- Create a fully auditable log of every action taken
- Surface only unresolved, escalated cases to human PMs
- Prototype in sandbox first; no real tenant communication in Phase 1

---

## 4. Non-Goals (Phase 1)

- Sending real SMS/email to tenants (sandbox simulation only)
- Integration with payment portals
- Legal notice generation (pay-or-quit, eviction filings)
- Multi-property rollout (single property: Flow Brickell)

---

## 5. Users

| User | Role | Need |
|------|------|------|
| Property Manager | Receives escalations | See only cases needing human action; full audit trail |
| VP of Operations | Oversight | Dashboard visibility into delinquency trends |
| Finance (Colin) | Reporting | Arrears aging data, actuals vs prior period |

---

## 6. User Stories

**US-01:** As a property manager, I want to receive a notification only when a tenant has not responded to an automated notice after 48 hours, so I can focus my time on genuine problem cases.

**US-02:** As a property manager, I want to see the full history of what the agent did for each tenant (notice sent, timestamp, response status) before I intervene.

**US-03:** As a finance team member, I want the dashboard to show current delinquency exposure by property, aging bucket, and trend vs. prior month.

**US-04:** As an operator, I want all agent actions logged immutably so there is an audit trail for any dispute.

**US-05:** As a developer, I want the system to run entirely in sandbox mode until explicitly enabled for production, so there is no risk of accidental tenant contact.

---

## 7. Functional Requirements

### 7.1 Delinquency Detection
- FR-01: Agent queries `ANALYTICS.FINANCIAL.TENANT_ARREARS` daily at 8:00 AM property local time
- FR-02: Flag tenants with balance > $0 and days past due >= configurable threshold (default: 5 days)
- FR-03: Segment by aging bucket: 5–14 days, 15–30 days, 30+ days
- FR-04: Skip tenants with an active payment plan flag

### 7.2 Notice Generation
- FR-05: Generate a notice for each newly flagged tenant using a templated message
- FR-06: Notice includes: tenant name, unit, amount owed, due date, payment instructions (sandbox: placeholder URL)
- FR-07: In sandbox mode, log the notice text to the action log — do NOT send
- FR-08: In production mode (future), send via Twilio SMS and/or SendGrid email
- FR-09: Mark notice as "sent" (or "simulated" in sandbox) in the workflow state table

### 7.3 Response Tracking
- FR-10: After 48 hours, re-query arrears to check if balance has been cleared
- FR-11: If balance cleared: mark case as resolved, log resolution
- FR-12: If balance not cleared: escalate to property manager

### 7.4 Escalation
- FR-13: Escalation = post a structured Slack message to the property manager's channel
- FR-14: Escalation message includes: tenant name, unit, amount, days past due, notice history, link to case log
- FR-15: PM can mark case as "acknowledged" or "resolved" via Slack reaction or dashboard action

### 7.5 Audit Log
- FR-16: Every action written to `delinquency_actions` table with: tenant_id, action_type, timestamp, agent_id, payload, sandbox_mode flag
- FR-17: Log is append-only — no updates or deletes
- FR-18: Dashboard reads from this log for case history display

---

## 8. Non-Functional Requirements

- NFR-01: Agent run completes within 60 seconds for up to 500 tenant accounts
- NFR-02: All credentials injected via environment variables — never hardcoded
- NFR-03: Sandbox mode is the default; production mode requires explicit `SANDBOX=false` env flag
- NFR-04: All Snowflake queries are read-only
- NFR-05: System must be idempotent — running twice on the same day must not duplicate notices

---

## 9. Dashboard Changes

### New Components
- **Delinquency Summary Card:** Total exposure ($), # of accounts, WoW trend
- **Aging Breakdown:** Bar chart — 5–14d / 15–30d / 30+d buckets
- **Case Feed:** Live list of active cases with status (noticed, awaiting response, escalated, resolved)
- **Action Log Drawer:** Click any case → see full agent action history

### Existing Components (Modified)
- Property P&L tab: Add delinquency line to revenue section
- MBR: Add arrears aging table to monthly close output

---

## 10. Acceptance Criteria

| ID | Criteria | Verified By |
|----|----------|-------------|
| AC-01 | Agent runs on schedule and queries Snowflake without error | Automated test |
| AC-02 | Tenants below threshold are not flagged | Unit test |
| AC-03 | In sandbox mode, no external messages are sent | Integration test |
| AC-04 | Action log receives one entry per action with correct fields | Unit test |
| AC-05 | Escalation fires after 48h with no balance change | E2E test with mocked time |
| AC-06 | Running agent twice on same day produces no duplicate entries | Idempotency test |
| AC-07 | Dashboard delinquency card renders with live data | E2E UI test |
| AC-08 | Dashboard case feed shows correct status for each case | E2E UI test |
| AC-09 | Sandbox flag defaults to true | Config test |

---

## 11. Open Questions

- OQ-01: What is the correct past-due threshold for Flow Brickell? (default: 5 days)
- OQ-02: Who is the PM escalation contact at Brickell?
- OQ-03: Does Snowflake `TENANT_ARREARS` include payment plan flags?
- OQ-04: Twilio — is AJ provisioning a sandbox number or using an existing one?
- OQ-05: Dashboard — which repo? flow-intranet. Which page? Property P&L or new standalone page?
