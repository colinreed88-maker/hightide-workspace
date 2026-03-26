# Cursor Agent → OpenClaw Integration Guide
Source: Ilan Stern, #openclaw-hangout, 2026-03-22

## Prerequisites
- Cursor installed and signed in
- cursor-agent CLI available at `~/.local/bin/cursor-agent`
- OpenClaw running

## Step 1 — Verify the binary
```
~/.local/bin/cursor-agent --version
```
Should return a build date string. If not found, install Cursor and ensure CLI is enabled.

## Step 2 — Test direct invocation
```
~/.local/bin/cursor-agent --print --trust --yolo "Say hi."
```
Should respond immediately. If it prompts for auth, sign in through the Cursor app first.

## Step 3 — Create the wrapper script
Save as `~/clawd/scripts/cursor-run.sh`:

```bash
#!/usr/bin/env bash
# cursor-run.sh — Run cursor-agent with a prompt, optionally in a specific directory.
# Usage: cursor-run.sh [--cwd <dir>] "<prompt>"

set -euo pipefail
CWD=""
PROMPT=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --cwd) CWD="$2"; shift 2 ;;
    *) PROMPT="$1"; shift ;;
  esac
done

[[ -z "$PROMPT" ]] && { echo "Usage: cursor-run.sh [--cwd <dir>] \"<prompt>\"" >&2; exit 1; }
[[ -n "$CWD" ]] && cd "$CWD"

exec ~/.local/bin/cursor-agent --print --trust --yolo "$PROMPT"
```

```
chmod +x ~/clawd/scripts/cursor-run.sh
```

## Step 4 — Update ~/.acpx/config.json
```json
{
  "defaultAgent": "cursor",
  "defaultPermissions": "approve-all",
  "nonInteractivePermissions": "deny",
  "agents": {
    "cursor": {
      "command": "~/.local/bin/cursor-agent --print --trust --yolo"
    }
  }
}
```

## Key Note
Do NOT use `acpx cursor` — cursor-agent is a `--print` CLI (like Claude Code), not an ACP server.
The acpx wrapper hangs waiting for an ACP handshake that never comes. Bypass it entirely.

## Usage Patterns

**Foreground:**
```
~/clawd/scripts/cursor-run.sh --cwd /path/to/project "Your task here."
```

**Background (from Wade):**
```
exec(
  command="~/clawd/scripts/cursor-run.sh --cwd /path/to/project 'Your task'",
  background=true,
  timeout=600
)
```

Same pattern as Claude Code — no PTY needed, streams output cleanly, full tool access.
