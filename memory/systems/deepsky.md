# DeepSky — Architectural Learnings

Source: #openclaw-hangout Slack, 2026-03-18. Via Beckett (Scott Ryder's work bot).
Written: 2026-03-20 overnight learning session.

---

## What Is DeepSky?

DeepSky is **Flow's core platform** — the architectural foundation under all Flow property management products. It is not a standalone app that operators or residents interact with directly. It powers:
- **Waves** — the operator-facing product
- **Lighthouse** — the resident-facing product

It is Flow's long-term platform bet. Everything is being migrated onto it.

Scott Ryder is Flow's CTO and is the primary driver of DeepSky's architecture and vision.

---

## Why It Matters: The Competitive Moat

Yardi, RealPage, Entrata = relational databases with a UI bolted on.
DeepSky = a **knowledge graph that understands property management as connected reality**.

Not an incremental improvement. A different species.

---

## Core Architecture

### 1. One Connected Graph (Not Two Systems)
Most PMS: operations in one module, financials in another. Constant reconciliation headaches.

DeepSky has:
- **Core Graph**: models reality — buildings, units, people, agreements, time
- **Financial Graph**: models the business — transactions, accounts, ledgers

These are the **same graph**. Every dollar knows why it was spent AND why it was earned.

### 2. Primitives, Not Tables
Instead of rigid database tables, DeepSky uses universal **Primitives** — nodes in the graph representing real things (a building, a unit, a person, a lease).

Configuration and context live ON the graph and can be walked/harvested for inheritance:
- Unit inherits rules from its building
- Building inherits from its portfolio

Elegant. Flexible. Composable.

### 3. Smart Agreements (Executable Leases)
Leases in DeepSky are not static PDFs. They are executable:
- WHO pays WHAT to WHOM under WHAT CONDITIONS at WHAT TIME
- Operators define clause types and templates; the system runs them
- Charge codes flow through to the ledger automatically
- New fee type? Add a charge code and mapping. Done.

### 4. Event-Driven Architecture (NATS)
Services communicate via **NATS event streams** — no fragile service-to-service API spaghetti.
- Services subscribe to what they care about
- The graph is the source of truth
- Events are how the system stays consistent

### 5. AI-Native
Because everything is in one connected graph (operations, financials, agreements, time), AI can reason across ALL of it simultaneously.

Example: "Which units are underperforming and why?" — trace from vacancy → pricing → concessions → ledger entries. No other PMS can do that.

---

## Open Questions (For AI Tooling Build)

These questions determine whether AI tooling should be built on top of DeepSky or as a parallel data layer:

1. **Subgraph pull API**: Can an AI agent request "give me everything connected to Unit 4B: current resident, lease terms, open work orders, payment history, recent events" in a single call?

2. **NATS event access for AI**: Can an AI agent subscribe to NATS events directly? (e.g., "alert me when a work order for a unit has 3+ reopen events within 30 days")

3. **April timeline**: What is actually blocking the Yardi cutover? Data migration? Missing feature parity? Operational readiness?

4. **Waves + Lighthouse status**: Already running on DeepSky in production, or still being ported?

---

## Build Decision Context

**Before April (Yardi cutover):** Must build AI tooling against the fragmented stack — Yardi + Zendesk + Google Sheets + Slack. This means a parallel data layer that aggregates from the current stack.

**After April:** DeepSky becomes the source of truth. AI builds on top of it directly.

The answer to the open questions above changes the architecture significantly.

---

## The Synthesis Gap (Validated Use Case)

Flow operators and GMs consistently cited the **synthesis gap**: signals scattered across Yardi, Zendesk, Slack, work orders that never get connected.

Real example: A $100K+ water damage incident where every signal was in the system — just never stitched together. No human connected the dots across 4 tools in time.

DeepSky's graph architecture solves this at the infrastructure level. The synthesis gap is not a feature request — it is the reason DeepSky exists.

---

## Key People

- **Scott Ryder** — Flow CTO. Driving DeepSky architecture and technical vision.
- **Beckett** — Scott Ryder's work bot (AI assistant); source of this architecture briefing.
- **Ilan Stern** — Building AI tooling for Flow; asking the right architectural questions about whether to build on top of DeepSky or build a parallel data layer during the migration period.
