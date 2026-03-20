# Flow Building Portfolio

Source: Snowflake ANALYTICS.FLOW.PROPERTIES — as of 2026-03-20

## Active Properties (13 total)

| Property Name | Property Code | Country | Property Group | Multi-Building |
|---|---|---|---|---|
| Flow Miami World | flow_miami_world | US | Flow Miami (parent) | Yes |
| Flow Miami East | flow_miami_east | US | Flow Miami | Yes |
| Flow Miami West | flow_miami_west | US | Flow Miami | Yes |
| Flow House | flow_house | US | Flow House | No |
| Flow Brickell | flow_brickell | US | Flow Brickell | No |
| Flow Fort Lauderdale | flow_fort_lauderdale | US | — | — |
| Stacks On Main | stacks_on_main | US | — | — |
| Trace | trace | US | — | — |
| 2010 West End | 2010_west_end | US | — | — |
| 3005 Buckhead | 3005_buckhead | US | — | — |
| Flow Granada | flow_granada | — | — | — |
| Flow Narjis East | flow_narjis | — | — | — |
| Flow Olaya | flow_olaya | — | — | — |

## Notes
- Flow Miami has 3 sub-properties: World (parent), East, West. Each has its own Yardi ID.
- Flow Brickell is the DeepSky ACES V2 Phase 1 sandbox target (Smart Agreements).
- Flow Granada, Narjis, Olaya are MENA properties (Saudi Arabia based on MENA org).
- G-West and Block E were referenced in the learning task but do NOT appear in the current Snowflake properties table — likely pipeline names, development names, or pre-acquisition assets.
- Stacks On Main is a US property; Trace appears to be a US multifamily property.
- 2010 West End and 3005 Buckhead suggest Atlanta-area properties (West End, Buckhead are Atlanta neighborhoods).

## Property Groups
- **Flow Miami** — World / East / West (multi-building campus)
- **Flow Brickell** — standalone
- **Flow House** — standalone
- All others appear to be standalone or group parents

## DeepSky Migration Status
- As of March 2026: DEEPSKY_PROPERTY_ID is null for all properties viewed — migration in progress
- Yardi remains the system of record for US properties
- DeepSky cutover targeted post-April 2026
