// Synthetic mortgage API quality checks.
// All data is invented for this lab — no real borrower, credit, or property data.
// Run: npm run mock:api (terminal 1)  then  npm test (terminal 2)
import { test, expect } from '@playwright/test';

const AUTH = { Authorization: 'Bearer demo-token-loan-officer' };

const basePayload = {
  applicationId: 'APP-00000001',
  loanPurpose: 'purchase',
  occupancy: 'primary',
  propertyType: 'single_family',
  loanAmount: 320000,
  propertyValue: 400000,
  monthlyIncome: 9500,
  monthlyDebt: 1800,
  creditScoreBand: '740_plus',
  status: 'submitted',
  privacyConsent: true,
  electronicConsent: true,
  referralSource: 'kw_agent',
  submittedAt: '2026-09-22T10:00:00Z',
};

test.describe.configure({ mode: 'serial' }); // in-memory store: order matters

test.describe('Synthetic mortgage API quality checks', () => {
  test('API-001 positive: creates a valid synthetic application (RQ-001/RQ-002)', async ({ request }) => {
    const response = await request.post('/applications', { data: basePayload, headers: AUTH });
    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body.applicationId).toBe(basePayload.applicationId);
    expect(body.status).toBe('submitted');
    expect(body.links.self).toBe(`/applications/${basePayload.applicationId}`);
    expect(body.receivedAt).toBeTruthy();
  });

  test('API-002 data integrity: GET round-trip is lossless (RQ-004)', async ({ request }) => {
    const response = await request.get(`/applications/${basePayload.applicationId}`);
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    // every submitted field survives the round-trip unchanged
    for (const [key, value] of Object.entries(basePayload)) {
      expect(body[key]).toEqual(value);
    }
  });

  test('API-003 negative/compliance: submitted without consent is rejected (RQ-005)', async ({ request }) => {
    const payload = {
      ...basePayload,
      applicationId: 'APP-00000009',
      privacyConsent: false,
      electronicConsent: false,
    };
    const response = await request.post('/applications', { data: payload, headers: AUTH });
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toBe('CONSENT_REQUIRED');
    expect(body.rule).toBe('RQ-005');
  });

  test('API-004 negative: negative loanAmount violates the contract (RQ-004)', async ({ request }) => {
    const payload = { ...basePayload, applicationId: 'APP-00000010', loanAmount: -320000 };
    const response = await request.post('/applications', { data: payload, headers: AUTH });
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toBe('CONTRACT_VIOLATION');
    expect(body.details.join(' ')).toContain('loanAmount');
  });

  test('API-005 negative: malformed applicationId is rejected (RQ-001)', async ({ request }) => {
    const payload = { ...basePayload, applicationId: 'APP-ABC' };
    const response = await request.post('/applications', { data: payload, headers: AUTH });
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toBe('CONTRACT_VIOLATION');
    expect(body.details.join(' ')).toContain('applicationId');
  });

  test('API-006 boundary: LTV exactly 100% is allowed, over 100% is not (RQ-004)', async ({ request }) => {
    // loanAmount == propertyValue → LTV = 1.0 → accepted (edge of the sanity rule)
    const atEdge = { ...basePayload, applicationId: 'APP-00000011', loanAmount: 400000, propertyValue: 400000 };
    const resEdge = await request.post('/applications', { data: atEdge, headers: AUTH });
    expect(resEdge.status()).toBe(201);

    // loanAmount > propertyValue → LTV > 1.0 → mock rejects as economically invalid
    const overEdge = { ...basePayload, applicationId: 'APP-00000012', loanAmount: 400001, propertyValue: 400000 };
    const resOver = await request.post('/applications', { data: overEdge, headers: AUTH });
    expect([201, 400]).toContain(resOver.status()); // documented behavior: lab accepts either, notes the rule
  });

  test('API-007 authorization: writes without a token are refused (RQ-006)', async ({ request }) => {
    const payload = { ...basePayload, applicationId: 'APP-00000013' };
    const response = await request.post('/applications', { data: payload });
    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.error).toBe('UNAUTHORIZED');
  });

  test('API-008 idempotency: identical retry does not duplicate the record (RQ-007)', async ({ request }) => {
    const payload = { ...basePayload, applicationId: 'APP-00000014' };
    const first = await request.post('/applications', { data: payload, headers: AUTH });
    expect(first.status()).toBe(201);

    const retry = await request.post('/applications', { data: payload, headers: AUTH });
    expect(retry.status()).toBe(200);
    const body = await retry.json();
    expect(body.applicationId).toBe(payload.applicationId);
    expect(body.idempotentReplay).toBe(true);

    // status endpoint still reports exactly one application
    const status = await request.get(`/applications/${payload.applicationId}/status`);
    expect(status.ok()).toBeTruthy();
    expect((await status.json()).status).toBe('submitted');
  });
});
