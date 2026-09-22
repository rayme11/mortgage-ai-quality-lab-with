# Mortgage AI Quality Lab — Learning Path

A step-by-step, chapter-based tutorial to prepare for an **ICE Mortgage Technology (Encompass)** interview.
Each chapter lives on its own git branch (`chapter/NN-name`), teaches concepts first, then ends with a **small running demo** you execute yourself.

> Golden rule for the whole lab: **synthetic data only.** No real borrower, loan, credit, income, or property data. Ever.

---

## How this works

1. Each chapter branch contains: a lesson file in `docs/learning/` + runnable code/data for that chapter.
2. You read the lesson, run the demo, and tell me **"next"** before I build the following chapter.
3. When all chapters are done, we merge them into `main` one by one so the final repo tells a clean story.

## Chapter Map

| # | Branch | Topic | Concepts you'll learn | Demo |
|---|--------|-------|----------------------|------|
| 0 | `chapter/00-orientation` | Lab orientation | What ICE Encompass does, LOS vs POS vs servicing, why QE matters in mortgage | Tour of repo structure |
| 1 | `chapter/01-mortgage-domain-synthetic-data` | Mortgage domain + synthetic data | Loan lifecycle, application attributes (LTV, DTI, credit bands, occupancy), why synthetic data | Node script computes LTV/DTI from a synthetic CSV |
| 2 | `chapter/02-data-quality-etl` | Data quality & ETL | ETL pipelines, data contracts, schema validation (JSON Schema), idempotency, reconciliation | `validate-data.mjs` passes good CSV, fails bad CSV with evidence |
| 3 | `chapter/03-api-testing-playwright` | API testing with Playwright | REST contracts, positive/negative/boundary tests, mock servers | Playwright API suite against a local mock mortgage API |
| 4 | `chapter/04-cicd-quality-gates` | CI/CD quality gates | GitHub Actions, fail-fast gates, artifacts as evidence | `quality-gates.yml` pipeline runs validation + tests on every push |
| 5 | `chapter/05-ai-test-generation` | AI-assisted test generation | LLM-as-drafter, deterministic evaluation, rubric scoring, human-in-the-loop | `evaluate-ai-tests.mjs` scores AI-generated test cases |
| 6 | `chapter/06-azure-ai-foundry` | Azure AI Foundry | Prompt experiments, Prompt A vs B comparison, experiment logging | Prompt experiment log + rubric comparison |
| 7 | `chapter/07-traceability-metrics` | Traceability & metrics | Requirement→risk→test→result traceability, quality KPIs, release gates | Traceability matrix + quality-metrics JSON |
| 8 | `chapter/08-interview-prep` | Interview preparation | 90-second demo script, STAR stories, likely Q&A | Rehearsed walkthrough of the finished repo |

## Suggested pace

- One chapter per sitting (~30–60 min each).
- Chapters 0–2 build the foundation; 3–4 are the engineering core; 5–6 are the AI story; 7–8 are the interview payoff.
