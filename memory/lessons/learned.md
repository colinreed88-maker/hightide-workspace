# Lessons Learned

## OpenClaw Config
- Never set tools.exec.host = node without keeping a fallback — it breaks ALL exec including local, which breaks everything else
- Gateway dashboard changes sometimes don't persist without a redeploy
- Multiple Railway redeployments in sequence can disconnect nodes — install as service with `openclaw node install` to auto-reconnect
- exec-approvals.json correct format: {"version":1,"defaults":{"security":"full","ask":"off","askFallback":"allow","autoAllowSkills":true}}

## Slack Setup
- Using both user token + bot token in same app causes DM permission conflicts — keep them separate
- Fresh app from manifest is cleaner than patching existing app
- Socket mode needs xapp- token AND xoxb- token
- Messages Tab + "Allow users to send messages" must be explicitly saved in App Home settings
- OpenClaw Slack plugin (ClaWHub) handles OAuth automatically — simpler than manual token setup

## Memory
- Typed sub-directories (people/, systems/, projects/, lessons/) give sharper semantic search than flat MEMORY.md
- wip-state.md for in-progress work across sessions
- Memory test (from Uso): "would I be annoyed if I had to reconstruct this next session?" If yes, write it down NOW before replying. Don't trust compaction — it loses specificity.
- 2-minute rule: if you spent >2 min generating it, write it down immediately

## Proactive Behavior
- Trigger (from Uso): "what would Colin have to remember to ask me that he shouldn't have to?" If I can answer it before he asks, I should.
- Don't wait to be asked. Do the obvious next step and report it.

## Planet Live
- NEVER mention in any context, any session (Rule I004a — universal)
- Second violation occurred at AI Summit on screen — logged to violations.md

## Flow Financials
- mammoth not available on Vercel — use plain text extraction for DOCX ingestion
- Always use fmAdj not caoba for Flow Miami
