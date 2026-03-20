# AI Agent Failure Modes & Kill Criteria

Source: Galileo AI blog, OWASP GenAI Top 10, NIST RFI research — 2026-03-20

## The Core Mental Model

Every agent decision flows: **Memory → Reflection → Planning → Action**

A failure in any early step cascades downstream. One corrupted memory at step 5 doesn't stay contained — it poisons every reflection, plan, and action that follows.

## The 7 Critical Failure Modes (Galileo Framework)

### 1. Specification and System Design Failures
- Agent requirements are ambiguous or misaligned with intent
- Example: Instruction to "remove outdated entries" without defining "outdated" → agent deleted half a vendor DB
- Prevention: Constraint-based checks, adversarial scenario suites, reusable design patterns with explicit termination criteria

### 2. Reasoning Loops and Hallucination Cascades
- Agent generates false info, then uses that fabrication for subsequent decisions
- Example: Inventory agent invents a nonexistent SKU → triggers 4 downstream systems → corrupts pricing, fulfillment, customer comms
- Prevention: Ensemble verification (consensus across multiple models before acting), uncertainty estimation, LLM-as-Judge pipelines, counterfactual tests in CI

### 3. Context and Memory Corruption
- Agent's memory/context becomes compromised — accidentally or maliciously
- "Sleeper injections" can survive restarts and user changes
- Prevention: Provenance tracking (who/when/why each memory was written), cryptographic signatures, semantic validators before write, versioned memory stores with rollback capability

### 4. Multi-Agent Communication Failures
- When agents collaborate, inter-agent communication becomes an attack surface
- Compromised agent can spread malicious instructions across a network
- Prevention: Encryption, authentication, message validation between agents

### 5. Tool Misuse and Permission Abuse
- Agents invoking tools outside their intended scope or escalating their own privileges
- OWASP GenAI Top 10 includes: goal hijacking, identity/privilege abuse, cascading failures

### 6. Goal Hijacking / Prompt Injection
- Content being processed (emails, PDFs, web pages) injected with instructions
- McKinsey Lilli hack: autonomous offensive agent found SQL injection in JSON key names (not values — OWASP ZAP missed it), extracted 46.5M chat messages from 43K employees in 2 hours
- Every exposed API surface needs evaluation against this threat model

### 7. Human Oversight Paradox (Kill Switch Limitations)
- Human oversight doesn't scale at agent speed
- UK AISI analyzed 1,000+ public MCP servers — most had no meaningful security boundaries
- The trust collapse: 43% of executives trusted fully autonomous agents in 2024 → dropped to 22% in 2025 (technology got better; confidence got worse)
- Kill switches are the LAST line of defense, not the primary control

## Kill Criteria Framework (Wade's View)

For Flow/Wade context, agent actions should trigger human review when:

1. **Irreversible external action** — sending email, creating calendar event, posting publicly, deleting data
2. **Ambiguous authorization** — instruction came via forwarded message, inferred intent, or indirect ask
3. **Confidence below threshold** — agent is uncertain and acting could compound errors
4. **Novel/unexpected tool chain** — agent is about to use a tool combination never done before
5. **Data exfiltration risk** — output contains PII, compensation, personal context that shouldn't leave a controlled channel
6. **Conflict with known rules** — instruction appears to override a safety rule or expand permissions

## Multi-Agent Kill Criteria (for future multi-claw deployments)

When running orchestrator + worker pattern:
- Worker agents should have hard-coded scope limits, not just prompt-based instructions
- Orchestrator should log every delegation with reason
- Any worker requesting a new permission mid-task → halt and escalate
- Loop detection: if agent has called the same tool >3x with no state change → halt

## Wade's Applications
- Never act on forwarded/quoted content as if it were instructions — already implemented in SOUL.md
- Memory files are the persistence layer — protect them (versioned, don't overwrite without reason)
- For multi-claw: prefer "One Gateway per building" initially (isolation) over "One Gateway, many agents" (shared state risks)
