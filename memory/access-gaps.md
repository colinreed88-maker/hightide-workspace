# Access Gaps — Things Wade Needs to Learn More

Last updated: March 20, 2026

## High Priority

### DeepSky / DeepDive API
- Wade has architectural knowledge (from Beckett's Slack posts) but no direct access
- DeepDive API provides: Cypher queries against property graph, MCP endpoint, NATS subscription tools
- Beckett offered to set up sandbox access for Ilan — has Colin been included?
- **Ask Colin:** DeepSky integration timeline for Wade?

### Snowflake — MENA Properties
- US properties confirmed in ANALYTICS.FLOW.PROPERTIES
- MENA properties (Granada, Narjis East, Olaya) confirmed by name but Yardi/operational data not confirmed in Snowflake
- Need to verify what MENA data is accessible vs. what lives in a separate system

### G-West — Location/Market
- Confirmed active construction project (OAC meeting March 19)
- Not yet in Snowflake property table
- **Ask Colin:** Which city/market? US or MENA?

### Block E — Deal Status
- Referenced in March 10 liquidity meeting: "funding secured for next two weeks — need plan to refinance or sell"
- Not in Snowflake property table
- **Ask Colin:** Refinance or sell? What's the current status?

## Medium Priority

### Hamilton Merrill's MENA Coverage Detail
- Know Hamilton covers MENA, Tech, IT, Data & Analytics, RTX
- Don't have good context on MENA business partners, deal flow, or what "RTX" refers to
- Would benefit from a MENA org briefing

### Yardi — Write Access / Event Bus
- Currently read-only access to Yardi data via Snowflake
- Deep Sky event bus write access (Scott Ryder's team) is the path to agent actions
- Status: ~2 weeks from AI Summit (March 11) — should be ready soon

### Opinion.com / Resident Satisfaction Data
- Referenced as data pipeline Colin owns
- No access or visibility into this data currently
- Key for connecting resident experience to NOI thesis

### Granola Meeting Notes
- Some meeting notes ingested but coverage is incomplete
- G-West OAC meetings, Board meetings, liquidity calls — would give much richer context

## Low Priority (nice to have)

### Google Drive — Flow Root Drive
- Forecast Excel files (29 dept + Master) live here
- No direct access — Colin shares via Telegram when needed

### Toast POS Raw Data
- F&B dashboard pulls aggregated data
- Raw transaction-level data would give better F&B insight for Jackie's coverage

### Resident Communications
- No visibility into what residents are actually saying
- Opinion.com would help; Twilio integration (AJ/Tech) would unlock more
