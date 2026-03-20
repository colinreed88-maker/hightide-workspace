# Flow Building Portfolio — Research Notes
*March 20, 2026*

## Status: Partial — Snowflake Connection Failed

Attempted to pull property data from ANALYTICS.FLOW.PROPERTIES via Snowflake. Connection was terminated during the session. Will retry next opportunity.

## What's Known from Roster Data

Active building operations identified from mbr_current_roster department names:
- **Flow Miami** — Facilities managed by Orlando Urdaneta (reports to Gordon Tier, Chief Engineer)
- **Flow Ft Lauderdale (FLL)** — Managed by Danny Montoya, GM William Burpitt
- **Flow Brickell** — Building Ops Manager Kenya Powell, reports to Eduardo Molina
- **Atlanta (multiple)** — Now appears to be terminated staff; operations may have wound down
- **MENA — Narjis** — Hafsah Ibrahim, GM; reports to Sami Amin
- **MENA — Granada** — Sergio Gomez Salas, GM; reports to Sami Amin

## G-West, Block E, Stacks — Not Found

These property names were referenced in the overnight task but:
- Not found in Flow knowledge base
- Not found in Snowflake (connection dropped)
- May be: development project codenames, MENA properties, or names from a doc not yet ingested

## Action Required

1. Retry Snowflake query for ANALYTICS.FLOW.PROPERTIES when connection is restored
2. Ask Colin what G-West, Block E, and Stacks refer to — are these development projects or operating properties?
