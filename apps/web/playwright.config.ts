import { defineConfig, devices } from '@playwright/test'
import { fileURLToPath } from 'node:url'

const e2eSnapshotPath = fileURLToPath(
  new URL('./test-results/e2e-content.snapshot.json', import.meta.url),
)

export default defineConfig({
  testDir: './tests/e2e',
  outputDir: './test-results',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'line' : [['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:4173',
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'mobile-chromium',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'desktop-chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command:
      'pnpm exec tsx tests/e2e/generate-content-snapshot.ts && pnpm run build && pnpm run preview --host 127.0.0.1',
    env: {
      ...process.env,
      GRANDE_E2E_MODE: '1',
      GRANDE_E2E_NOW: '2030-07-15T16:00:00.000Z',
      GRANDE_E2E_SNAPSHOT_PATH: e2eSnapshotPath,
      PUBLIC_SANITY_API_VERSION: process.env.PUBLIC_SANITY_API_VERSION ?? '2026-07-21',
      PUBLIC_SANITY_DATASET: process.env.PUBLIC_SANITY_DATASET ?? 'development',
      PUBLIC_SANITY_PROJECT_ID: process.env.PUBLIC_SANITY_PROJECT_ID ?? 'w6vleqf7',
      PUBLIC_SITE_URL: process.env.PUBLIC_SITE_URL ?? 'http://127.0.0.1:4173',
    },
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 300_000,
  },
})
