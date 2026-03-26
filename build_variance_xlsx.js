const XLSX = require('./node_modules/xlsx');

const summary = [
  ['Feb 2026 — OTC Consol vs Sage GL Reconciliation'],
  ['Prepared by Wade | March 21, 2026'],
  [],
  ['Budget Department', 'OTC Consol Net', 'Sage GL Net', 'Variance ($)', 'Variance (%)', 'Status'],
  ['Data',           -96504,   -96504,      0,    '0.0%', 'EXACT'],
  ['Development',   -482713,  -482713,      0,    '0.0%', 'EXACT'],
  ['Executive',    -1352828, -1352828,      0,    '0.0%', 'EXACT'],
  ['F&B',           -211073,  -219783,   8710,    '4.1%', 'ACCOUNTING ERROR'],
  ['Finance',       -420678,  -423202,   2524,    '0.6%', 'TIMING'],
  ['Flow Practice',  -72304,   -72304,      0,    '0.0%', 'EXACT'],
  ['GnR OH',        -338285,  -338285,      0,    '0.0%', 'EXACT'],
  ['Hotel',          294898,   312898,  -18000,   '-5.8%', 'OTC COMPILATION ERROR'],
  ['IT',            -190175,  -190175,      0,    '0.0%', 'EXACT'],
  ['Lease Up',      -162761,  -162761,      0,    '0.0%', 'EXACT'],
  ['Legal',         -191427,  -193931,   2504,    '1.3%', 'TIMING'],
  ['Marketing',     -524725,  -524725,      0,    '0.0%', 'EXACT'],
  ['MENA',          -718223,  -709432,  -8791,   '-1.2%', 'TIMING (2 entries)'],
  ['People',        -231670,  -231669,     -1,    '0.0%', 'EXACT'],
  ['Property Mgmt',   22031,    22029,      2,    '0.0%', 'EXACT'],
  ['RTX',           -268102,  -268102,      0,    '0.0%', 'EXACT'],
  ['Real Estate',   -290951,  -290951,      0,    '0.0%', 'EXACT'],
  ['Studio',         -73195,   -75205,   2010,    '2.7%', 'TIMING'],
  ['Tech',         -2480103, -2480103,      0,    '0.0%', 'EXACT'],
  [],
  ['TOTAL',        -7788788, -7777745, -11043,    '0.1%', ''],
];

const detail = [
  ['Feb 2026 — Variance Detail & Root Cause Analysis'],
  [],
  ['#', 'Dept', 'Variance ($)', 'Category', 'Root Cause Summary', 'Account', 'Entity', 'Specific Entries', 'Recommended Action'],

  [1, 'F&B', 8710, 'ACCOUNTING ERROR — Duplicate Accrual',
   'FTL Grocer rent booked twice on Feb 28. Accrual was not reversed when actual bill was posted.',
   '65010 - Rent - Internal',
   'Flow FS LLC (E215)',
   'Entry 1: Flow FS Grocer lease monthly accrual Feb 2026 | Dept: Food and Beverage - FTL | $8,709.75' +
   '\nEntry 2: Bill - PMG Greybrook Riverfront I, LLC: Monthly Rent - Flow Grocer Space | Dept: Food and Beverage | $8,709.75',
   'Accounting to reverse the FTL Grocer rent accrual. One of the two $8,709.75 entries should be voided.'],

  [2, 'Hotel', -18000, 'OTC COMPILATION ERROR — Incomplete IC Elimination',
   'Hotel Revenue - Internal ($26,325) at E215 is eliminated in OTC, but matching Travel - Lodging ($26,325) at E210 is NOT eliminated. Leaves $26,325 phantom expense in OTC. Additional $8,325 from revenue timing differences.',
   '40402 - Hotel Revenue - Internal / 63510 - Travel - Lodging',
   'E215 (Flow FS LLC) / E210 (FOL Management LLC)',
   'E215: Hotel Revenue - Internal ($26,325) credit — eliminated in OTC' +
   '\nE210: Travel - Lodging ($26,325) debit — kept in OTC as expense' +
   '\nMemo: 02.2026 - To recognize co-working space rental deposits received in Jan' +
   '\nAdditional: OTC Reservation Revenue $731,588 vs GL $725,363 (+$6,225) and Resort Fee $63,770 vs $61,671 (+$2,099) — revenue recorded in OTC before final true-up in Sage',
   'Accounting to review IC elimination in OTC Consol. Both sides of the Hotel/FOL Management interco must be eliminated. This is a structural fix needed in the consolidation setup.'],

  [3, 'MENA', -8791, 'TIMING — 2 late-posted entries (partially offsetting)',
   'Two entries posted after OTC export with opposite signs, netting to ($8,791).',
   '60520 - Legal Expense / 40401 - Other Revenue',
   'E125 (Flow MENA Real Estate Mgmt) / E510 (Flow MENA Limited)',
   'Entry A — MENA Legal: $20,000 accrual "MENA Legal Accruals - Latham & Watkins LLP Feb 2026" | Dept: MENA - Legal | E125 | No doc number' +
   '\nEntry B — MENA Corp Finance: $56,257 Brokerage Fee revenue vs OTC $37,466 | Dept: MENA - Corporate Finance | E510 | No doc number | Gap = $18,791 revenue',
   'Flag to MENA accounting: (1) Confirm L&W accrual is final. (2) Confirm brokerage fee revenue — Sage shows $56,257, OTC shows $37,466. Re-run OTC after close is finalized.'],

  [4, 'Finance', 2524, 'TIMING — Bill posted after OTC export',
   'Connor Group Global Services bill posted to Sage after OTC was exported.',
   '60530 - Accounting & Tax',
   'FOL Management LLC (E210)',
   'Bill - Connor Group Global Services, LLC: Accounting services by Director | $2,524 | Dept: Corporate Accounting | Feb 28',
   'No action needed — will close when OTC is re-run. Confirm bill is coded correctly.'],

  [5, 'Legal', 2504, 'TIMING — Late entries at E210',
   'Small bills at FOL Management LLC (E210) posted after OTC export, partially offset by a Feb 5 credit entry.',
   '60520 - Legal Expense',
   'FOL Management LLC (E210)',
   'Feb 5: ($2,050) credit journal entry "Journal entry for uploaded transaction" at Legal / E210 — no document number' +
   '\nSmall bills at E210 (Lochrie & Chakas $2,145, $358.76; Sara Uz reimbursement $612.56) total ~$3,116 vs ($2,050) credit = net $2,504',
   'Investigate the Feb 5 ($2,050) credit at Legal / E210 — confirm it is correct. Remainder closes when OTC is re-run.'],

  [6, 'Studio', 2010, 'TIMING — E120 entry not captured in OTC',
   'Flow Companies Inc. (E120) has a $670 Software & Licenses entry in Sage GL that did not make it into the OTC Consol. E120 is in Top Exc CnP scope — likely posted after OTC export.',
   '65020 - Software & Licenses',
   'Flow Companies Inc. (E120)',
   '$670 Software & Licenses at Studio / E120. In Sage GL file, not in OTC. Total GL Studio Software = $4,129 (E210 $3,459 + E120 $670). OTC shows $2,120.',
   'Will resolve when OTC is re-run. Confirm E120 Studio entry is correct.'],
];

const wb = XLSX.utils.book_new();

const ws1 = XLSX.utils.aoa_to_sheet(summary);
ws1['!cols'] = [{wch:20},{wch:16},{wch:14},{wch:14},{wch:13},{wch:25}];
ws1['!merges'] = [{s:{r:0,c:0}, e:{r:0,c:5}}, {s:{r:1,c:0}, e:{r:1,c:5}}];
XLSX.utils.book_append_sheet(wb, ws1, 'Summary');

const ws2 = XLSX.utils.aoa_to_sheet(detail);
ws2['!cols'] = [{wch:4},{wch:16},{wch:13},{wch:30},{wch:55},{wch:35},{wch:32},{wch:75},{wch:60}];
ws2['!merges'] = [{s:{r:0,c:0}, e:{r:0,c:8}}];
XLSX.utils.book_append_sheet(wb, ws2, 'Variance Detail');

XLSX.writeFile(wb, 'feb2026_variance_analysis.xlsx');
console.log('Done');
