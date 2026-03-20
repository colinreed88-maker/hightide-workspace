# Flow Building Portfolio — Research Notes
_Last updated: 2026-03-20_

## Status: Limited Data Available

The knowledge base returned no results for "G-West", "Block E", "Stacks", or general portfolio queries. These properties are not currently indexed.

## What Is Known (from mbr_current_roster org data)

### Active MENA Properties (inferred from ops teams)
- **Flow Granada** — active leasing + building ops (GM: Sergio Gomez Salas)
- **Flow Narjis** — active leasing + building ops (GM: Hafsah Ibrahim)
- **Flow Olaya** — maintenance team active

### MENA Construction Pipeline
MENA has an active construction team (Hossam Jameel + team of 4 including project managers, site supervisor, civil engineer), suggesting properties in development beyond the three above.

### US Properties
- Not surfaced from current queries
- G-West, Block E, Stacks — likely US multifamily portfolio; not in knowledge base

## Next Steps to Fill This Gap
1. Query Snowflake: `FLOW.PROPERTIES` table likely has the full property master
2. Ask Colin or check the MBR for a building list
3. Try `query_snowflake` against `ANALYTICS.FLOW.PROPERTIES` or `ANALYTICS.MULTIFAMILY.DAILY_OCCUPANCY` for property names

## Note
The Snowflake warehouse (`query_snowflake`) was not queried this session — should be the first stop for property portfolio data next time.
