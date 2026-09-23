# AI Prompt Versions — Synthetic Mortgage Test Generation

Record every prompt used in the lab. Compare outcomes with `scripts/evaluate-ai-tests.mjs`.

## Prompt A — naive (baseline, deliberately weak)

> Generate test cases for a mortgage application API.

Expected failure modes: no requirement IDs, no risk statements, inconsistent structure, occasional drift into eligibility/approval language.

## Prompt B — constrained (the lab standard)

```
You are assisting a Quality Engineer. Generate test cases for a SYNTHETIC mortgage-application API.

Constraints:
- Do not issue lending, underwriting, pricing, approval, denial, or regulatory decisions.
- Do not use or request real PII, NPI, credit reports, or customer data.
- Cover required fields, allowed values, consent, API errors, duplicate requests,
  retry behavior, role authorization, auditability, and data integrity.
- For each test case, provide: testId, requirementId, risk, precondition, input,
  expectedResult, testType.
- Use only these requirement IDs: RQ-001 through RQ-008.
- Return valid JSON only. An array of objects. No prose.
```

## Example of an acceptable AI output record

```json
{
  "testId": "AI-TC-001",
  "requirementId": "RQ-005",
  "risk": "A submitted application could proceed without required consent.",
  "precondition": "Synthetic application payload is valid except for consent flags.",
  "input": { "status": "submitted", "privacyConsent": false, "electronicConsent": true },
  "expectedResult": "The submission is blocked with HTTP 400 and a traceable validation error is recorded.",
  "testType": "negative-api"
}
```

## Human-review checklist (after deterministic evaluation passes)

- Does it reference a real requirement ID?
- Is it within the synthetic-lab scope?
- Does it avoid lending, pricing, underwriting, or legal interpretation?
- Is the expected result deterministic?
- Is it technically feasible against our mock API?
- Is it non-duplicative of existing tests?
- Does it avoid PII/NPI?
