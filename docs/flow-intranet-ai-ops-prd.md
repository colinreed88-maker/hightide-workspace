# PRD: Flow Intranet — AI-Operated Development & Maintenance
**Version:** 0.1 Draft
**Date:** March 20, 2026
**Author:** Wade (Strategic Finance AI)
**Status:** Draft — for Colin Reed review

---

## 1. Problem Statement

The Flow Intranet is a living product. As the Strategic Finance team grows (Jackie, Ari joining March 24; Matt and Hamilton already active), the volume of data requests, new dashboard requirements, audit needs, and maintenance tasks will outpace any single person's capacity to handle manually.

Today:
- New page requests require Colin to spec, build, or ticket work manually
- Data quality issues (miscoded transactions, stale syncs, mapping gaps) are caught reactively — usually during an MBR when it's too late
- No systematic auditing of data accuracy across the 5+ source systems (Sage, Ramp, Toast, Rippling, Snowflake)
- The codebase has no agent-aware workflows — every change requires a human to initiate and review

The opportunity: deploy a small fleet of AI agents — orchestrated by Wade — to handle the full lifecycle of Intranet work: intake, spec, build, QA, deploy, and maintain.

---

## 2. Objective

Build an AI-operated development and maintenance loop for the Flow Intranet, such that:

1. **New page requests** from the finance team are triaged, specced, and built by Codex agents — reviewed and deployed by Wade with Colin's approval
2. **Data quality** is audited continuously — anomalies flagged before they surface in an MBR
3. **Maintenance** (sync failures, stale data, broken queries, mapping gaps) is detected and resolved automatically where safe, escalated where not
4. **The team can request what they need in plain English** — no eng tickets, no waiting

Target: reduce time from "I need a new view" to "it's live on the Intranet" from days to hours.

---

## 3. Scope

### In Scope

- New dashboard pages (finance, operations, property)
- Data audit automation (Ramp, Sage GL, Toast, headcount, Snowflake)
- Sync monitoring and failure detection
- BU/department mapping maintenance
- `/ask` improvements and knowledge base curation
- Codex agent orchestration via Wade

### Out of Scope (Phase 1)

- Authentication system changes
- External user access (non-@flow.life)
- Yardi write-back or Sage write-back
- Public-facing features

---

## 4. Current State Audit

### Existing Pages (as of March 2026)

**Finance & Reporting**
- `/finance` — FP&A consolidated P&L, headcount, vendor spend
- `/financials` — Sage Intacct P&L and GL drill-down
- `/mbr` + `/mbr/[scope]` — Monthly Business Review, actuals vs. forecast
- `/property-pnl` — Portfolio P&L by property
- `/sage-explorer` — Raw GL detail explorer
- `/headcount-explorer` — Rippling headcount by org/department

**Operations**
- `/fb-dashboard` — Toast POS F&B dashboard
- `/ramp` — Ramp vendor spend explorer
- `/te-detail` — T&E by route, department, traveler
- `/marketing-spend` — Marketing spend by channel and building

**Property & Leasing (Snowflake)**
- `/tenants` — Tenant roster, occupancy, rent roll
- `/pricing` — Rent pricing, renewals, loss to lease
- `/yardi-expenses` — Property-level Yardi transactions
- `/leasing` — Leasing activity and funnel
- `/work-orders` — Yardi work orders
- `/marketing-spend` — Marketing by channel/building

**Utilities**
- `/ask` — AI chat with RAG and multi-model support
- `/file-finder` — G-Drive index browser
- `/decks` — Slide decks
- `/workspaces` — Team workspaces (dj, matt, hamilton)
- `/hamilton/sankey` — Portfolio Sankey diagram

**Admin**
- `/admin` — User management, access control, impersonation
- `/ai-spend` — AI spend tracking
- `/debt` — Debt document browser
- `/software-spend` — Software vendor spend

### Data Sources

| Source | Sync | Tables | Owner |
|--------|------|--------|-------|
| Sage Intacct | Nightly 11:00 UTC | intacct_* | Colin |
| Ramp | Nightly 6:00 UTC | ramp_* | Colin |
| Toast POS | Nightly 10:00 UTC | toast_* | Colin |
| Rippling | Weekly | mbr_current_roster | Colin |
| Snowflake | Real-time query | ANALYTICS.* | Scott/Data |
| FPA (Excel) | Manual | fpa_* | Colin |

### Known Gaps (identified during audit)

- **T&E Detail**: No dedicated drill-down by employee across all trips in a single view
- **Brickell Lease-Up Dashboard**: Brickell is in active lease-up (44% occupied, 280/632 units). No dedicated page tracking weekly velocity, traffic-to-lease conversion, and revenue ramp
- **AI Spend Tracker**: `/ai-spend` exists but coverage unknown — needs audit
- **Cross-BU Variance Summary**: No single view showing all BUs vs. forecast in one table for quick MBR prep
- **Vendor Intelligence**: Ramp has vendor spend but no YoY comparison or anomaly flagging built into the UI
- **Headcount Delta View**: Headcount explorer shows current state; no "vs. prior month" or "vs. forecast" delta view
- **MENA Consolidation**: `/mena-property-performance` exists — needs coverage audit
- **Sync Health Dashboard**: No single view of all cron sync statuses — must check logs manually
- **Knowledge Base Staleness**: `/ask` depends on KB freshness; no audit of what's current vs. stale

---

## 5. Proposed Architecture

### 5.1 Intake Layer

**Channel:** `#strat-fin-only` Slack (current channel) or a dedicated `#intranet-requests` channel

**Flow:**
1. Team member describes what they need in plain English
2. Wade triages: Can it be answered via `/ask`? Is it a data query? Does it need a new page?
3. If new page: Wade produces a spec (see Section 5.2), confirms with Colin, spawns Codex agent
4. If data question: Wade answers directly or routes to existing Intranet page
5. If maintenance: Wade handles or escalates

### 5.2 Build Loop (Codex Agents)

When a new page is needed:

1. **Spec** — Wade produces a PRD-style spec: data source, query logic, page route, component structure, design system compliance (AGENTS.md conventions)
2. **Build** — Codex agent runs against `flow-intranet` repo with the spec as context
3. **QA** — Wade reviews the output: data accuracy, design system compliance, auth guard, loading state, `dynamic = "force-dynamic"` export
4. **PR** — Codex opens a PR; Wade summarizes changes for Colin
5. **Deploy** — Colin approves and merges; Vercel auto-deploys

**Codex agent context package (standard for every build):**
- CLAUDE.md (full project context)
- AGENTS.md (design system)
- Relevant existing page as reference implementation
- Wade's spec for the new page
- Data schema for the source tables

### 5.3 Data Audit Loop

**Frequency:** Daily (heartbeat), triggered on each MBR close

**Audit checks:**

| Check | Source | Threshold | Action |
|-------|--------|-----------|--------|
| Ramp sync freshness | ramp_sync_log | >25h since last success | Alert Colin |
| Toast sync freshness | toast_sync_log | >25h since last success | Alert Colin |
| Intacct sync freshness | intacct_sync_log | >25h since last success | Alert Colin |
| Large Ramp bills | ramp_bills | >$25K posted today | Alert Colin |
| BU mapping gaps | dim_bu_mapping | Unmapped dept in GL | Flag for correction |
| Dept actuals vs prior month | intacct_monthly_dept_balances | >50% variance | Flag for review |
| Headcount vs forecast | fpa_headcount_monthly | >10% delta | Flag for review |
| Toast zero-revenue location | toast_daily_sales | Location with $0 today | Alert (possible sync issue) |
| Brickell occupancy delta | Snowflake MULTIFAMILY | Week-over-week change | Weekly summary |

**Output:** Weekly data quality digest delivered to `#strat-fin-only`. Critical alerts sent immediately.

### 5.4 Knowledge Base Maintenance

- Wade audits `/ask` KB freshness monthly
- Identifies documents older than 90 days for review
- Flags knowledge gaps (questions `/ask` couldn't answer)
- Submits KB updates via the admin upload endpoint

### 5.5 Ongoing Maintenance Tasks

| Task | Trigger | Handler |
|------|---------|---------|
| Sync failure recovery | Cron alert | Wade retries via ingest tool |
| BU mapping correction | Unmapped dept detected | Wade flags to Colin with proposed mapping |
| Stale FPA data | Manual FPA update lag >7 days | Wade alerts Colin |
| New Intranet user onboarding | New @flow.life team member | Wade preps access checklist |
| MBR prep package | 2 days before MBR | Wade pulls actuals, flags anomalies, drafts variance summaries |

---

## 6. Immediate Build Queue (Phase 1 — March/April 2026)

These are the highest-priority new pages and improvements, sequenced for the new team onboarding:

### P0 — Before Jackie & Ari Start (March 24)

**1. Brickell Lease-Up Dashboard** (`/brickell-leaseup`)
- Weekly unit absorption rate (new leases signed vs. target)
- Occupancy trend: actual vs. pro forma
- Revenue ramp: actual vs. budget
- Traffic-to-lease conversion funnel
- Data: Snowflake MULTIFAMILY + prop_pnl_actuals
- Owner: Ari Sokolow primary audience

**2. Cross-BU MBR Summary** (enhancement to `/mbr`)
- Single table: all BUs, current month actuals vs. forecast, variance $, variance %
- One-click drill to department detail
- Export to CSV for MBR prep
- Data: fpa_dept_pnl_monthly + intacct_monthly_dept_balances

### P1 — Week of March 24

**3. Sync Health Dashboard** (`/admin/sync-health`)
- All cron sync statuses in one view
- Last run, status, records synced, error message
- Manual re-trigger button (admin only)
- Data: all *_sync_log tables

**4. Headcount Delta View** (enhancement to `/headcount-explorer`)
- Current headcount vs. prior month vs. forecast
- Adds/terms by department this month
- Data: mbr_current_roster + fpa_headcount_monthly

**5. Vendor Anomaly Alerts** (enhancement to `/ramp`)
- Week-over-week spend comparison by vendor
- Flag vendors with >50% increase vs. prior 4-week average
- Data: ramp_transactions + ramp_bills

### P2 — April

**6. MBR Prep Agent**
- Automated pre-MBR package: prior month actuals, top variances, headcount changes, Ramp top vendors
- Delivered to `#strat-fin-only` 48h before MBR
- Draft variance commentary for each BU

**7. Knowledge Base Audit Tool** (`/admin/kb-audit`)
- Document freshness tracker
- Gap analysis from `/ask` query logs (unanswered or low-confidence responses)
- Admin upload from this view

---

## 7. Agent Roles & Responsibilities

| Agent | Role | Tools |
|-------|------|-------|
| Wade | Orchestrator, spec writer, QA reviewer, data analyst | All Supabase/Snowflake tools, GitHub reader, email |
| Codex | Page builder, query writer, component developer | flow-intranet repo write access |
| Beckett (optional) | Architectural review of Codex PRs against 15 DeepSky learnings | GitHub PR review |

**Wade's standing responsibilities:**
- Triage all Intranet requests from `#strat-fin-only`
- Run daily data quality checks (heartbeat)
- Produce specs for all new pages before Codex builds
- Review all Codex PRs before Colin approves
- Maintain this PRD as pages ship

---

## 8. Success Metrics

| Metric | Baseline (March 2026) | Target (June 2026) |
|--------|----------------------|--------------------|
| Time from request to live page | ~1 week (manual) | <4 hours (agent loop) |
| Data quality issues caught before MBR | ~0% (reactive) | >80% (proactive) |
| Sync failure alert time | Hours/days | <30 minutes |
| New team member time-to-first-query | 2-3 days | Same day |
| Pages with automated audit coverage | 0 | All P0/P1 pages |

---

## 9. Risks & Dependencies

| Risk | Mitigation |
|------|-----------|
| Codex produces non-compliant UI | Wade QA step enforces AGENTS.md before PR approval |
| Data audit false positives annoy team | Tune thresholds over first 2 weeks; start with high-confidence signals only |
| Intranet repo access for Codex | Colin to confirm Codex has write access to colinreed88-maker/flow-intranet |
| Tool Claw not yet wired up | Phase 1 operates through existing Wade read-access only; write-back deferred to Phase 2 |
| FPA data relies on manual Excel uploads | Wade alerts Colin when FPA data is stale; cannot self-resolve |

---

## 10. Open Questions

1. Should Intranet requests come through `#strat-fin-only` or a dedicated `#intranet-requests` channel?
2. Does Codex currently have write access to the flow-intranet repo? If not, what's the provisioning path (AJ)?
3. Should Beckett be looped in on architectural PR reviews, or is Wade QA sufficient for now?
4. What's the PR approval flow — Colin approves all merges, or can Wade merge routine changes?
5. Is `/ai-spend` currently accurate? Needs audit before it becomes a reference for Brad's AI forecast.

---

## Appendix: Intranet Tech Stack Reference

- **Framework**: Next.js 15 (App Router) + TypeScript
- **Styling**: Tailwind CSS v4 (design tokens in globals.css)
- **Database**: Supabase (Postgres + pgvector) for all operational data
- **Analytics warehouse**: Snowflake ANALYTICS (property ops data)
- **Auth**: Google OAuth, @flow.life domain restriction
- **Deployment**: Vercel (auto-deploy on main branch merge)
- **Package manager**: pnpm v10 exclusively
- **Key constraint**: Every protected page must export `dynamic = "force-dynamic"` and call `checkPageAccessCached`
