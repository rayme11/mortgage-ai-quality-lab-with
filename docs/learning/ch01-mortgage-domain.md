# Chapter 1 — The Mortgage Application & Synthetic Data

**Branch:** `chapter/01-mortgage-domain-synthetic-data` | **Time:** ~45 min | **Demo:** LTV/DTI calculator over a synthetic loan CSV

---

## 1.1 The 1003: what a loan application actually contains

In a real LOS like Encompass, the loan file centers on the **1003 (URLA)** form.
For our lab we model a *simplified intake slice* — the fields a POS would send to a LOS at submission.

| Field | What it is in the real world |
|---|---|
| `applicationId` | Unique loan file number. In Encompass, every loan gets a GUID + loan number. |
| `loanPurpose` | `purchase` or `refinance` (refis split further into rate/term vs cash-out) |
| `occupancy` | `primary`, `second_home`, `investment` — huge risk/pricing factor |
| `propertyType` | `single_family`, `condo`, `townhome`, `multi_family` |
| `loanAmount` | Amount borrowed |
| `propertyValue` | Appraised/estimated value |
| `monthlyIncome` | Qualifying monthly income (real systems: verified, not stated) |
| `monthlyDebt` | Recurring monthly obligations from the credit report |
| `creditScoreBand` | We use **bands**, not real scores — a privacy-safe modeling trick |
| `status` | `draft` → `submitted` → `in_review` → (`withdrawn`) |
| `privacyConsent` / `electronicConsent` | eConsent flags — real systems **must** capture consent before disclosures |
| `referralSource` | Where the borrower came from (agent, direct, partner) |
| `submittedAt` | Timestamp — feeds HMDA reporting and TRID timing clocks |

### Why consent flags matter (TRID / E-SIGN)
Under TRID and the E-SIGN Act, a lender cannot issue electronic disclosures without **affirmative electronic consent**. A system that lets `status = submitted` with `privacyConsent = false` is a **compliance defect**. This becomes a test scenario in Chapter 3 and a quality gate in Chapter 4.

---

## 1.2 The two ratios everyone asks about: LTV and DTI

**LTV — Loan-to-Value**

$$\text{LTV} = \frac{\text{Loan Amount}}{\text{Property Value}}$$

**DTI — Debt-to-Income**

$$\text{DTI} = \frac{\text{Monthly Debt}}{\text{Monthly Income}}$$

Example: $320,000 loan on a $400,000 home → LTV = 0.80 (80%).
$1,800 debt on $9,500 income → DTI ≈ 0.189 (18.9%).

> **Compliance boundary (say this in the interview):** In our lab, LTV/DTI are *data-calculation integrity checks* — we verify the math is computed and stored correctly. We **never** use them to approve/deny anyone. Eligibility decisions belong to the AUS and human underwriters, and the rules behind them (DU/LPA guides) are proprietary and regulated.

---

## 1.3 Why synthetic data — and why credit-score *bands*

Real mortgage data is **NPI** (nonpublic personal information) under GLBA. Even in a *demo*, using realistic SSNs or real names is a red flag. So the lab follows three rules:

1. **Invent everything.** Borrower identifiers are tokens, not names.
2. **Band, don't score.** `740_plus` instead of `742` — same test value, zero privacy surface.
3. **State the boundary.** README + docs say "synthetic, non-production" everywhere.

This is itself an interview answer: *"How do you handle test data in a regulated domain?"* → synthetic generation, banding/tokenization, and documented scope controls.

---

## 1.4 The synthetic datasets

[data/synthetic-loans.csv](../../data/synthetic-loans.csv) — 4 valid applications (varied purpose, occupancy, credit bands, one `draft` with consent **false**).

[data/synthetic-loans-invalid.csv](../../data/synthetic-loans-invalid.csv) — same shape but deliberately broken:

| Row | Defect planted | Real-world analog |
|---|---|---|
| APP-00000001 | `loanAmount` = **-320000** | Sign/mapping bug from an integration |
| APP-ABC | Malformed application ID | ID-generation defect |
| APP-00000003 | `loanPurpose` = `unknown`, `propertyValue` = **0** | Bad enum + divide-by-zero waiting to happen in LTV |
| APP-00000004 | `status` = `submitted` with consent = **false** | The TRID/E-SIGN compliance violation |

Chapter 2 turns these into a failing quality gate. Today we just compute ratios on the *valid* file.

---

## 1.5 Demo: compute LTV/DTI over the synthetic portfolio

Run from the repo root:

```bash
node scripts/loan-ratios.mjs
```

**What it does:** reads `data/synthetic-loans.csv`, computes LTV and DTI per application, prints a portfolio table plus averages — and **skips drafts** (a draft has no business being ratio-checked, mirroring real intake logic).

**Expected output (approximately):**

```
Synthetic Mortgage Portfolio — Ratio Report
==================================================
APP-00000001  purchase    primary     LTV 80.0%   DTI 18.9%
APP-00000002  refinance   primary     LTV 60.0%   DTI 20.8%
APP-00000003  purchase    investment  LTV 78.6%   DTI 20.9%
APP-00000004  draft — skipped (not yet submitted)
==================================================
Portfolio averages (submitted/in_review only): LTV 72.9%  DTI 20.2%
3 applications analyzed, 1 skipped.
```

**Interview sound bite:** *"Even a 30-line script follows production thinking — it filters by status, guards against divide-by-zero, and labels its output synthetic. Small artifacts, production habits."*
