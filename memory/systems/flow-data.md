# Flow Data Systems

## Property P&L
- Tables: prop_pnl_actuals, prop_pnl_budget, prop_pnl_config
- Property keys: society (FFL), caoba (Flow Miami), fmAdj (Flow Miami Adjusted — use this), brickell (Flow Brickell), G-West/E507 (Flow House — no financials)
- Always use fmAdj for Flow Miami, not caoba
- monthLabels index 56 = Jan 2026, 57 = Feb 2026

## Snowflake
- Read-only (DS001 rule — no INSERT/UPDATE/DELETE/DROP)
- Flow Brickell PROPERTY_DID: 4875a65e11a1f987c22dab5e65238a26, Yardi ID: 59
- For leasing funnel: use ANALYTICS.MULTIFAMILY.PROSPECT_DETAILS, not HOUSE.GROSS_LEASING_FUNNEL

## Close Status
- mbr_last_closed_month = 2026-02 (February 2026) — advanced 2026-03-18 at 19:02 UTC

## Sage GL
- Join: intacct_monthly_dept_balances → intacct_departments → dim_bu_mapping
- dim_fs_mapping uses gl_account_number (not account_no), financial_statement = 'Profit and Loss'

## OpCo Scope
- section = 'opco': Executive, Tech, Growth & Revenue, F&B, Hotel, Shared Services
- Property Mgmt and owned assets: 're_ops'

## Ingest Endpoint
- https://flow-intranet.vercel.app/api/knowledge/ingest-telegram
- Auth: Bearer 32ef2958033b68b6ff03582e7f828674c719a8a88da398a42bb5c31233d30e6c
