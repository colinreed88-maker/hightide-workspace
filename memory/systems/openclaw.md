# OpenClaw Setup

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
- Paired as "Colin PC" 
- Node ID: 49d737f58f488f6930e28ff47123435cf814ff829f6c6097e0d0e924a8a252db
- Node run command: openclaw node run --host openclaw-main-production-8cc9.up.railway.app --port 443 --display-name "Colin PC" --tls
- Chrome extension installed at C:\Users\colin\.openclaw\browser\chrome-extension
- exec-approvals.json: C:\Users\colin\.openclaw\exec-approvals.json — needs {"version":1,"defaults":{"security":"full","ask":"off","askFallback":"allow","autoAllowSkills":true}}
- Node exec still needs work — cwd issue preventing system.run

## Local Workspace
- Colin's mirror: C:\Users\colin\CR Sandbox\openclaw-workspace
- Git repo: openclaw-railway-template (colinreed88-maker)

## Known Issues
- ANTHROPIC_MODEL_ALIASES error on every CLI invocation — cosmetic, doesn't affect function
- node_modules in .openclaw/extensions are root-owned, can't delete without Railway redeploy
- search_memories tool has Supabase function conflict — use memory_search instead
