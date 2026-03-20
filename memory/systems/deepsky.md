# DeepSky — Architecture & Learnings

Source: #openclaw-hangout Slack (Mar 18–19, 2026), AI Summit notes (Mar 11, 2026)
Primary source: Beckett (Scott Ryder's AI assistant — Scott is Flow's CTO)

---

## What DeepSky Is

DeepSky is Flow's core property management platform — built as a **knowledge graph**, not a relational database.

The core thesis: Yardi, RealPage, Entrata are relational databases with a UI bolted on. DeepSky is a knowledge graph that understands property management as connected reality.

---

## Architecture

### The Graph
- **Core Graph:** Models reality — buildings, units, people, agreements, time
- **Financial Graph:** Models the business — transactions, accounts, ledgers
- These are the **same graph**. Every dollar knows why it was spent AND why it was earned.
- Built on **Memgraph** (graph database engine)
- ~35K physical nodes, 30K context nodes (as of Mar 2026 dev environment)

### Primitives
- Universal nodes representing real things: building, unit, person, lease, agreement
- Configuration and context live ON the graph
- Inheritance: unit inherits rules from building, building from portfolio
- No rigid table schema — "Primitives, Not Tables"

### Event-Driven Architecture
- **NATS** event streams as communication backbone
- Services subscribe to what they care about
- Graph = source of truth; NATS = consistency mechanism
- 69 context fclasses total: 20 materialized in graph, 49 NATS-only
- Agents CAN subscribe directly via `search_nats` / `list_nats_streams` MCP tools

### Smart Agreements (ACES V2)
- Leases as executable code, not static PDFs
- Structure: WHO pays WHAT to WHOM under WHAT CONDITIONS at WHAT TIME
- Operators define clause types and templates; system runs them
- Charge codes flow through to the ledger automatically
- New fee type = add charge code + mapping → done
- **Phase 1 target:** End of March 2026, Brickell sandbox

### Products Built on DeepSky
- **Waves** — operator-facing UI (being wired up to DeepSky; not fully migrated)
- **Lighthouse** — resident-facing UI (same status)
- **OneFlow project** tracks what's live sprint-by-sprint

---

## API Access

### DeepDive API
- Base URL: `api.us.dev.deepsky.life/deepdive/v1/`
- Stage environment also available
- Auth: Flow JWT (staff scope)
- Endpoints:
  - `search2/cypher` — run Cypher queries directly against Memgraph
  - `search2/mcp` — MCP-compatible endpoint for tool-based access
  - Text search, advanced search, schema introspection

### MCP Server
- DeepSky MCP server launched March 11, 2026 (in debugging as of AI Summit)
- Target: company-wide access ~1 month after launch
- Read access first (lowest risk), write through business-shaped APIs
- Three access tiers planned with security models

### For AI Agents
- Subgraph pull: Yes — can query graph for everything connected to a unit (resident, lease, work orders, payment history, recent events)
- NATS subscription: Yes — via DeepDive MCP tools
- Pre-migration (pre-April): Build adapters/connectors to legacy systems (Yardi, Zendesk)

---

## Current State (March 2026)

- DEEPSKY_PROPERTY_ID = null for all Snowflake properties → migration in progress
- Yardi is still system of record for US properties
- DeepSky cutover post-April 2026
- Smart Agreements V2 Phase 1: Brickell, end of March (first production milestone)

---

## Key People

| Person | Role | Connection |
|---|---|---|
| Scott Ryder | CTO, Flow | Driving DeepSky architecture |
| Beckett | Scott's AI assistant | Has full architectural context |
| Ilan Stern | ? | Leading AI tooling on DeepSky |
| Beckett reference to "Ralph" | Platform engineer | Handles infra/ops |
| Punit Shah | ? | Manages DeepSky releases |
| Anjali Munasinghe | ? | Monolith hotfixes |

---

## Why It Matters for Wade

DeepSky is the future data layer for everything Wade touches — occupancy, leasing, financials, work orders, agreements. Once migration is complete:
- One graph query instead of separate Snowflake + Yardi + Sage calls
- AI can reason across operations AND financials simultaneously
- Smart Agreements mean lease/charge queries are real-time and executable

For now (March 2026): Snowflake, Yardi via Snowflake, and Sage remain the primary data sources.

---

## The Synthesis Gap (Core Problem)
Beckett's summary of why DeepSky exists: $100K+ water damage incident at a Flow property. Every signal was in the system (Yardi, Zendesk, Slack, work orders) but never stitched together. DeepSky IS the stitching.
