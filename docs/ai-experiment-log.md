# AI Experiment Log

One row per experiment run. Reproducibility rule: model name, version, prompt version, and date are mandatory.

| Date | Model | Prompt Version | Input Type | Cases Generated | Passed Deterministic Checks | Human Review Decision | Notes |
|---|---|---|---|---:|---:|---|---|
| 2026-09-23 | _enter model/version_ | A | Synthetic requirement text | _n_ | _n_ | _accept/revise/reject_ | _e.g., prose wrapper, invented requirement IDs_ |
| 2026-09-23 | _enter model/version_ | B | Synthetic requirement text | _n_ | _n_ | _accept/revise/reject_ | _e.g., clean JSON, all RQ-mapped_ |

## How to fill this in

1. Run each prompt in the Azure AI Foundry Chat Playground (or approved alternative).
2. Save raw output under `artifacts/foundry/prompt-{a,b}-output.json`.
3. Run `node scripts/evaluate-ai-tests.mjs artifacts/foundry/prompt-a-output.json` (and `prompt-b-…`).
4. Transcribe counts from the gate output and `artifacts/ai-test-evaluation.json`.
5. Commit the log + outputs together — the log row and its evidence travel in the same commit.
