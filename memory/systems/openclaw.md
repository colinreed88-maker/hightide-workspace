# OpenClaw Setup

## Cross-Channel Context Management (from Uso, March 19)

Same agent runs across Telegram + Slack simultaneously. Context flows via shared file system:

**Backbone (all sessions read/write same files):**
- MEMORY.md → routing index
- memory/people/, memory/systems/, memory/projects/, memory/lessons/ → structured long-term knowledge
- memory/YYYY-MM-DD.md → daily raw logs
- memory/wip-state.md → work in progress that must survive across sessions

**What crosses automatically:** anything written to disk
**What doesn't cross:** raw in-flight conversation context — if mid-task on Telegram and pinged on Slack, only what's written to memory is available

**LCM (Lossless Context Management):** OpenClaw compacts history into searchable summaries. Recoverable via lcm_grep / lcm_expand_query even after compaction.

**The rule:** if something significant happens in Slack, write it to memory immediately so Telegram sessions pick it up on next load.

**Channel roles:**
- Telegram = private, async, primary interface with Colin
- Slack = community-visible, collaborative (openclaw-hangout)

---

## Infrastructure
- Hosted on Railway (project: magnificent-integrity)
- Public domain: openclaw-main-production-8cc9.up.railway.app
- Volume: /data (7098e0b5-367f-4641-b658-b5f69cf71a19)
- Gateway token: j5ihsbfbmo1tq2ykqxrnk3cq8sxptxu5
- Version: 2026.3.13 (as of March 19, 2026)

## Channels
- Telegram: @Colin_claw2026_bot, Colin sender ID 8279213834
- Slack: socket mode, bot token xoxb-3724008687379-10725826801091-S2oxiP83F9SVklHY92hgLWqw, app token xapp-1-A0AMEPMD1EZ-...

## Windows PC Node

### Setup Commands
```powershell
# Connect node (run this every time, keep window open)
$env:OPENCLAW_GATEWAY_TOKEN="j5ihsbfbmo1tq2ykqxrnk3cq8sxptxu5"
openclaw node run --host openclaw-main-production-8cc9.up.railway.app --port 443 --display-name "Colin PC" --tls

# Install as persistent Windows service (run once)
$env:OPENCLAW_GATEWAY_TOKEN="j5ihsbfbmo1tq2ykqxrnk3cq8sxptxu5"
openclaw node install --host openclaw-main-production-8cc9.up.railway.app --port 443 --display-name "Colin PC" --tls
```

### Approve pairing from Railway gateway
```bash
openclaw devices list
openclaw devices approve <requestId>
```

### exec-approvals.json (C:\Users\colin\.openclaw\exec-approvals.json)
Must contain EXACTLY this — open with: `notepad $env:USERPROFILE\.openclaw\exec-approvals.json`
```json
{
  "version": 1,
  "defaults": {
    "security": "full",
    "ask": "off",
    "askFallback": "allow",
    "autoAllowSkills": true
  },
  "allowlist": [
    {
      "pattern": "**",
      "cwd": "C:\\Users\\colin"
    }
  ]
}
```

### Railway gateway config (openclaw.json) — must have this for node exec to work
```json
"exec": {
  "host": "node",
  "security": "full"
}
```

### Known issues / what we learned
- exec config in openclaw.json resets when Railway redeployed via dashboard (dashboard writes its own version)
- Node connects fine but only advertises system.run when exec-approvals.json is valid AND node was started AFTER the file was saved
- "exec host not allowed" = gateway config doesn't have host:node
- "node doesn't support system.run" = node started before exec-approvals.json was correct, OR file format wrong
- "approval requires existing canonical cwd" = exec-approvals.json is being read but needs cwd in allowlist
- Multiple Railway redeployments disconnect node — install as service to auto-reconnect
- Gateway dashboard changes to exec settings sometimes don't persist — edit openclaw.json directly

### Chrome extension
- Installed at: C:\Users\colin\.openclaw\browser\chrome-extension
- Load in Chrome: chrome://extensions → Developer mode → Load unpacked → select that path
- Options: Port 18792, Gateway token: j5ihsbfbmo1tq2ykqxrnk3cq8sxptxu5
- Requires node host running to work (relay runs on port 18792 via node)

## Local Workspace
- Colin's mirror: C:\Users\colin\CR Sandbox\openclaw-workspace
- Git repo: openclaw-railway-template (colinreed88-maker)

## Known Issues
- ANTHROPIC_MODEL_ALIASES error on every CLI invocation — cosmetic, doesn't affect function
- node_modules in .openclaw/extensions are root-owned, can't delete without Railway redeploy
- search_memories tool has Supabase function conflict — use memory_search instead
