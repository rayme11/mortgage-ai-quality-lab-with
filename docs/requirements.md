# Synthetic Requirements — Mortgage AI Quality Lab

These are the only requirement IDs AI prompts may reference. Anything outside RQ-001..RQ-008 is a hallucination and must be rejected.

## RQ-001: Application ID
Every submitted application must have a unique `applicationId` matching `APP-` followed by eight digits.

## RQ-002: Required attributes
A submitted application must include loan purpose, occupancy, property type, loan amount, estimated property value, monthly income, monthly debt, credit-score band, application status, consent flags, and timestamp.

## RQ-003: Allowed values
- Loan purpose: `purchase`, `refinance`
- Occupancy: `primary`, `second_home`, `investment`
- Property type: `single_family`, `condo`, `townhome`, `multi_family`
- Credit-score band: `below_620`, `620_679`, `680_739`, `740_plus`
- Status: `draft`, `submitted`, `in_review`, `withdrawn`

## RQ-004: Monetary integrity
Loan amount, property value, income, and debt must be non-negative numbers. Property value must be greater than zero. Loan amount must not exceed property value (LTV ≤ 100%).

## RQ-005: Consent control
An application may not reach `submitted` or `in_review` status without both `privacyConsent` and `electronicConsent` set to true. (TRID/E-SIGN analog — control check only, not a legal determination.)

## RQ-006: Write authorization
Only requests presenting a valid loan-officer credential may create or modify applications.

## RQ-007: Idempotent submission
Retrying an identical submission must not create a duplicate application record.

## RQ-008: Evidence & auditability
Every validation, test execution, and AI-generated artifact review must produce retained, structured evidence.
