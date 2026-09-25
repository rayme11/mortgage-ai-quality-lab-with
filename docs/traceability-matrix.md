# Traceability Matrix — Mortgage AI Quality Lab

Chain: Requirement → Risk → Test → Result → Evidence. Every artifact cited below exists in this repo or in CI.

| Requirement | Risk | Test ID | Test Type | Automation | Evidence | Status |
|---|---|---|---|---|---|---|
| RQ-001 (Application ID) | Malformed/duplicate IDs break POS↔LOS reconciliation | API-001, API-005 | API positive/negative | Playwright + validate-data.mjs | Playwright report; data-validation-report.json | Automated |
| RQ-002 (Required attributes) | Missing fields corrupt downstream mappings | API-001; validator Layer 1 | Contract | Ajv schema + Playwright | data-validation-report.json | Automated |
| RQ-003 (Allowed values) | Bad enums break investor/AUS code mappings | API-003…005; validator enums | Negative | Ajv schema | CI Gate 1 log | Automated |
| RQ-004 (Monetary integrity) | Bad numbers poison LTV/DTI calculations | API-004, API-006; validator Layer 2 | Negative/boundary | Playwright + validate-data.mjs | Playwright report | Automated |
| RQ-005 (Consent control) | Submission without consent = TRID/E-SIGN control failure | API-003; validator consent rule | Negative/compliance | Playwright + validate-data.mjs | CI Gates 1–3 | Automated |
| RQ-006 (Write authorization) | Unauthenticated writes to loan records | API-007 | Authorization | Playwright | Playwright report | Automated |
| RQ-007 (Idempotent submission) | Network retry duplicates a loan file | API-008 | Idempotency | Playwright | Playwright report | Automated |
| RQ-008 (Evidence & auditability) | Test/AI evidence lost or unverifiable | Gate 4 (check-traceability); evaluate-ai-tests.mjs | CI/governance | GitHub Actions | quality-evidence artifacts; ai-test-evaluation.json; ai-experiment-log.md | Automated |

## How to read this in an interview

- Rows 1–7: classic requirement→test→evidence traceability, all automated, all enforced by the Chapter 4 pipeline.
- Row 8: the meta-control — the system watches itself (traceability gate + AI evaluator + retained artifacts).
- The matrix is *living*: adding a test without an RQ mapping fails CI, so this document cannot silently rot.
