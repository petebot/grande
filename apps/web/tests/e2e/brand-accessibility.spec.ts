import { expect, test } from '@playwright/test'

const FIXED_NOW = new Date('2030-07-15T16:00:00.000Z')
const PRIMARY_ACTIONS = [
  'View menu',
  'Call (207) 555-0100',
  'Get directions',
  'Order online',
] as const

test.describe('brand accessibility guardrails', () => {
  test.use({ extraHTTPHeaders: { 'x-grande-e2e-content': 'live' } })

  test.beforeEach(async ({ page }) => {
    await page.clock.install({ time: FIXED_NOW })
  })

  test('keeps a logical semantic hierarchy and named primary navigation', async ({ page }) => {
    await page.goto('/')

    await expect(page.locator('main')).toHaveCount(1)
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1)
    await expect(page.getByRole('navigation', { name: 'Visit actions' })).toBeVisible()

    const headingLevels = await page
      .locator('h1, h2, h3, h4, h5, h6')
      .evaluateAll((headings) => headings.map(({ tagName }) => Number(tagName.slice(1))))

    expect(headingLevels[0]).toBe(1)
    for (const [index, level] of headingLevels.slice(1).entries()) {
      expect(level, `heading ${index + 2} skips a level`).toBeLessThanOrEqual(
        headingLevels[index]! + 1,
      )
    }
  })

  test('renders the sign-derived brand mark with its sampled accessible palette', async ({
    page,
  }) => {
    await page.goto('/')

    await expect(
      page.getByRole('img', { name: 'Fixture Fiesta Test Kitchen — NOT A REAL RESTAURANT' }),
    ).toBeVisible()
    await expect.poll(() => page.evaluate(() => document.fonts.check('16px Anton'))).toBe(true)

    const palette = await page.getByTestId('brand-mark').evaluate((element) => {
      const style = getComputedStyle(element)
      return {
        background: style.backgroundColor,
        ink: style.color,
      }
    })

    expect(palette).toEqual({
      background: 'rgb(166, 133, 95)',
      ink: 'rgb(23, 20, 28)',
    })
  })

  test('reaches every primary action in visual order with visible keyboard focus', async ({
    page,
  }) => {
    await page.goto('/')

    for (const actionName of PRIMARY_ACTIONS) {
      await page.keyboard.press('Tab')

      const focused = page.locator(':focus')
      await expect(focused).toHaveAccessibleName(actionName)
      const focusStyle = await focused.evaluate((element) => {
        const style = getComputedStyle(element)
        return {
          outlineStyle: style.outlineStyle,
          outlineWidth: Number.parseFloat(style.outlineWidth),
        }
      })
      const box = await focused.boundingBox()

      expect(focusStyle.outlineStyle).not.toBe('none')
      expect(focusStyle.outlineWidth).toBeGreaterThanOrEqual(3)
      expect(box?.height).toBeGreaterThanOrEqual(44)
      expect(box?.width).toBeGreaterThanOrEqual(44)
    }
  })

  test('turns off smooth scrolling when reduced motion is requested', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')

    await expect
      .poll(() => page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior))
      .toBe('auto')
  })

  test('keeps all essential decisions usable when media is missing', async ({ page }) => {
    await page.route(/\.(?:avif|gif|jpe?g|png|webp)(?:\?.*)?$/i, (route) => route.abort())
    await page.goto('/')

    await expect(page.getByTestId('hours-status')).toContainText('Closed')
    await expect(
      page.getByRole('heading', {
        name: 'The Impossibly Long Named Fictional Burrito Built for Wrapping Tests',
      }),
    ).toBeVisible()
    await expect(page.getByRole('link', { name: 'Call (207) 555-0100' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Get directions', exact: true })).toBeVisible()
    await expect(page.locator('img:not([alt])')).toHaveCount(0)
  })
})
