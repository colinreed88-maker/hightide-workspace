# Wade's Memory

## Memory Architecture
This file is a routing index. Detailed content lives in typed sub-files:
- `memory/people/` — people I work with (colin.md, ilan.md)
- `memory/systems/` — technical systems (openclaw.md, flow-data.md)
- `memory/projects/` — active projects (self-managed-building.md, 220-summer-street.md)
- `memory/lessons/` — lessons learned (learned.md)
- `memory/wip-state.md` — work in progress across sessions
- `memory/YYYY-MM-DD.md` — daily session logs

**2-minute rule**: if I spent >2 min generating something, write it down immediately.

---

## Property P&L — Key Mappings

Always use `prop_pnl_actuals` and `prop_pnl_budget` tables for property P&L questions. These feed the Portfolio P&L tab in Flow Intranet. Do NOT use raw Sage GL for property-level P&L.

Property key mappings:
- `society` → Society Las Olas → **Flow Fort Lauderdale (FFL)**
- `caoba` → Caoba Miami World Center → **Flow Miami** — always use `fmAdj` when Colin asks for Flow Miami performance
- `fmAdj` → **Flow Miami Adjusted** — the correct view for Flow Miami financials
- `brickell` → **Flow Brickell** — 3rd building in Miami
- G-West (entity E507) → **Flow House** — no financials yet

When Colin asks for "Flow Miami performance," always pull `fmAdj`, not `caoba`.

## Property P&L — Data Model

- `prop_pnl_actuals`: actuals AND budget by property. Key columns: `property`, `label`, `line_type` ('pnl' or 'kpi'), `is_subtotal`, `row_order`, `values` (actuals, jsonb array), `budget_values` (budget, jsonb array). Use `->` operator for 0-based array indexing.
- `prop_pnl_config`: contains `monthLabels` (actuals month index) and `budgetMonthLabels`
- As of March 2026: monthLabels index 56 = Jan 2026, index 57 = Feb 2026 (both available). Use `values->57` for Feb actuals.
- budgetMonthLabels index 0 = March 2026 (FY2026 Budget starts March 2026; only society and brickell have budget_values — fmAdj has none)

## OpCo vs Re_Ops Scope

In `fpa_pnl_monthly`, section = 'opco' covers: Executive, Tech, Growth & Revenue, F&B, Hotel, Shared Services.
Property Mgmt and owned-asset entities likely fall under 're_ops'.

## Sage GL Department Mapping

To map Sage GL departments to budget BUs, join:
`intacct_monthly_dept_balances` → `intacct_departments` (on department_id) → `dim_bu_mapping` (on title = source_identifier, source_system = 'sage')

`dim_fs_mapping` uses column `gl_account_number` (not `account_no`) and `financial_statement = 'Profit and Loss'` (not 'Income Statement').

## Close Status

As of March 2026: `mbr_last_closed_month` = 2026-01 (January 2026).

## Ramp Invoice Detail

When pulling Ramp bills, always try to retrieve the invoice PDF for line-item detail — hours, rates, employees, billing periods, project names. This is where the most useful information is. Use `retrieve_ramp_invoice` with the bill_id, then `pdf` tool on the download_url if available. Some invoices are not yet cached — Colin is working on getting all PDFs synced to storage.

## Colin's Preferences

- Colin is the Head of Strategic Finance at Flow (not "Flow Living" — company is Flow)
- When asking about a property, always pull from prop_pnl_actuals with the correct property key
- Flow properties: Flow Fort Lauderdale (FFL), Flow Miami, Flow Brickell, Flow House (no financials yet)

## All Hands — March 19, 2026

Colin is presenting "Embracing AI + New Finance AI Dashboard" (15 min) at the company All Hands on March 19. Presenting from NYC. Adam opens (10 min), AJ presents on AI Enablement (15 min), Colin follows (15 min), Daria covers AI in Marketing (15 min), Adam closes (10 min). Adam and AJ are in Miami.

## April 28 Demo — Self-Managed Building

Investor/partner demo on April 28 showcasing the self-managed building concept. Three-part structure:
1. Leasing loop (Charles) — prospect inquires at 2am, agent responds in 60s, books tour
2. Finance view (Wade) — live Q&A: Brickell NOI vs budget, top vendors, anomalies in 30 seconds
3. Building action (Eduardo + event bus) — one automated action visible in real time

Close line: "Every other real estate company is talking about this. We're already running it. At Brickell. Tonight."
Open question: who exactly is in the room and what story do they care about (investment, technology, or operational).

## Self-Managed Building PRD

PRD exists at `/data/workspace/self-managed-building-prd.md` — v0.1 Draft, March 2026.
- Pilot property: Flow Brickell
- Target: 40% fewer labor hours per unit by Q4 2026 while maintaining/improving NOI, resident NPS, lease renewal rate
- Phase 1 April (leasing loop), Phase 2 June (operations loop), Phase 3 Q4 (full building intelligence)
- Top three agent-ready tasks: prospect follow-up, lease renewal outreach, rent delinquency
- Open dependencies: Twilio (AJ/Tech), Opinion.com pipeline (Colin/Data), Deep Sky event bus write access (Scott ~2 weeks), Yardi write access

## Key Open Items (as of March 17)

- April 28 demo — clarify audience and angle
- OpenClaw employee rollout timeline — AJ resources needed
- Schedule call on AJ platform ownership/resourcing
- mammoth package → flow-intranet/package.json for native DOCX ingestion
- Brad needs AI spend forecast from AJ + Scott
- Anthropic API unblock — was "in process," not confirmed resolved
- AI Summit notes from Levi — not yet ingested
- Leasing agent project (Charles/Jason/Zach) — monitor progress

## Windows PC Node

Colin has a Windows PC. Discussed pairing it as an OpenClaw node for local desktop automation (Zoom, Granola, etc.). March 13 reminder passed — follow up when opportunity arises.

## Known Tool Issues

- `search_memories` tool has a persistent Supabase function conflict error ("Could not choose the best candidate function"). Use `memory_search` (file-based) or `memory_get` instead for reading MEMORY.md and memory/*.md.
- Google Calendar sync was failing March 13–18 with `invalid_grant`, but recovered as of 2026-03-18 10:00 UTC (78 events ingested successfully). Monitor to confirm it stays green.
