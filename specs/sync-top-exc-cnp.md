# Spec: GL Sync — Delete-Before-Upsert

**Author:** Wade  
**Date:** 2026-03-20  
**Status:** RESOLVED — root cause identified and fixed by Colin on 2026-03-20

---

## Root Cause (Resolved)

**Stale GL records in Supabase from previous manual syncs.** The sync script upserts on `record_no` but never deletes. Over time, records that were corrected, moved, or deleted in Sage persisted in the table with outdated values.

Example: E100 had a phantom ($695,500) Proskauer reversal in the accrual book that Sage's own GL report didn't show — it was a leftover from an earlier sync that got superseded.

This caused Legal Expense to show ($1.3M) YTD instead of ~$300K on the MBR dashboard. We initially thought this required syncing a second book (`Top Exc CnP`) but it did not — after a clean resync, 64/64 expense accounts tie to the penny against the OTC Consol Excel.

**Not needed:** syncing `Top Exc CnP` as a second book. The accrual book is correct after a clean sync.

---

## Fix Applied

Deleted all accrual GL records from Nov 2025 onward and re-synced 5 months clean from Sage.

---

## Required Going Forward

**Nightly cron and manual sync script should delete GL records for the months being synced before upserting**, rather than relying on upsert alone. This purges stale records automatically.

```js
// In scripts/sync-intacct.mjs, before upsert loop:
await supabase
  .from('intacct_gl_detail')
  .delete()
  .gte('entry_date', syncStartDate)
  .lte('entry_date', syncEndDate);

// Then proceed with insert (can use insert instead of upsert)
```

This is a small change (~30 min) that prevents the issue from recurring.
