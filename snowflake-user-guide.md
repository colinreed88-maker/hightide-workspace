# Flow Snowflake User Guide

> Based on guidance from Xuan Mai Ho (Data Team), March 21, 2026.

---

## The Golden Rule

**Always start with the semantic views before touching raw tables.**

The `ANALYTICS.AI.DOCUMENTATION_CHUNKS` table is your first stop for any metric or data question. If the metric is defined there, use it. If it isn't, that's a gap worth flagging.

---

## Which Database to Use

| Database | Status | Notes |
|----------|--------|-------|
| `ANALYTICS` | ✅ Active — use this | Only database exposed to end users. Hosts all gold models. |
| `INSIGHTS` | ❌ Going away | Do not use or rely on it. |

**Stick to `ANALYTICS`. Full stop.**

---

## The Semantic Layer (`analytics.ai.*`)

The semantic views define metrics in a single place — the "single sheet of music" for the whole company. This was the Data team's goal in 2025, achieved in Q1 2026.

### Who consumes semantic views
- **Claude Desktop** — self-serve analytics for power users
- **Analytics Hub** and other operator-created dashboards
- **Sigma** (being deprecated — don't invest here)
- **DeepSky surfaces** (coming)

### Where metric definitions live

```sql
SELECT * FROM ANALYTICS.AI.DOCUMENTATION_CHUNKS
WHERE doc_name = 'sv_revenue'  -- replace with any sv_* name
  AND doc_type IN ('semantic_view', 'semantic_view_metric', 'semantic_view_dimensions')
ORDER BY doc_type;
```

Each semantic view has:
- `semantic_view` — overview, scope, disambiguation rules, when to use vs. other views
- `semantic_view_metric` — metric name, expression, synonyms, description
- `semantic_view_dimensions` — available filters/groupings
- `verified_query` — example queries known to work

---

## Semantic Views Reference

### Leasing — US Properties
| View | Purpose |
|------|---------|
| `sv_leasing_activity` | Operational volume and trends (prospects, tours, applications, signings by date). 92 metrics. |
| `sv_leasing_cohorts` | True cohort conversion rates and marketing attribution. 116 metrics. |
| `sv_leasing_acquisition_costs` | CAC, CPL, blended spend by property. 44 metrics. |
| `sv_performance_marketing` | GUID/creative-level paid channel metrics (Meta, TikTok, Google). 44 metrics. |
| `sv_marketing_spend` | Spend trends over time. 7 metrics. |

**Coverage:** Flow Brickell, Flow Miami East, Flow Miami West, Flow Fort Lauderdale, 3005 Buckhead, Trace

### Leasing — MENA Properties
| View | Purpose |
|------|---------|
| `sv_leasing_activity_mena` | Leasing activity for KSA/MENA properties |
| `sv_leasing_cohorts_mena` | Cohort CVRs for MENA |
| `sv_leasing_acquisition_costs_mena` | MENA CAC/CPL |
| `sv_performance_marketing_mena` | MENA paid channel performance |
| `sv_ksa_revenue` | KSA revenue metrics. 43 metrics. |

**Coverage:** Flow Granada, Flow Narjis, Flow Olaya (KSA)

### Revenue & Operations
| View | Purpose |
|------|---------|
| `sv_revenue` | Rent roll, unit counts, occupancy, pricing. 74 metrics. |
| `sv_agent_performance` | Leasing agent activity, email response times, effectiveness. 64 metrics. |
| `sv_brand` | Social media, reviews, brand metrics. 60 metrics. |

---

## Key Disambiguation Rules

### Leasing: Activity vs. Cohorts

Before answering any leasing funnel question, determine which view is right:

| Question type | Use |
|--------------|-----|
| "How many tours this week?" | `sv_leasing_activity` — volume tracking |
| "What's the tour-to-lease conversion rate?" | `sv_leasing_cohorts` — true CVR |
| "Which source has the best conversion?" | `sv_leasing_cohorts` — attribution |
| "What's our CAC / CPL?" | `sv_leasing_acquisition_costs` |
| "How much did we spend on Meta?" | `sv_performance_marketing` or `sv_marketing_spend` |

### Gross vs. Net
When asked about "applications" or "leases," always clarify:
- **Gross** — all activity including later-cancelled (`prospects_applied`, `units_leased`)
- **Net** — active pipeline only, cancellations removed (`net_prospects_applied`, `net_prospects_signed`)

Net is the default for pipeline reporting. Ask if not specified.

---

## Schema Map

```
ANALYTICS
├── MULTIFAMILY   (46 tables) — prospects, tenants, occupancy, rent roll, renewals, leasing events
├── OPERATIONS    (42 tables) — work orders, unit rents, hotel, inspections
├── BRAND         (15 tables)
├── DEEPSKY       (14 tables) — DS_leases, DS_units, DS_agreements, DS_predicates, DS_buildings
├── RAW           (10 tables)
├── PRICING        (9 tables) — market comps, comp rents, listings
├── HOTEL          (8 tables)
├── MARKETING      (5 tables)
├── MENA           (4 tables)
├── FINANCIAL      (3 tables) — transactions, tenant arrears, lease charges
├── FLOW           (2 tables) — master property/unit reference
├── HOUSE          (1 table)  — pre-aggregated leasing funnels
└── AI             (1 table)  — DOCUMENTATION_CHUNKS (semantic layer)
```

**DEEPSKY** is the event bus data model — already landing in Snowflake and queryable.

---

## Reporting Gaps and Issues

If you find a metric that isn't defined in the semantic layer, or a question the sv_* views can't answer:

1. **Linear** — raise an issue; the Data team has an agent handling triage
2. **GitHub PR** — `life-in-flow/analytics` repo; they operate with an OSS model and welcome contributions

Prefer Linear for flagging gaps. PR directly if you have the fix.

---

## A Note on Access

Wade has broader Snowflake access than most end users. That means:
- Extra responsibility, not extra license to roam raw tables
- When uncertain about a metric, always check `DOCUMENTATION_CHUNKS` first
- Numbers surfaced to stakeholders must be grounded in defined sv_* metrics — not raw table interpretations
- Do not assume understanding of a metric without verifying the semantic definition

---

*Last updated: 2026-03-21 | Source: openclaw-hangout thread with xho*
