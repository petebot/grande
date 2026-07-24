import { expect, test } from '@playwright/test'

const FIXED_NOW = new Date('2030-07-15T16:00:00.000Z')
const PRIMARY_ACTIONS = [
  'View menu',
  'Call (207) 555-0100',
  'Get directions',
  'Order online',
] as const
const THEME_PALETTES = [
  {
    scheme: 'light',
    expected: {
      canvas: 'rgb(234, 217, 188)',
      ink: 'rgb(23, 20, 28)',
      mark: 'rgba(0, 0, 0, 0)',
      surface: 'rgb(255, 249, 236)',
      text: 'rgb(23, 20, 28)',
    },
  },
  {
    scheme: 'dark',
    expected: {
      canvas: 'rgb(15, 13, 18)',
      ink: 'rgb(255, 249, 236)',
      mark: 'rgba(0, 0, 0, 0)',
      surface: 'rgb(23, 20, 28)',
      text: 'rgb(255, 249, 236)',
    },
  },
] as const

function contrastRatio(first: string, second: string): number {
  const luminance = (color: string) => {
    const channels = color.match(/\d+/g)?.slice(0, 3).map(Number)
    if (!channels || channels.length !== 3) throw new Error(`Unsupported color: ${color}`)

    const [red, green, blue] = channels.map((channel) => {
      const normalized = channel / 255
      return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4
    })

    return 0.2126 * red! + 0.7152 * green! + 0.0722 * blue!
  }

  const firstLuminance = luminance(first)
  const secondLuminance = luminance(second)
  return (
    (Math.max(firstLuminance, secondLuminance) + 0.05) /
    (Math.min(firstLuminance, secondLuminance) + 0.05)
  )
}

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

  for (const theme of THEME_PALETTES) {
    test(`renders the sign-derived brand mark in the ${theme.scheme} system theme`, async ({
      page,
    }) => {
      await page.emulateMedia({ colorScheme: theme.scheme })
      await page.goto('/')

      await expect(
        page.getByRole('img', { name: 'Fixture Fiesta Test Kitchen — NOT A REAL RESTAURANT' }),
      ).toBeVisible()
      await expect(page.locator('meta[name="color-scheme"]')).toHaveAttribute(
        'content',
        'light dark',
      )
      expect(await page.evaluate(() => matchMedia('(prefers-color-scheme: dark)').matches)).toBe(
        theme.scheme === 'dark',
      )

      const palette = await page.getByTestId('brand-mark').evaluate((element) => {
        const style = getComputedStyle(element)
        const surface = element.closest('main')

        return {
          canvas: getComputedStyle(document.body).backgroundColor,
          ink: style.color,
          mark: style.backgroundColor,
          surface: surface ? getComputedStyle(surface).backgroundColor : null,
          text: getComputedStyle(document.body).color,
        }
      })

      expect(palette).toEqual(theme.expected)
      expect(contrastRatio(palette.text, palette.surface!)).toBeGreaterThanOrEqual(4.5)
      expect(contrastRatio(palette.ink, palette.surface!)).toBeGreaterThanOrEqual(4.5)
    })
  }

  for (const colorScheme of ['light', 'dark'] as const) {
    test(`reaches every primary action with visible keyboard focus in ${colorScheme} mode`, async ({
      page,
    }) => {
      await page.emulateMedia({ colorScheme })
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
  }

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
