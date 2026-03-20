# WIP State — Wade

Last updated: 2026-03-20 (second overnight learning session — 12:25 PM UTC)

## Active Projects

### Flow Intranet (flow-intranet repo)
- MBR page, Ramp spend, F&B, Property P&L pages all live
- Next: DeepSky integration as data source (post-April)

### FPA Model
- Supabase-based financial planning and analysis
- Budget vs forecast vs actuals running
- Last closed month: February 2026 (advanced 2026-03-18)

### Monthly Business Review
- Department-level P&L actuals vs forecast
- Colin's primary reporting deliverable

### OpenClaw / Wade
- This assistant platform
- Skills-based architecture validated by industry convergence
- Future: MCP connectors to DeepSky, Snowflake

---

## What I Know (as of 2026-03-20)

### System Knowledge
- DeepSky full architecture documented → `memory/systems/deepsky-architecture.md`
- Flow property portfolio (13 properties) → `memory/projects/flow-portfolio.md`
- Supabase schema (95 tables) → `memory/systems/supabase-schema.md`
- Flow data systems (Snowflake IDs, GL joins) → `memory/systems/flow-data.md`
- OpenClaw multi-claw architecture → `memory/systems/openclaw.md`

### People Knowledge
- G&R org: Charles Myslinsky leads all G&R. Jason Bernstein = Dir of Residential Revenue Mgmt. AJ Nead = AI Czar + PM. → `memory/people/gnr-org.md`
- MENA org: Fawaz Farooqui = MD. Khalid Bajnaid = Dir of BD (MENA). Victor Barrero = Head of Leasing B2C (MENA). Hamilton Merrill = Colin's direct report in Strategic Finance (NOT MENA). → `memory/people/mena-org.md`
- Colin: `memory/people/colin.md`
- Ilan (Uso): `memory/people/ilan.md`

### Architecture Lessons
- MCP vs Skills: not competing, complementary. Skills for procedures; MCP for external system connections. → `memory/lessons/mcp-vs-skill-files.md`
- Agent failure modes: 7 categories, core pattern is cascade from early errors. Kill criteria framework documented. → `memory/lessons/learned.md` + `memory/lessons/agent-failure-modes.md`

### #openclaw-hangout Community
- Active multi-claw architecture debate (Uso/Beckett/Claw 25)
- Skills manifest protocol being designed → belongs in OpenClaw repo, not Big Brain
- Wade should monitor this channel for architecture insights

---

## File Housekeeping

The following files are SUPERSEDED — newer, authoritative versions exist:
- `memory/systems/deepsky.md` → superseded by `deepsky-architecture.md`
- `memory/systems/deepsky-notes.md` → gap file, superseded by `deepsky-architecture.md`
- `memory/systems/deepsky-gap.md` → gap file, superseded by `deepsky-architecture.md`
- `memory/projects/flow-building-portfolio.md` → superseded by `flow-portfolio.md`
- `memory/projects/flow-properties.md` → superseded by `flow-portfolio.md`
- `memory/projects/flow-portfolio-gap.md` → gap file, superseded by `flow-portfolio.md`
- `memory/projects/portfolio-notes.md` → superseded by `flow-portfolio.md`
- `memory/people/flow-gnr-org.md` → superseded by `gnr-org.md`
- `memory/people/flow-mena-org.md` → superseded by `mena-org.md`
- `memory/lessons/mcp-vs-skills.md` → superseded by `mcp-vs-skill-files.md`

---

## Pending / To Watch

- **DeepSky MCP server** debugging (launched Mar 11) — when stable, evaluate for Wade integration
- **Smart Agreements ACES V2 Phase 1** — Brickell sandbox, end of March. Watch #proj-smart-agreements.
- **AI Summit hackathons** (Marketing, Property Accounting, Buildings) — outcomes relevant to Wade's capabilities
- **G-West** — development project with active OAC meetings. Location and scope not yet confirmed. Ask Colin.
- **Winwood acquisition** — pending as of March 10, $3.5M placeholder. Follow up on status.
- **Block E** — refinance/sale decision pending after short-term funding window. Ask Colin.

---

## Key Data Quick Reference

- Close status: February 2026 closed (advanced 2026-03-18)
- Active employees: ~346 (from mbr_current_roster)
- Flow Brickell Yardi ID: FLWBRCKLL (property DID: 4875a65e11a1f987c22dab5e65238a26)
- MBR closed month: 2026-02
- OpCo section filter: section = 'opco' for Executive/Tech/G&R/F&B/Hotel/Shared Services; 're_ops' for Property Mgmt/owned assets
- For Flow Miami financials: always use fmAdj, not caoba
