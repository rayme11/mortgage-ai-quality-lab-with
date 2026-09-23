// Chapter 1 demo: compute LTV/DTI over the synthetic loan portfolio.
// Run: node scripts/loan-ratios.mjs
// NOTE: ratios are data-integrity calculations only — never lending decisions.
import fs from 'node:fs';

const file = process.argv[2] || 'data/synthetic-loans.csv';
const [headerLine, ...lines] = fs.readFileSync(file, 'utf8').trim().split('\n');
const headers = headerLine.split(',');

const rows = lines.map((line) => {
  const values = line.split(',');
  return Object.fromEntries(headers.map((h, i) => [h, values[i]]));
});

const pct = (n) => `${(n * 100).toFixed(1)}%`;

console.log('Synthetic Mortgage Portfolio — Ratio Report');
console.log('='.repeat(50));

let analyzed = 0;
let skipped = 0;
let ltvSum = 0;
let dtiSum = 0;

for (const row of rows) {
  if (row.status === 'draft') {
    console.log(`${row.applicationId}  draft — skipped (not yet submitted)`);
    skipped++;
    continue;
  }

  const loanAmount = Number(row.loanAmount);
  const propertyValue = Number(row.propertyValue);
  const monthlyIncome = Number(row.monthlyIncome);
  const monthlyDebt = Number(row.monthlyDebt);

  if (propertyValue <= 0 || monthlyIncome <= 0) {
    console.log(`${row.applicationId}  ⚠ cannot compute ratios (non-positive value/income)`);
    skipped++;
    continue;
  }

  const ltv = loanAmount / propertyValue;
  const dti = monthlyDebt / monthlyIncome;
  ltvSum += ltv;
  dtiSum += dti;
  analyzed++;

  console.log(
    `${row.applicationId}  ${row.loanPurpose.padEnd(11)} ${row.occupancy.padEnd(11)} LTV ${pct(ltv).padStart(6)}   DTI ${pct(dti).padStart(6)}`
  );
}

console.log('='.repeat(50));
if (analyzed > 0) {
  console.log(
    `Portfolio averages (submitted/in_review only): LTV ${pct(ltvSum / analyzed)}  DTI ${pct(dtiSum / analyzed)}`
  );
}
console.log(`${analyzed} applications analyzed, ${skipped} skipped.`);
