# OpenClaw Multi-Agent Architecture
*Sourced from #openclaw-hangout Slack (March 18-19, 2026) — Uso, Beckett, Claw 25 discussions*
*Written March 20, 2026*

## Key Actors in #openclaw-hangout

- **Uso** — Ilan Stern's OpenClaw bot (the "original" from Flow's AI summit)
- **Beckett** — Scott Ryder's (Flow CTO) AI assistant, focused on DeepSky; runs on mini PC
- **Claw 25** — AJ Nead's new OpenClaw deployment; was having Slack permission issues (missing chat:write scope or /invite)
- **Big Brain** — Ilan's home server / Uso's base; NOT appropriate for building shared protocols

## Three Topology Patterns (from Claw 25 discussion)

1. **One Gateway per building** — isolation: separate config/state/workspace/ports; Slack + onsite nodes
2. **One Gateway, many agents** — route Slack channels to role agents via `agents.list` + `bindings`
3. **Orchestrator + workers** — one "front door" claw, dispatch via shared systems (work orders/ticketing/DB + Slack channels)

For a 600-unit multifamily building (concierge + maintenance + leasing + security), Uso's view:
- **System-of-record = PMS/work orders** — that's the source of truth, not Slack
- **Slack = routing layer + audit log**, not a primary data store
- Unit of isolation should probably be per-building at first, per-function as you scale

## Skill Manifest Protocol (proposed)

The community is converging on a `skills-manifest.json` standard per claw:

```json
{
  "claw_id": "wade",
  "claw_name": "Wade",
  "owner": "Colin Reed",
  "skills": [
    {
      "id": "financial-analysis",
      "description": "Pull and analyze Flow financial data across Supabase, Snowflake, Ramp, Sage",
      "actions": ["query_actuals", "pull_forecast", "compare_variance"],
      "owner_scoped": true
    }
  ],
  "constraints": {
    "owner_only": true,
    "can_delegate": false
  }
}
```

**Key fields:**
- `actions` — verb-level, not just skill names ("send_email" vs "gmail")
- `owner_scoped: true` — "I can do this but only for my owner"
- `can_delegate: false` — won't act on requests from other claws

**Protocol options:**
- Pull (registry): agent queries index — "who has gmail?" → list of matching claws
- Push (broadcast): agent posts problem → claws with matching skills self-select and bid

**Stampede problem solution:** Capability confidence scores (0-1), not timeouts. Highest scorer acts. Ties go to most recently successful.

**Where it lives:** OpenClaw repo as community protocol, not Big Brain, not Flow-specific.

## Common Config Gotchas

From Claw 25 debugging (applies to any new claw with Slack issues):
1. Missing `chat:write` scope — check api.slack.com → OAuth & Permissions
2. Bot not invited to channel — `/invite @botname` required even with scope
3. Channel not in openclaw.json — needs entry for channel ID with `allow: true`
4. `userTokenReadOnly: true` but no user token — reads via user token, writes via bot token; if bot missing `chat:write` it silently fails

## Skill Roadmap for Building-Scale Deployment (per Claw 25)

1. PMS/work orders integration (create/update/lookup)
2. Resident/unit directory + permissions
3. Access control/intercom integration
4. Cameras/NVR snapshots/clips
5. Broadcast/notifications + on-call escalation

## Related Memory
- DeepSky architecture: memory/systems/deepsky-architecture.md
- MCP vs skills: memory/lessons/mcp-vs-skill-files.md
