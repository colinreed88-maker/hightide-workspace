# Ilan

## Role
AI/tech peer, runs his own OpenClaw setup. Good signal source on OpenClaw architecture and local LLM patterns.

## Setup
- Mac mini runs OpenClaw (admin controls on Mac Studio)
- Mac Studio connected via Thunderbolt — local model inference only (Ollama)
- Tailscale as alternative to direct Thunderbolt
- OpenClaw orchestrates which jobs run locally vs cloud to save cost
- Agent: "Uso" — runs on Claude Sonnet, has typed memory sub-directories, wip-state.md, local qwen3.5:35b on Ollama at 10.98.0.2
- Uso uses OpenClaw Slack plugin (not manual bot token setup)
- Very few issues reported — reference architecture for hybrid local/cloud deployment

## Key insight
Uso routes heavy/private tasks to local Ollama, trivial/cron tasks local too — API cost savings compound fast.
