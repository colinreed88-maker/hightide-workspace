# DeepSky — Architecture & Integration Notes
*Sourced from #openclaw-hangout Slack (March 18, 2026) — Beckett (Scott Ryder's bot) briefing*
*Updated March 20, 2026 — Third overnight pass*

## What DeepSky Is

DeepSky is Flow's **core platform** — the architectural foundation underneath Flow's entire property management suite. It is not a standalone app for residents or operators; it powers everything else.

- **Waves** = operator-facing UI (being wired to DeepSky)
- **Lighthouse** = resident-facing UI (being wired to DeepSky)
- **Beckett** = Scott Ryder's (CTO) AI assistant bot, which monitors DeepSky progress

DeepSky is Flow's long-term platform bet. All existing products are being migrated onto it.

---

## Architecture

### One Graph to Rule Them All
- **Core Graph** — models physical reality: buildings, units, people, agreements, time
- **Financial Graph** — models business reality: transactions, accounts, ledgers
- These are the **same graph** — every dollar knows why it was spent AND earned
- Uses universal "Primitives" (graph nodes): a building, unit, person, lease
- Nodes inherit from each other: unit → building → portfolio (configuration inheritance via graph traversal)
- ~35K physical nodes, 30K context nodes (in dev as of March 2026)

### Event-Driven Architecture
- Services communicate via **NATS event streams** — no fragile point-to-point API calls
- 69 context classes: 20 materialized in the graph, 49 NATS-only
- Services subscribe to what they care about; graph is source of truth

### Smart Agreements (ACES V2)
- Leases are executable, not static PDFs
- Defines: WHO pays WHAT to WHOM under WHAT CONDITIONS at WHAT TIME
- Charge codes flow to ledger automatically
- **Phase 1 targeting end of March for Brickell sandbox**
- #proj-smart-agreements tracks this work

### AI Query Layer — DeepDive
- `search2/cypher` — run Cypher queries directly against the graph (Memgraph backend)
- `search2/mcp` — MCP-compatible endpoint for tool access
- `search_nats`, `list_nats_streams` — AI agent can subscribe to NATS directly
- Dev endpoint: `api.us.dev.deepsky.life/deepdive/v1/`
- Auth: Flow JWT with staff scope
- **Key capability:** AI can pull a "subgraph" for a unit — current resident, lease terms, open work orders, payment history, recent events — all in one graph query

---

## Current Status (March 2026)

| Item | Status |
|---|---|
| Core Graph (physical nodes) | Live, ~35K nodes |
| NATS event streams | Live |
| DeepDive MCP API | Live (debugging in progress as of March 11 AI Summit) |
| Smart Agreements ACES V2 | Brickell sandbox target end of March |
| Waves/Lighthouse integration | In progress, module by module |
| Yardi cutover | Post-April |
| DEEPSKY_PROPERTY_ID in Snowflake | Column exists, all null (integration scaffolding) |

---

## Why DeepSky Matters for Wade

The "synthesis gap" is what DeepSky solves. From operator discovery interviews (summarized by Uso in #openclaw-hangout):
- Eyad had a $100K+ water damage incident — every signal was in Yardi, Zendesk, and work orders, but never connected
- Jason (GnR) spends 4-6 hrs/week on manual data assembly for renewals (50% data cleanliness)
- Pattern detection across work orders ("slow burn" signals before big failures) not possible today

DeepSky fixes this at the infrastructure level. When the graph has all of it, AI can reason across all of it simultaneously.

**Pre-migration reality (today):** Wade is still querying Yardi (via Snowflake), Sage (GL), Ramp, and Supabase as separate systems. That's the current stack. DeepSky integration for Wade is a post-April concern.

---

## People

- **Scott Ryder** — CTO, driving DeepSky's architecture and technical vision
- **Beckett** — Scott's AI assistant bot (monitors Confluence, GitHub, JIRA, Slack; prepares briefings)
- **Ilan Stern** — leading AI/agent work at Flow (Uso = his bot)
- **AJ Nead** — promoted to lead AI democratization department (per AI Summit)
- **OneFlow project** — tracks what's live on DeepSky sprint-by-sprint

---

## Related Memory
- Portfolio: memory/projects/flow-portfolio.md
- Multi-claw architecture: memory/systems/openclaw.md
- MCP vs skills debate: memory/lessons/mcp-vs-skill-files.md
