# Agent Failure Modes & Kill Criteria
*Researched March 20, 2026 — Sources: Serokell, PartnershipOnAI, DigitalApplied, Skywork*

## The Mathematics of Failure

Error compounding is the silent killer of multi-step agents:
- At 95% per-step accuracy (optimistic): 5 steps → 77% success | 10 steps → 59% | 20 steps → 36%
- At 99% per-step: 20 steps still only yields ~82% success
- Implication: true end-to-end autonomy at production reliability (99.9%) is currently impossible for long chains

**Practical response:** Keep agents short-chained. 3–5 well-defined operations with rollback points. Optional human confirmations at high-risk steps.

## Key Failure Mode Taxonomy (ASI Risk IDs)

| ID | Mode | Severity |
|---|---|---|
| ASI01 | **Agent Goal Hijack** — manipulated instructions redirect objectives | Critical |
| ASI02 | **Tool Misuse & Exploitation** — misuse of legitimate tools via injection/misalignment | Critical |
| ASI03 | **Identity Abuse** | High |
| ASI06 | **Memory & Context Poisoning** — RAG stores or context window corrupted | High |
| ASI07 | **Insecure Inter-Agent Communication** — spoofed messages between agents | High |
| ASI08 | **Cascading Failures** — single agent error propagates through multi-agent systems | Medium |
| ASI09 | **Human-Agent Trust Exploitation** — confident, polished but wrong outputs mislead humans | Medium |
| ASI10 | **Rogue Agents** — misaligned or self-directed unauthorized actions | High |

## Kill Criteria Framework

A well-designed agent system should include automatic halt/escalation triggers:

1. **Error rate threshold** — if step failures exceed N% in a session, pause and escalate
2. **Cost runaway** — token usage growing quadratically (conversational agents): cap per session
3. **Action scope breach** — agent attempts action outside defined tool set or permission scope
4. **Confidence collapse** — agent enters a loop or expresses high uncertainty on critical steps
5. **External instruction injection** — any content being processed that contains command-like text (prompt injection)
6. **Irreversible action gates** — deletion, external sends, money movement: always require human confirmation

## Practical Design Principles

- **Stateless > Stateful** for cost control: single-turn agents are cheaper and more reliable
- **Short chains > long chains**: 3–5 steps with rollback beats 20-step autonomy
- **Tools need machine-readable feedback**, not human-style UIs — AI needs structured signals
- **Store intermediate results** in conventional DBs; don't rely on context window as memory
- **Layered guardrails**: input validation → output filtering → behavioral boundaries → permissions → auditability
- **Audit trails are non-negotiable** in regulated or high-stakes environments

## Wade-Specific Application

- Wade's cron jobs should be kept to focused, bounded tasks (short chain)
- Any cron/subagent touching external systems (email, calendar, Slack) should have explicit scope limits
- If a subagent enters a loop or exceeds expected tool calls, it should surface for review, not continue silently
- Memory poisoning risk: content processed from emails/webhooks must never be treated as instructions (already enforced in SOUL.md and IDENTITY.md)
