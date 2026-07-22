import { expect, test } from '@playwright/test'

const FIXED_NOW = new Date('2030-07-15T16:00:00.000Z')
const SCREENSHOT_OPTIONS = {
  animations: 'disabled',
  caret: 'hide',
  fullPage: true,
  maxDiffPixelRatio: 0.025,
  scale: 'css',
} as const

test.describe('public visual system baselines', () => {
  test.use({ extraHTTPHeaders: { 'x-grande-e2e-content': 'live' } })

  test.beforeEach(async ({ page }) => {
    await page.clock.install({ time: FIXED_NOW })
  })

  test('preserves the complete public-page composition', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()

    await expect(page).toHaveScreenshot('public-page.png', SCREENSHOT_OPTIONS)
  })

  test('preserves the stale-content system state without obscuring essentials', async ({
    page,
  }) => {
    await page.setExtraHTTPHeaders({ 'x-grande-e2e-content': 'outage' })
    await page.goto('/')
    await expect(page.getByTestId('content-freshness')).toBeVisible()

    await expect(page).toHaveScreenshot('stale-content-state.png', SCREENSHOT_OPTIONS)
  })
})
