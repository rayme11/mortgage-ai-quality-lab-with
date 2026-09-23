// Chapter 5 demo: deterministic evaluation of AI-generated test cases.
// Run: node scripts/evaluate-ai-tests.mjs artifacts/samples/ai-tests-good.json
// Exit 0 = at least one case accepted for human review AND no rejected cases.
// Exit 1 = one or more cases rejected (reasons logged, evidence written).
import fs from 'node:fs';

const path = process.argv[2] || 'artifacts/samples/ai-tests-good.json';
const tests = JSON.parse(fs.readFileSync(path, 'utf8'));

const allowedRequirements = new Set(
  ['RQ-001', 'RQ-002', 'RQ-003', 'RQ-004', 'RQ-005', 'RQ-006', 'RQ-007', 'RQ-008']
);
const forbidden = /(approve|deny|underwrite|rate[- ]lock|\bapr\b|adverse action|real ssn|real borrower|eligib)/i;

const results = tests.map((item) => {
  const reasons = [];
  const checks = {
    hasTestId: Boolean(item.testId),
    requirementTraceability: allowedRequirements.has(item.requirementId),
    hasRisk: Boolean(item.risk),
    hasPrecondition: Boolean(item.precondition),
    hasExpectedResult: Boolean(item.expectedResult),
    hasTestType: Boolean(item.testType),
    safeScope: !forbidden.test(JSON.stringify(item)),
  };

  if (!checks.hasTestId) reasons.push('missing testId');
  if (item.requirementId && !checks.requirementTraceability)
    reasons.push(`unknown requirementId: ${item.requirementId}`);
  if (!item.requirementId) reasons.push('missing requirementId');
  if (!checks.hasRisk) reasons.push('missing risk');
  if (!checks.hasPrecondition) reasons.push('missing precondition');
  if (!checks.hasExpectedResult) reasons.push('missing expectedResult');
  if (!checks.hasTestType) reasons.push('missing testType');
  if (!checks.safeScope) {
    const hit = JSON.stringify(item).match(forbidden);
    reasons.push(`forbidden scope term: "${hit ? hit[0] : 'unknown'}"`);
  }

  const score = Object.values(checks).filter(Boolean).length;
  return {
    testId: item.testId || '(missing)',
    score,
    checks,
    reasons,
    acceptedForReview: score === 7 && checks.safeScope,
  };
});

let accepted = 0;
for (const r of results) {
  if (r.acceptedForReview) {
    accepted++;
    console.log(`✅ ${r.testId} (score ${r.score}/7) — accepted for human review`);
  } else {
    console.log(`❌ ${r.testId} (score ${r.score}/7) — ${r.reasons.join('; ')}`);
  }
}

fs.mkdirSync('artifacts', { recursive: true });
const evidence = {
  source: path,
  evaluatedAt: new Date().toISOString(),
  syntheticDataOnly: true,
  total: results.length,
  acceptedForReview: accepted,
  rejected: results.length - accepted,
  note: 'Acceptance means eligible for human review, not approved for the test suite.',
  results,
};
fs.writeFileSync('artifacts/ai-test-evaluation.json', JSON.stringify(evidence, null, 2));

console.log(
  `\n${accepted}/${results.length} cases accepted for review. Evidence → artifacts/ai-test-evaluation.json`
);
process.exit(accepted === results.length && results.length > 0 ? 0 : 1);
