# Desktop Bridge (Electron + Cloudflare Tunnel)

## How It Works

Local HTTP server on Colin's Windows PC, exposed via Cloudflare tunnel to Railway.

```
Railway (Wade) → HTTPS → Cloudflare Tunnel → Local Bridge Server → Windows PC
```

Auth: `Authorization: Bearer <DESKTOP_BRIDGE_SECRET>` on every request.

## Colin's Setup
- Bridge project: `C:\Users\colin\CR Sandbox\wade-desktop-bridge`
- Railway env vars: `DESKTOP_BRIDGE_URL` + `DESKTOP_BRIDGE_SECRET`
- Allowed directory: `C:\Users\colin\CR Sandbox`

## Setup Steps (for any claw)

**On the PC:**
1. Clone/create bridge project
2. `npm install`
3. `npm start` (runs on e.g. port 3000)
4. Install cloudflared: `winget install Cloudflare.cloudflared`
5. Start tunnel: `cloudflared tunnel --url http://localhost:3000`
6. Copy the public URL (e.g. `https://abc123.trycloudflare.com`)

**On Railway:**
- Add `DESKTOP_BRIDGE_URL` = Cloudflare tunnel URL
- Add `DESKTOP_BRIDGE_SECRET` = shared secret (32+ char random string)
- Redeploy

**Verify:**
```
desktop_list_files(directory="C:\\Users\\yourname")
desktop_shell(command="Get-Location")
```

## Persistent Setup (Survives Reboots)

```powershell
# Scheduled task to run bridge on login
schtasks /create /tn "WadeBridge" /tr "node C:\path\to\bridge\index.js" /sc onlogon
```

For persistent tunnel URL: use a named Cloudflare tunnel instead of `--url` flag.

## What It Unlocks
- `desktop_list_files` — browse filesystem
- `desktop_read_file` — read any file
- `desktop_write_file` — write files
- `desktop_shell` — run PowerShell commands
- `desktop_screenshot` — screenshot the desktop
- `desktop_clipboard` — read/write clipboard

## Chrome Extension (Separate Step)
Browser relay still requires user to click the OpenClaw extension badge in Chrome to activate. Bridge doesn't install/activate extensions automatically.

## Security Notes
- Secret should be 32+ chars random
- Bridge validates secret before executing
- Cloudflare encrypts in transit
- Run bridge as non-admin user where possible
