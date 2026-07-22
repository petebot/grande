import { expect, test } from '@playwright/test'

const ACTIVE_ANNOUNCEMENT = 'Active development notice'
const FUTURE_ANNOUNCEMENT = 'Future development closure'

test.describe('scheduled content on an already-open page', () => {
  test.use({
    extraHTTPHeaders: { 'x-grande-e2e-content': 'live' },
    viewport: { height: 844, width: 390 },
  })

  test('changes from closed to open at the next transition without a reload', async ({ page }) => {
    await page.clock.install({ time: new Date('2030-07-16T20:58:30.000Z') })
    await page.goto('/')
    await page.clock.pauseAt(new Date('2030-07-16T20:59:00.000Z'))

    const pageMarker = await page.evaluate(() => {
      const marker = crypto.randomUUID()
      Reflect.set(window, '__grandeFreshnessMarker', marker)
      return marker
    })

    await expect(page.getByTestId('hours-status')).toContainText('Closed')
    await expect(page.getByTestId('hours-status')).toContainText('Opens at 5:00 PM')

    await page.clock.fastForward(60_000)

    await expect(page.getByTestId('hours-status')).toContainText('Open now')
    await expect(page.getByTestId('hours-status')).toContainText('Closes at 9:00 PM')
    expect(await page.evaluate(() => Reflect.get(window, '__grandeFreshnessMarker'))).toBe(
      pageMarker,
    )
  })

  test('removes an announcement when its schedule expires', async ({ page }) => {
    await page.clock.install({ time: new Date('2030-08-01T03:58:30.000Z') })
    await page.goto('/')
    await page.clock.pauseAt(new Date('2030-08-01T03:59:00.000Z'))

    await expect(page.getByRole('heading', { name: ACTIVE_ANNOUNCEMENT })).toBeVisible()

    await page.clock.fastForward(60_000)

    await expect(page.getByRole('heading', { name: ACTIVE_ANNOUNCEMENT })).toHaveCount(0)
  })

  test('reveals a scheduled announcement when its start time arrives', async ({ page }) => {
    await page.clock.install({ time: new Date('2030-08-10T03:58:30.000Z') })
    await page.goto('/')
    await page.clock.pauseAt(new Date('2030-08-10T03:59:00.000Z'))

    await expect(page.getByRole('heading', { name: ACTIVE_ANNOUNCEMENT })).toHaveCount(0)
    await expect(page.getByRole('heading', { name: FUTURE_ANNOUNCEMENT })).toHaveCount(0)

    await page.clock.fastForward(60_000)

    await expect(page.getByRole('heading', { name: FUTURE_ANNOUNCEMENT })).toBeVisible()
  })
})
