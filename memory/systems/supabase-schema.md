# Supabase Schema — Flow Database
*Pulled March 20, 2026 | 95 tables total*

## FPA / Finance Planning
- `fpa_scenarios` — budget/forecast scenarios (filter is_active=true)
- `fpa_dept_pnl_monthly` — dept P&L by scenario, BU, department, month
- `fpa_dept_pnl` — summary dept P&L
- `fpa_dept_gl_detail` — GL detail by dept
- `fpa_pnl_monthly` — consolidated P&L (opco/mena/re_ops/consolidated sections)
- `fpa_headcount_monthly` — headcount by scenario, BU, dept, month (fte_count column)
- `fpa_employees` — employee list by scenario
- `fpa_vendors` — vendor data by scenario, dept, category
- `fpa_kpis` — KPI metrics by scenario
- `fpa_liquidity_weekly` — weekly liquidity/cash data
- `fpa_sync_log` — sync tracking
- `fpa_document_chunks` — FPA document embeddings
- `f2_forecast_vendors` — F2 forecast vendor data

## Property P&L
- `prop_pnl_actuals` — property actuals AND budget (5.8MB — primary property data source)
- `prop_pnl_budget` — property budget data
- `prop_pnl_budget_kpis` — property budget KPIs
- `prop_pnl_config` — month labels, config for property P&L
- `prop_pnl_gl` — property GL detail
- `prop_pnl_marketing` — property marketing spend
- `prop_pnl_pricing` — rent pricing data (16MB)
- `prop_pnl_rented_units` — rented unit detail

## Intacct / Sage GL
- `intacct_gl_detail` — full GL journal entries (623MB — large, use carefully)
- `intacct_monthly_dept_balances` — pre-aggregated dept balances (8.6MB)
- `intacct_monthly_balances` — monthly balances (8.7MB)
- `intacct_accounts` — chart of accounts (518 rows)
- `intacct_departments` — department list
- `intacct_entities` — entity list
- `intacct_book_entities` — book-entity mappings
- `intacct_consolidation_books` — consolidation books
- `intacct_sync_log` — sync tracking
- `dim_fs_mapping` — GL account → P&L bucket mapping (gl_account_number col, financial_statement = 'Profit and Loss')

## Ramp
- `ramp_transactions` — card transactions (174MB)
- `ramp_bills` — vendor invoices/bills (49MB)
- `ramp_reimbursements` — expense reimbursements (79MB)
- `ramp_trips` — travel data (5.7MB)
- `ramp_sync_log` — sync tracking

## Headcount / People
- `mbr_current_roster` — Rippling employee data (filter Employment status = 'Active' for 346 active)
- `mbr_rippling_headcount_weekly` — weekly headcount snapshots (1.5MB)
- `matt_employees` — appears to be another employee dataset
- `profiles` — user profiles

## Dimension / Mapping Tables
- `dim_bu_mapping` — source system → budget BU/dept mapping
- `dim_bu_department` — BU department definitions
- `dim_bu_scopes` — BU scope definitions
- `opco_dim_account` — OpCo account dimensions
- `opco_dim_class` — OpCo class dimensions
- `opco_dim_department` — OpCo dept dimensions
- `opco_dim_entity` — OpCo entity dimensions
- `opco_dim_vendor` — OpCo vendor dimensions
- `opco_dim_spend_category` — spend categories

## OpCo GL (separate from Intacct?)
- `opco_gl_lines` — OpCo GL lines (6.7MB)
- `opco_monthly_pl` — OpCo monthly P&L (2MB)
- `opco_pl_account_map` — account mapping

## Toast / F&B
- `toast_orders` — POS orders (83MB)
- `toast_order_items` — order line items (75MB)
- `toast_payments` — payment data (16MB)
- `toast_menu_items` — menu items (5.7MB)
- `toast_time_entries` — labor time entries (1.5MB)
- `toast_sync_log` — sync tracking

## Knowledge / AI
- `knowledge_chunks` — vector embeddings for KB search (13GB — largest table)
- `knowledge_documents` — document metadata (2.8MB)
- `agent_conversations` — AI conversation logs
- `agent_memories` — AI memory storage (1.9MB)
- `agent_messages` — AI messages (216KB)
- `conversation_turns` — conversation history (5.5MB)
- `conversation_compactions` — compacted conversation summaries
- `learning_feedback` — user feedback on AI insights
- `analysis_runs` — AI analysis run logs
- `ingestion_log` — knowledge ingestion tracking

## Debt / Finance
- `debt_loans` — loan records
- `debt_covenants` — loan covenants
- `debt_guarantees` — guarantees
- `debt_forward_sofr` — SOFR rate data
- `debt_document_chunks` — debt document embeddings (192MB)
- `cash_forecast_highlights` — cash forecast highlights
- `fpa_liquidity_weekly` — weekly liquidity

## App / Config
- `app_config` — key-value config (includes mbr_last_closed_month)
- `go_links` — internal URL shortcuts
- `page_access` — page access controls
- `scheduled_tasks` — scheduled task definitions
- `assistant_actions` — AI assistant action log
- `assistant_artifacts` — generated artifacts
- `assistant_audit_log` — audit trail (904KB)
- `assistant_jobs` — async job tracking

## Other
- `decks` / `slides` / `slide_versions` / `deck_permissions` — presentation data
- `procedure_templates` — process/SOP templates
- `comments` — comments system
- `auth_events` — auth audit log
- `google_tokens` — Google OAuth tokens
- `guest_access_tokens` — guest access
- `hack_test_attempts` / `hack_test_secrets` — security testing
- `podcast_episodes` — podcast content
- `invited_roles` — role invitations
