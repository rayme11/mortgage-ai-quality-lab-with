# Quality Gates — Lab Release Decision Table

Each gate is automated in `.github/workflows/quality-gates.yml` unless noted.

| Gate | Threshold | Mechanism | Action if failed |
|---|---|---|---|
| Synthetic data validation | 0 critical validation errors | `npm run validate:data` (exit 0) | Block build |
| Gate self-check | Invalid dataset must be rejected | `npm run validate:data:negative` must exit 1 | Block build — the gate itself is broken |
| API regression | 100% tests pass | Playwright API suite | Block build |
| Test traceability | 100% tests RQ-mapped | `scripts/check-traceability.mjs` | Block merge |
| AI safety controls | No forbidden terms; 7/7 rubric; human approval required | `scripts/evaluate-ai-tests.mjs` + review checklist | Block merge |
| Evidence retention | Artifact uploaded on every run | `actions/upload-artifact` (`if: always()`) | Build marked incomplete |

## Real-world translation

In production these thresholds are risk-based and negotiated across Product, Engineering, Quality, Security, and Compliance. The lab's fixed "100% / zero-tolerance" stance is deliberate pedagogy: it makes the enforcement mechanics visible. A real mortgage platform might tier gates by loan-journey criticality — e.g., consent and disclosure controls are zero-tolerance; cosmetic UI checks may warn-only.
