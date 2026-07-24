import { expect, test } from '@playwright/test'

const MOBILE_VIEWPORT = { width: 390, height: 844 }
const FIXED_NOW = new Date('2030-07-15T16:00:00.000Z')
const FIXTURE_ITEM_NAME = 'The Impossibly Long Named Fictional Burrito Built for Wrapping Tests'
const FIXTURE_PHONE = '(207) 555-0100'
const FIXTURE_ADDRESS = '123 Example Street, Sampletown, ME 04000'

test.describe('decide and visit', () => {
  test.use({
    extraHTTPHeaders: { 'x-grande-e2e-content': 'live' },
    viewport: MOBILE_VIEWPORT,
  })

  test('puts status, menu, price, location, call, and directions on the mobile page', async ({
    page,
  }) => {
    await page.clock.install({ time: FIXED_NOW })
    const response = await page.goto('/')
    const html = await response!.text()

    expect(html).not.toContain('development.business-profile')
    expect(html).not.toContain('AUTOMATED BROWSER TEST ONLY')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('fictional heading')
    await expect(page.getByTestId('hours-status')).toContainText('Closed')
    await expect(
      page.getByRole('heading', { name: 'Entirely Fictional Development Menu' }),
    ).toBeVisible()
    await expect(page.getByRole('heading', { name: FIXTURE_ITEM_NAME })).toBeVisible()
    await expect(page.getByText('$12.99', { exact: true })).toBeVisible()
    await expect(page.locator('address')).toHaveText(FIXTURE_ADDRESS)
    await expect(page.getByRole('link', { name: `Call ${FIXTURE_PHONE}` })).toHaveAttribute(
      'href',
      'tel:+12075550100',
    )
    await expect(page.getByRole('link', { name: 'Get directions', exact: true })).toHaveAttribute(
      'href',
      'https://example.com/development-only/directions',
    )

    const pageWidth = await page.evaluate(() => ({
      document: document.documentElement.scrollWidth,
      viewport: document.documentElement.clientWidth,
    }))
    expect(pageWidth.document).toBeLessThanOrEqual(pageWidth.viewport)
  })

  test.describe('without JavaScript', () => {
    test.use({ javaScriptEnabled: false })

    test('keeps the complete decision information in server-rendered HTML', async ({ page }) => {
      const response = await page.goto('/')

      expect(response?.status()).toBe(200)
      await expect(page.getByTestId('hours-status')).toContainText('Closed')
      await expect(page.getByRole('heading', { name: FIXTURE_ITEM_NAME })).toBeVisible()
      await expect(page.getByText('$12.99', { exact: true })).toBeVisible()
      await expect(page.locator('address')).toHaveText(FIXTURE_ADDRESS)
      await expect(page.getByRole('link', { name: `Call ${FIXTURE_PHONE}` })).toHaveAttribute(
        'href',
        'tel:+12075550100',
      )
      await expect(page.getByRole('link', { name: 'Get directions', exact: true })).toBeVisible()
    })
  })

  test('uses one complete deployment snapshot when Sanity is forced offline', async ({ page }) => {
    await page.clock.install({ time: FIXED_NOW })
    await page.setExtraHTTPHeaders({ 'x-grande-e2e-content': 'outage' })
    const response = await page.goto('/')

    expect(response?.status()).toBe(200)
    await expect(page.locator('main')).toHaveAttribute('data-content-source', 'snapshot')
    await expect(page.getByTestId('content-freshness')).toContainText(
      'Showing the most recently saved information',
    )
    await expect(page.getByTestId('hours-status')).toContainText('Closed')
    await expect(page.getByRole('heading', { name: FIXTURE_ITEM_NAME })).toBeVisible()
    await expect(page.getByText(FIXTURE_PHONE, { exact: true })).toBeVisible()
    await expect(page.locator('address')).toHaveText(FIXTURE_ADDRESS)
    await expect(page.getByRole('link', { name: 'Get directions', exact: true })).toBeVisible()
  })
})
