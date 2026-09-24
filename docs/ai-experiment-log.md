# AI Experiment Log

One row per experiment run. Reproducibility rule: model name, version, prompt version, and date are mandatory.

| Date | Model | Prompt Version | Input Type | Cases Generated | Passed Deterministic Checks | Human Review Decision | Notes |
|---|---|---|---|---:|---:|---|---|
| 2026-09-23 | Chat Playground (record exact deployment in your notes) | A | Synthetic requirement text | 6 | 0 | Reject | Wrong schema (id/description/expected_output), invented fields (risk_assessment_score), realistic fake PII (names, raw credit scores), forbidden eligibility language |
| 2026-09-23 | Chat Playground (same deployment as A) | B | Synthetic requirement text | 13 | 13 | Accept for review | Clean JSON array, correct schema, all requirementIds within RQ-001..008, no forbidden scope terms |

## How to fill this in

1. Run each prompt in the Azure AI Foundry Chat Playground (or approved alternative).
2. Save raw output under `artifacts/foundry/prompt-{a,b}-output.json`.
3. Run `node scripts/evaluate-ai-tests.mjs artifacts/foundry/prompt-a-output.json` (and `prompt-b-…`).
4. Transcribe counts from the gate output and `artifacts/ai-test-evaluation.json`.
5. Commit the log + outputs together — the log row and its evidence travel in the same commit.
