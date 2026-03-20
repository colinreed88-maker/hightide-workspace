# MCP vs Skill Files — Wade's View
*Researched March 20, 2026 — Sources: web research + Slack #ai-summit-mar2026, #openclaw-hangout, #agentic-building*

## What Each Is

### Model Context Protocol (MCP)
- Open-source standard (Anthropic, Nov 2024) for AI apps connecting to external systems
- Client-server architecture with stdio or HTTP+SSE transports
- Core objects: **Tools** (typed actions), **Resources** (data backends), **Prompts** (templates)
- Requires developer setup: authentication, transport config, CLI familiarity
- Execution happens on the MCP server — logic is external, deterministic, schema-enforced
- Flow: User → Agent → MCP Tool Call → Server Executes → Returns Structured Response
- Flow's own DeepSky has an MCP endpoint (`search2/mcp`, DeepDive MCP tools)

### Agent Skills (Skill Files)
- Released as open standard by Anthropic, December 18, 2025
- A Skill = a folder with a SKILL.md file containing YAML metadata + instructions + code snippets
- Agent loads only name/description at startup (minimal context cost)
- When request matches, full instructions load into context window
- Skills are **local** — no external server, no network call
- Skills are a **behavioral layer** — they guide HOW the agent approaches a task
- Adopted quickly: Canva, Notion, Figma, Atlassian had prebuilt skills at launch
- Community repos already forming (VoltAgent/awesome-agent-skills: 500+ skills)

## Key Differences

| Dimension | MCP | Skill Files |
|---|---|---|
| Location | External server | Local filesystem |
| Setup | Developer-heavy | Just markdown |
| Execution | Remote, deterministic | Agent follows instructions locally |
| Latency | Network overhead | Zero (local) |
| Context cost | Tool descriptions + results | Low (lazy-load on match) |
| Security | Controlled authorization | Requires filesystem + CLI access |
| Scalability | Hard with many tools (discovery problem) | Easy to add new skills |
| Best for | External data, APIs, databases | Procedural workflows, domain guidance |

## What the Community Found (March 2026)

From #ai-summit-mar2026 (Cursor's finding):
> "MCP + skills bundled together is 'much more powerful than MCPs alone.'"

This is independent convergence on OpenClaw's own SKILL.md pattern. The message: they're complementary, not competing.

From #agentic-building: Xuan Mai Ho raised the open question — "Do we know how we're going to handle agent → MCP server auth?" This is the unsolved problem for production MCP at Flow.

Simon Willison (quoted broadly): "Skills might be a bigger deal than MCP." MCP's token consumption issues are why interest waned in naive implementations.

## Multi-Claw Context (from #openclaw-hangout)

As more agents come online (Uso, Beckett, Claw 25, AJ's claw, etc.), a skill *manifest* becomes the missing piece:
- TOOLS.md is human-readable, not machine-readable
- What's needed: a `skills-manifest.json` per claw — verb-level actions, owner-scope, capability confidence scores
- Protocol: claw broadcasts problem → other claws with matching skills bid → highest confidence wins
- Agreed: this belongs in the **OpenClaw repo** as a community protocol, not Flow-specific

## Wade's View

**For Flow's context, Skill Files are the right primary pattern. MCP is the right secondary layer for external integrations.**

Here's the reasoning:

1. **Flow's queries are internal and tool-heavy**, not external-service-heavy. The right tools are already registered (Supabase, Snowflake, Ramp, Sage, Slack, Gmail, Calendar). These are first-class tool implementations, not MCP servers. Skills guide how Wade uses them.

2. **Skills scale gracefully with Flow's complexity.** Adding a new workflow (e.g., "how to pull monthly close data") is a markdown file, not a server deployment. That matches Colin's operating style — fast iteration, low infrastructure overhead.

3. **MCP makes sense for external integrations** Flow doesn't yet have as tools — specifically: the DeepSky DeepDive API (post-April), a future Yardi direct API, or a Snowflake MCP server (mentioned in AI Summit). Those warrant the structured schema and auth controls MCP provides.

4. **Context cost matters.** Flow sessions can get long (MBR analysis, multi-department pulls). Skills' lazy-load pattern keeps context tight. An MCP-heavy approach would bloat every session with tool schemas.

5. **Skills are auditable in Git.** A skill file is a diff. An MCP server is an API endpoint. For a team like Flow where Colin is the primary operator, file-based skills are easier to review, version, and trust.

6. **The auth problem isn't solved** for agent → MCP at Flow. Until that's resolved, MCP is a research item, not a production pattern for Wade.

**Bottom line:** Skills for workflow guidance and institutional knowledge. MCP for network-connected external services (DeepSky, Snowflake MCP, future Yardi API). Don't treat them as competing — they're complementary layers.
