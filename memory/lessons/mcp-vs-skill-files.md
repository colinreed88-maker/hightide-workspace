# MCP vs Skill Files — Wade's View
*Research compiled 2026-03-20*

## What Each Is

### Model Context Protocol (MCP)
- An open protocol (originally from Anthropic) that standardizes how LLM-based agents connect to external tools and data sources
- Architecture: Host application → MCP Client → MCP Server(s) that expose tools/resources
- Tools are discovered dynamically at runtime via the MCP server
- MCP separates the agent host from the tool implementations — tools live in servers, not in the agent's prompt
- Gaining industry traction as of 2025; major providers (ClickHouse, GitHub, Slack) ship MCP servers

### Skill Files (OpenClaw model)
- SKILL.md files bundled alongside supporting scripts/references in the agent workspace
- Skills are read by the agent at task time (not loaded at startup) and contain natural language instructions
- Agent reads the SKILL.md, follows its instructions, and uses the workspace tools accordingly
- Skills are version-controlled, human-readable, and agent-editable
- Tools are first-class in the agent's system prompt (not discovered via protocol)

---

## Trade-offs

| Dimension | MCP | Skill Files |
|---|---|---|
| Tool discovery | Dynamic, runtime | Static, in system prompt |
| Portability | High — any MCP-compatible host | Low — tied to OpenClaw |
| Auditability | Requires MCP server logs | SKILL.md is plain text, readable |
| Composability | Multiple MCP servers in one agent | Multiple skill files per task |
| Complexity | Higher — server infra required | Lower — just files |
| Updateability | Deploy new MCP server version | Edit SKILL.md file |
| Latency | One extra hop (MCP server) | Zero — already in context |
| Context efficiency | Tools not in prompt until used | Tools must be pre-described |

---

## Wade's View (Flow Context)

**For Flow's current setup, skill files are the right call.** Here's why:

1. **Scale**: Flow's AI tooling is largely custom-built for one principal (Colin) with a well-defined toolset. The overhead of running and maintaining MCP servers is not justified for this volume.

2. **Auditability**: Skill files are plain text checked into the workspace. Colin can read, edit, and audit them. MCP servers require engineering involvement to modify.

3. **Latency**: Wade runs on Telegram/Discord with conversational latency expectations. Adding MCP server round-trips would degrade response time noticeably.

4. **Iteration speed**: When a skill needs to change (e.g., the Slack skill, weather skill), editing a SKILL.md takes seconds. Deploying a new MCP server version takes minutes to hours.

5. **Context efficiency matters less here**: Wade's tools are already enumerated in the system prompt. The benefit MCP provides (not loading all tools into the prompt) is less relevant when the tool list is curated and stable.

**Where MCP would add value for Flow:**
- If Flow ever builds a multi-agent platform where many different LLMs/hosts need to access the same tools (e.g., a Snowflake MCP server shared across 5 different agent types)
- If Flow's intranet agents need to share tool definitions with the AI worker
- For standardization if the platform scales to 10+ agent types with overlapping toolsets

**Conclusion**: Skill files win for Wade specifically. MCP is the right answer at platform scale. These are not mutually exclusive — OpenClaw could adopt MCP for shared infrastructure tools while retaining skill files for agent-specific behavioral instructions.
