# MCP vs Skill Files — Wade's Perspective

Research date: 2026-03-20
Sources: tty4.dev, friedrichs-it.de, ravichaganti.com, dev.to/phil-whittaker, #openclaw-hangout Slack, AI Summit notes

---

## What Each Is

### Model Context Protocol (MCP)
- Full protocol specification with three-tier Client-Host-Server architecture
- Uses JSON-RPC 2.0 communication
- Designed to connect agents to **external systems**: databases, APIs, SaaS tools, file systems, cloud services
- When client connects: calls `tools/list` to discover → LLM decides when to call `tools/call`
- Strong isolation and credential management (server boundaries)
- Standards-based, deterministic, structured
- Open-sourced by Anthropic in November 2024; became industry standard in 2025
- Gained progressive discovery in January 2026 (removed Skills' context efficiency advantage)

### Agent Skills (Skill Files)
- Simple Markdown files + optional scripts in a folder structure (SKILL.md + resources/ + scripts/)
- No protocol implementation required — just a Markdown file the agent reads
- Designed for **procedural knowledge**: how to do something, workflow instructions, adaptive context
- Works as "ephemeral clouds of knowledge" LLMs pull from as needed
- Released as open standard by Anthropic in December 2025
- This is exactly what OpenClaw uses: /openclaw/skills/*/SKILL.md
- Independent convergence: Cursor found "MCP + skills bundled together much more powerful than MCPs alone"

---

## The Debate

**Competing?** No. **Complementary?** Yes.

The framing "MCP vs skills" is a false binary. They solve different problems:

| Dimension | MCP | Skills |
|---|---|---|
| Purpose | Connect to external systems | Package procedural knowledge |
| Format | Full protocol (JSON-RPC) | Markdown file |
| Isolation | Strong (server boundaries) | Weak (runs in agent context) |
| Credentials | Managed at server level | Not handled |
| Best for | External APIs, databases, SaaS | Workflows, instructions, context |
| Discovery | Protocol-level `tools/list` | Agent reads the file |
| Complexity | High | Low |

---

## Wade's View (Flow Context)

**For Flow's current stack:**

Skills are the right choice for:
- How to analyze a department P&L
- How to draft a board memo
- How to format Telegram messages
- How to interpret Ramp data
- Procedural SOPs that require judgment

MCP is the right choice for:
- Connecting to DeepSky (once the MCP server is production-ready)
- Snowflake data warehouse access
- Sage Intacct GL queries
- Any new external system that needs deterministic, typed access

**The practical conclusion:**
Wade should continue using SKILL.md files for behavioral/procedural knowledge. As DeepSky matures, the path forward is MCP connectors to the graph — not trying to encode DeepSky access patterns in skill files.

The AI Summit notes confirm this: "MCP server launched this morning, debugging in progress" — Flow is already moving in this direction.

**On OpenClaw's architecture:**
The #openclaw-hangout debate shows the community is converging on: Skills for agent personality/procedures + MCP for structured external tool access. This is also what the broader industry found (Cursor's discovery). OpenClaw's SKILL.md pattern is validated.

**Security consideration:**
Skills have weak isolation (run in agent context, no credential management). Never put credentials, tokens, or sensitive config in skill files. Use MCP servers for anything requiring auth to external systems.

---

## Timeline
- Nov 2024: MCP open-sourced by Anthropic
- Dec 2025: Agent Skills released as open standard
- Jan 2026: MCP gains progressive discovery
- Mar 2026: Flow's DeepSky MCP server launched (in debugging)
