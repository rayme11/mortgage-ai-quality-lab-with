# Chapter 7 — Traceability & Quality Metrics

**Branch:** `chapter/07-traceability-metrics` | **Time:** ~45 min | **Demo:** generate the traceability matrix + metrics summary from real repo artifacts

---

## 7.1 Why traceability is the crown jewel

Everything so far — contracts, tests, gates, AI evaluation — produces *isolated* evidence. Traceability is the spine that connects them:

$$\text{Requirement} \rightarrow \text{Risk} \rightarrow \text{Test} \rightarrow \text{Result} \rightarrow \text{Evidence}$$

In a regulated shop, this chain answers the auditor's only question: **"How do you know this requirement is tested, and where's the proof?"** If any link is missing, the honest answer is "we don't know" — which is why Chapter 4's gate *blocks merges* when a test lacks an RQ mapping.

## 7.2 The lab's traceability chain

[docs/traceability-matrix.md](../../docs/traceability-matrix.md) is the human-readable spine. Notice every row cites artifacts that *actually exist* in this repo — that's what makes it credible in an interview:

| Requirement | Risk | Test(s) | Evidence |
|---|---|---|---|
| RQ-001 | Malformed/duplicate IDs break POS↔LOS reconciliation | API-001, API-005 + validator | Playwright report, data-validation-report.json |
| RQ-005 | Submission without consent (TRID/E-SIGN analog) | API-003 + validator rule | Playwright report, CI gate 1 |
| RQ-007 | Retry duplicates a loan file | API-008 | Playwright report |
| RQ-008 | Unsafe AI output enters the suite | evaluate-ai-tests.mjs | ai-test-evaluation.json, ai-experiment-log.md |

And [scripts/check-traceability.mjs](../../scripts/check-traceability.mjs) (Chapter 4) is the *enforcement* — the matrix documents intent, the gate enforces it in CI.

## 7.3 Quality metrics: what to measure and what to claim

[scripts/quality-metrics.mjs](../../scripts/quality-metrics.mjs) computes a metrics summary from **real repo artifacts** — not hand-waved numbers:

| Metric | Source | Interview meaning |
|---|---|---|
| Automated tests / mapped to requirements | spec file scan | "100% of my automated tests are requirement-mapped — enforced in CI" |
| Data validation pass/fail | data-validation-report.json | Data-quality gate health |
| AI acceptance rate (Prompt A vs B) | ai-test-evaluation.json + experiment log | Your quantified prompt-engineering result: **0/6 → 13/13** |
| CI gate results | GitHub Actions runs | Pipeline reliability |

**The cardinal rule (memorize this):** never present lab numbers as production results. The framing is: *"These are synthetic-lab metrics that demonstrate how I would instrument a real program — the dashboards would look like this, fed by real pipelines."* Interviewers at regulated companies are specifically listening for that honesty.

## 7.4 Demo: generate your evidence summary

```bash
npm run metrics
```

The script scans the repo, computes the numbers, writes `artifacts/quality-metrics.json`, and prints a summary like:

```
Quality Metrics — Synthetic Mortgage Lab (generated 2026-09-23)
==============================================================
Automated API tests:            8 (8/8 requirement-mapped ✅)
Data validation (good file):    4/4 rows valid
Data validation (bad file):     6 defects caught (expected)
AI test generation:             Prompt A 0/6 → Prompt B 13/13 accepted
Traceability gate:              enforced in CI (check-traceability.mjs)
==============================================================
Evidence → artifacts/quality-metrics.json
```

That JSON is the dataset you'd feed a dashboard — and the *shape* of the conversation you'll have with a hiring manager.

## 7.5 Release gates: the decision table

[docs/quality-gates.md](../../docs/quality-gates.md) turns metrics into decisions:

| Gate | Threshold | If failed |
|---|---|---|
| Synthetic data validation | 0 critical errors | Block build |
| API regression | 100% pass | Block build |
| Test traceability | 100% RQ-mapped | Block merge |
| AI safety | No forbidden terms + human approval | Block merge |
| Evidence | Artifact retained per run | Build marked incomplete |

In a real org these thresholds are negotiated with Product, Engineering, Security, and Compliance — your job as QE lead is to *propose* them with risk rationale and *enforce* them mechanically. The demo tables above are exactly that proposal, miniaturized.
