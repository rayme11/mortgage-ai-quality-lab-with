// Mock synthetic mortgage application API.
// A real test target: validates against the Chapter 2 JSON Schema contract,
// enforces consent rules, and returns proper HTTP semantics.
// Run: npm run mock:api  (listens on http://localhost:4010)
import express from 'express';
import fs from 'node:fs';
import Ajv from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

const schema = JSON.parse(
  fs.readFileSync('schemas/mortgage-application.schema.json', 'utf8')
);
const ajv = new Ajv({ allErrors: true });
addFormats(ajv);
const validate = ajv.compile(schema);

const app = express();
app.use(express.json());

// In-memory store — synthetic data only, dies with the process.
const applications = new Map();
// Idempotency: fingerprint of payload -> applicationId
const fingerprints = new Map();

const AUTH_TOKEN = 'demo-token-loan-officer';

// --- middleware: toy role check -------------------------------------------
app.use((req, res, next) => {
  if (req.method === 'GET') return next(); // reads are open in the demo
  if (req.headers.authorization === `Bearer ${AUTH_TOKEN}`) return next();
  res.status(401).json({ error: 'UNAUTHORIZED', message: 'Bearer token required for writes' });
});

const fingerprint = (payload) =>
  JSON.stringify(payload, Object.keys(payload).sort());

// --- POST /applications ----------------------------------------------------
app.post('/applications', (req, res) => {
  const payload = req.body ?? {};

  // Idempotent retry: identical payload returns the original record.
  const fp = fingerprint(payload);
  if (fingerprints.has(fp)) {
    const existing = applications.get(fingerprints.get(fp));
    return res.status(200).json({ ...existing, idempotentReplay: true });
  }

  // Layer 1: contract
  if (!validate(payload)) {
    return res.status(400).json({
      error: 'CONTRACT_VIOLATION',
      details: validate.errors.map((e) => `${e.instancePath || '(record)'} ${e.message}`),
    });
  }

  // Layer 2: consent rule (TRID/E-SIGN analog)
  const submittedLike = payload.status === 'submitted' || payload.status === 'in_review';
  if (submittedLike && (payload.privacyConsent !== true || payload.electronicConsent !== true)) {
    return res.status(400).json({
      error: 'CONSENT_REQUIRED',
      message: 'Submitted applications require privacy and electronic consent',
      rule: 'RQ-005',
    });
  }

  if (applications.has(payload.applicationId)) {
    return res.status(409).json({ error: 'DUPLICATE', message: 'applicationId already exists' });
  }

  const record = {
    ...payload,
    receivedAt: new Date().toISOString(),
    links: {
      self: `/applications/${payload.applicationId}`,
      status: `/applications/${payload.applicationId}/status`,
    },
  };
  applications.set(payload.applicationId, record);
  fingerprints.set(fp, payload.applicationId);
  res.status(201).json(record);
});

// --- GET /applications/:id --------------------------------------------------
app.get('/applications/:id', (req, res) => {
  const record = applications.get(req.params.id);
  if (!record) return res.status(404).json({ error: 'NOT_FOUND' });
  res.json(record);
});

// --- GET /applications/:id/status -------------------------------------------
app.get('/applications/:id/status', (req, res) => {
  const record = applications.get(req.params.id);
  if (!record) return res.status(404).json({ error: 'NOT_FOUND' });
  res.json({ applicationId: record.applicationId, status: record.status, asOf: new Date().toISOString() });
});

// --- PATCH /applications/:id -------------------------------------------------
app.patch('/applications/:id', (req, res) => {
  const record = applications.get(req.params.id);
  if (!record) return res.status(404).json({ error: 'NOT_FOUND' });
  const allowed = ['status']; // only status transitions are patchable in the demo
  const updates = Object.fromEntries(
    Object.entries(req.body ?? {}).filter(([k]) => allowed.includes(k))
  );
  Object.assign(record, updates);
  res.json(record);
});

const port = process.env.PORT || 4010;
app.listen(port, () => console.log(`Mock mortgage API listening on http://localhost:${port} (synthetic data only)`));
