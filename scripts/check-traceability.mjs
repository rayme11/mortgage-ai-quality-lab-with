// Gate 4: traceability enforcement.
// Fails the build if any Playwright test title lacks an RQ-### requirement mapping.
// Run: node scripts/check-traceability.mjs
import fs from 'node:fs';
import path from 'node:path';

const testDir = 'tests';
const specFiles = [];
const walk = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p);
    else if (/\.spec\.js$/.test(entry.name)) specFiles.push(p);
  }
};
walk(testDir);

const titleRe = /test\(\s*['"`](.+?)['"`]/g;
const rqRe = /RQ-\d{3}/;

const unmapped = [];
let total = 0;

for (const file of specFiles) {
  const src = fs.readFileSync(file, 'utf8');
  for (const match of src.matchAll(titleRe)) {
    total++;
    if (!rqRe.test(match[1])) unmapped.push({ file, title: match[1] });
  }
}

if (unmapped.length > 0) {
  console.error(`❌ Traceability gate failed — ${unmapped.length}/${total} tests lack an RQ-### mapping:`);
  for (const u of unmapped) console.error(`  ${u.file}: "${u.title}"`);
  process.exit(1);
}

console.log(`✅ Traceability gate passed — ${total}/${total} tests mapped to requirements.`);
