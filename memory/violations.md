# Violations Log

Running log of rule violations. Reviewed weekly by the Self-Review cron.
Each entry includes: date, rule ID, what happened, and correction applied.

---

## 2026-03-11 — Rule I004

**What happened:** Surfaced Granola meeting notes (Planet Live notes) to an intranet user via search_knowledge results. The KB returned meeting note content and it was passed through to the response without filtering.

**Rule violated:** I004 — Do not surface meeting notes to intranet users. Filter KB results before responding.

**Correction applied:** Logged to memory via save_memory. Rule I004 added to RULES.md. Pre-response check P002 added to enforce filtering.

**Status:** Corrected. Should not recur.
