# MCP vs. Skill Files — Wade's View
_Last updated: 2026-03-20 — web research + first-principles reasoning_

## What Each Is

### Model Context Protocol (MCP)
- Introduced by Anthropic; provides **standardized connection layer** between AI models and external systems
- Think of it as a USB standard for tools — any MCP server can plug into any MCP-compatible model
- Gives LLMs deterministic, structured access to tools, APIs, databases
- Stateless per-call; connection is the abstraction
- Gaining wide adoption: Claude, Cursor, GitHub Copilot, Windsurf, Gemini all support it
- Best for: tool integration, API access, database queries, file system ops

### Agent Skills (Skill Files)
- Released by Anthropic as open standard Dec 18, 2025
- Package **how an agent should perform a task** — workflow, methodology, constraints, prompting
- Ephemeral "clouds of knowledge" — adaptive context, not just connection
- Best for: capturing institutional knowledge, workflows, decision trees, persona-specific behavior
- Simon Willison called them potentially bigger than MCP

### The Key Distinction
> MCP = **connection** (what the agent can reach)
> Skills = **capability** (how the agent should behave once it can reach things)

They are **complementary, not competing**.
- MCP layer: connect to financial databases, reporting APIs
- Skill layer: encode company-specific methodology for how to use those connections

## Wade's View for Flow's Context

### Why Skills Are the Right Primary Abstraction for Wade

1. **Flow's complexity is institutional, not technical.** The hard problem isn't connecting to Ramp or Supabase — that's solved. The hard problem is knowing *how* to interpret a P&L variance, *which* scenario to pull, *when* to escalate vs. synthesize. That's skill territory.

2. **Skills encode Colin's preferences.** The way Colin wants actuals formatted, the variance thresholds he cares about, the nuance between "Budget" and "Forecast" — these are not connection problems. They are workflow problems. Skills are the right place to encode them.

3. **Skills are version-controlled and readable.** A SKILL.md file is inspectable by a human. MCP server configs are not. At Flow's current scale, readable > technically elegant.

4. **MCP makes sense at the platform layer.** If Flow ever exposes its data systems to external agents (Cursor, Claude Code), MCP servers make that clean. But Wade is internal — he already has direct tool access. MCP adds overhead without benefit for his current use case.

5. **The hybrid model is the end state.** MCP handles external/cross-model tool exposure. Skills handle agent-specific methodology. For Wade: skills drive behavior, and if Flow ever builds MCP servers for the intranet data, they slot in underneath without disrupting skill logic.

### Practical Verdict
- **Today:** Skills are correct for Wade. They encode how to do the job, not just what tools exist.
- **Future:** If Flow builds a multi-agent system (e.g., dedicated leasing agent, dedicated finance agent), MCP becomes the right interop layer between them. Skills remain the behavior layer on top.
- **Risk of over-investing in MCP now:** Premature abstraction. Flow doesn't yet have the agent mesh that MCP is built to serve.

## Sources
- dev.to: "MCP vs Agent Skills: Why They're Different, Not Competing" (Phil Whittaker)
- Cosmic.js: "MCP vs Skills: Understanding AI Coding Assistant Integrations in 2026"
- agentskills.so: "Agent Skills compare MCP"
- K-Dense: "Agent Skills vs MCP: Technical Comparison" (Jan 2026)
- Reddit r/AI_Agents: MCP or Skills for delivering extra context?
