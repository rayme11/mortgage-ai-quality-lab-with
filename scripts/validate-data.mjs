// Chapter 2 demo: deterministic data-quality gate.
// Run: node scripts/validate-data.mjs data/synthetic-loans.csv
// Exit 0 = all rows valid. Exit 1 = gate failed, evidence written to artifacts/.
import fs from 'node:fs';
import { parse } from 'csv-parse/sync';
import Ajv from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

const file = process.argv[2] || 'data/synthetic-loans.csv';
const schema = JSON.parse(
  fs.readFileSync('schemas/mortgage-application.schema.json', 'utf8')
);

const text = fs.readFileSync(file, 'utf8');
const rows = parse(text, { columns: true, skip_empty_lines: true });

// CSV gives us strings; coerce to the schema's types.
const coerce = (row) => ({
  ...row,
  loanAmount: Number(row.loanAmount),
  propertyValue: Number(row.propertyValue),
  monthlyIncome: Number(row.monthlyIncome),
  monthlyDebt: Number(row.monthlyDebt),
  privacyConsent: row.privacyConsent === 'true',
  electronicConsent: row.electronicConsent === 'true',
});

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);
const validate = ajv.compile(schema);

const errors = [];
const seenIds = new Map();

rows.forEach((raw, idx) => {
  const rowNum = idx + 1; // data row number (header excluded)
  const row = coerce(raw);
  const id = row.applicationId ?? `row-${rowNum}`;
  const label = `Row ${rowNum} (${id})`;

  // Layer 1: structural contract (JSON Schema)
  if (!validate(row)) {
    for (const err of validate.errors) {
      const field = err.instancePath.replace('/', '') || '(record)';
      errors.push({ row: rowNum, id, field, message: `${field} ${err.message}` });
    }
  }

  // Layer 2: semantic business rules the schema can't express
  const submittedLike = row.status === 'submitted' || row.status === 'in_review';
  if (submittedLike && row.privacyConsent !== true) {
    errors.push({ row: rowNum, id, field: 'privacyConsent', message: `${row.status} status requires privacyConsent = true` });
  }
  if (submittedLike && row.electronicConsent !== true) {
    errors.push({ row: rowNum, id, field: 'electronicConsent', message: `${row.status} status requires electronicConsent = true` });
  }
  if (row.loanAmount > 0 && row.propertyValue > 0 && row.loanAmount > row.propertyValue) {
    errors.push({ row: rowNum, id, field: 'loanAmount', message: 'loanAmount exceeds propertyValue (LTV > 100%)' });
  }

  // Layer 3: reconciliation — duplicate application IDs
  if (id) {
    if (seenIds.has(id)) {
      errors.push({ row: rowNum, id, field: 'applicationId', message: `duplicate applicationId (first seen at row ${seenIds.get(id)})` });
    } else {
      seenIds.set(id, rowNum);
    }
  }
});

// Evidence artifact
fs.mkdirSync('artifacts', { recursive: true });
const report = {
  file,
  validatedAt: new Date().toISOString(),
  syntheticDataOnly: true,
  totalRows: rows.length,
  validRows: rows.length - new Set(errors.map((e) => e.row)).size,
  errorCount: errors.length,
  errors,
};
fs.writeFileSync('artifacts/data-validation-report.json', JSON.stringify(report, null, 2));

// Gate verdict
if (errors.length === 0) {
  console.log(`✅ ${file} — ${rows.length}/${rows.length} rows valid`);
  console.log('📄 Report written to artifacts/data-validation-report.json');
  process.exit(0);
} else {
  console.log(`❌ ${file} — ${report.validRows}/${rows.length} rows valid, ${errors.length} errors\n`);
  for (const e of errors) {
    console.log(`  Row ${e.row} (${e.id}): ${e.message}`);
  }
  console.log('\n📄 Report written to artifacts/data-validation-report.json');
  process.exit(1);
}
