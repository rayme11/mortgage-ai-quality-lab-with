// @ts-check
// Playwright runs API-only here — no browsers needed on this machine.
export default {
  testDir: './tests',
  reporter: [
    ['html', { outputFolder: 'artifacts/playwright-report', open: 'never' }],
    ['list'],
  ],
  use: {
    baseURL: process.env.API_BASE_URL || 'http://localhost:4010',
    trace: 'on-first-retry',
  },
};
