import { describe, expect, it } from 'vitest'

import { ContentValidationError, normalizePublicSiteContent } from '../src/normalize.js'
import { DAYS_OF_WEEK } from '../src/types.js'
import {
  DEVELOPMENT_REFERENCE_NOW,
  developmentContentFixture,
  developmentFixtureCoverage,
} from '../test/fixtures/development-content.js'

const confirmedProvenance = {
  status: 'confirmed',
  source: 'AUTOMATED TEST ONLY — not real-world verification.',
  verifiedAt: DEVELOPMENT_REFERENCE_NOW,
  verifiedBy: 'Automated content test',
} as const

const licensedProvenance = {
  status: 'licensed',
  source: 'AUTOMATED TEST ONLY — not a real asset license.',
  verifiedAt: DEVELOPMENT_REFERENCE_NOW,
  verifiedBy: 'Automated content test',
} as const

function productionReadyTestInput() {
  return {
    ...developmentContentFixture,
    business: {
      ...developmentContentFixture.business,
      provenance: confirmedProvenance,
    },
    hoursExceptions: developmentContentFixture.hoursExceptions.map((exception) => ({
      ...exception,
      provenance: confirmedProvenance,
    })),
    menu: developmentContentFixture.menu.map((category) => ({
      ...category,
      items: category.items.map((item) => ({
        ...item,
        provenance: confirmedProvenance,
      })),
    })),
    announcements: developmentContentFixture.announcements.map((announcement) => ({
      ...announcement,
      provenance: confirmedProvenance,
    })),
    page: {
      ...developmentContentFixture.page,
      provenance: confirmedProvenance,
    },
    media: developmentContentFixture.media.map((media) => ({
      ...media,
      provenance: licensedProvenance,
      rightsStatus: 'licensed' as const,
    })),
  }
}

function expectValidationIssue(
  input: unknown,
  expectedPath: string,
  perspective: 'drafts' | 'published' = 'drafts',
) {
  try {
    normalizePublicSiteContent(input, { perspective })
    throw new Error('Expected content validation to fail')
  } catch (error) {
    expect(error).toBeInstanceOf(ContentValidationError)
    expect((error as ContentValidationError).issues).toEqual(
      expect.arrayContaining([expect.objectContaining({ path: expectedPath })]),
    )
  }
}

describe('normalizePublicSiteContent', () => {
  it('normalizes ordering, whitespace, and decimal prices deterministically', () => {
    const originalLongItem = developmentContentFixture.menu[0].items[0]
    const input = {
      ...developmentContentFixture,
      weeklySchedule: [...developmentContentFixture.weeklySchedule].reverse(),
      hoursExceptions: [...developmentContentFixture.hoursExceptions].reverse(),
      menu: [...developmentContentFixture.menu].reverse().map((category) => ({
        ...category,
        items: [...category.items].reverse().map((item) =>
          item.id === originalLongItem.id
            ? {
                ...item,
                name: `  ${item.name}  `,
                priceOptions: [
                  { label: '  Regular test size  ', amount: 12.99 },
                  { label: '  Comically large test size  ', amount: 18.99 },
                ],
              }
            : item,
        ),
      })),
      announcements: [...developmentContentFixture.announcements].reverse(),
      media: [...developmentContentFixture.media].reverse(),
    }

    const first = normalizePublicSiteContent(input, { perspective: 'drafts' })
    const second = normalizePublicSiteContent(input, { perspective: 'drafts' })
    const normalizedLongItem = first.menu[0]?.items[0]

    expect(second).toEqual(first)
    expect(first.weeklySchedule.map(({ day }) => day)).toEqual(DAYS_OF_WEEK)
    expect(first.menu.map(({ sortOrder }) => sortOrder)).toEqual([10, 20])
    expect(first.menu[0]?.items.map(({ sortOrder }) => sortOrder)).toEqual([10, 20, 30])
    expect(normalizedLongItem?.name).toBe(originalLongItem.name)
    expect(normalizedLongItem?.emoji).toBe('🌯')
    expect(normalizedLongItem?.pricingKind).toBe('fixed')

    if (normalizedLongItem?.pricingKind !== 'fixed') {
      throw new Error('Expected fixed pricing after normalization')
    }

    expect(normalizedLongItem.priceOptions).toEqual([
      {
        label: 'Regular test size',
        price: { amountMinor: 1299, currency: 'USD' },
      },
      {
        label: 'Comically large test size',
        price: { amountMinor: 1899, currency: 'USD' },
      },
    ])
  })

  it('does not mutate its input', () => {
    const input = structuredClone(developmentContentFixture)
    const before = structuredClone(input)

    normalizePublicSiteContent(input, { perspective: 'drafts' })

    expect(input).toEqual(before)
  })

  it('preserves meaningful whitespace between portable-text spans', () => {
    const firstBlock = developmentContentFixture.page.storyBody[0]
    const input = {
      ...developmentContentFixture,
      page: {
        ...developmentContentFixture.page,
        storyBody: [
          {
            ...firstBlock,
            children: [
              { key: 'leading-span', type: 'span', text: 'First ', marks: [] },
              { key: 'trailing-span', type: 'span', text: 'second', marks: ['strong'] },
            ],
          },
          ...developmentContentFixture.page.storyBody.slice(1),
        ],
      },
    }

    const normalized = normalizePublicSiteContent(input, { perspective: 'drafts' })

    expect(normalized.page.storyBody[0]?.children.map(({ text }) => text).join('')).toBe(
      'First second',
    )
  })

  it('removes inactive categories and hidden items while retaining sold-out items', () => {
    const activeCategory = developmentContentFixture.menu[0]
    const input = {
      ...developmentContentFixture,
      menu: [
        {
          ...activeCategory,
          items: activeCategory.items.map((item) =>
            item.id === developmentFixtureCoverage.longCopyMissingMediaItemId
              ? { ...item, isVisible: false }
              : item,
          ),
        },
        {
          ...developmentContentFixture.menu[1],
          isActive: false,
        },
      ],
    }

    const normalized = normalizePublicSiteContent(input, { perspective: 'drafts' })

    expect(normalized.menu).toHaveLength(1)
    expect(normalized.menu[0]?.items.map(({ id }) => id)).toEqual([
      developmentFixtureCoverage.soldOutItemId,
      developmentFixtureCoverage.marketPriceItemId,
    ])
    expect(normalized.menu[0]?.items[0]?.availability).toBe('sold-out')
  })

  it.each([
    [
      'non-HTTPS business URL',
      { business: { orderingUrl: 'http://example.com/order' } },
      'business.orderingUrl',
    ],
    [
      'script action URL',
      { announcementActionUrl: 'javascript:alert(1)' },
      'announcements[0].action.url',
    ],
    [
      'protocol-relative action URL',
      { announcementActionUrl: '//example.com/path' },
      'announcements[0].action.url',
    ],
  ])('rejects %s', (_label, mutation, expectedPath) => {
    const input =
      'business' in mutation
        ? {
            ...developmentContentFixture,
            business: {
              ...developmentContentFixture.business,
              ...mutation.business,
            },
          }
        : {
            ...developmentContentFixture,
            announcements: developmentContentFixture.announcements.map((announcement, index) =>
              index === 0
                ? {
                    ...announcement,
                    action: {
                      label: 'Unsafe test action',
                      url: mutation.announcementActionUrl,
                    },
                  }
                : announcement,
            ),
          }

    expectValidationIssue(input, expectedPath)
  })

  it.each([
    ['negative amount', -1, 'menu[0].items[0].priceOptions[0].amount'],
    ['fractional cent', 12.999, 'menu[0].items[0].priceOptions[0].amount'],
  ])('rejects a %s', (_label, amount, expectedPath) => {
    const item = developmentContentFixture.menu[0].items[0]
    const input = {
      ...developmentContentFixture,
      menu: [
        {
          ...developmentContentFixture.menu[0],
          items: [
            {
              ...item,
              priceOptions: [
                { label: 'Test size', amount },
                { label: 'Other test size', amount: 14.5 },
              ],
            },
            ...developmentContentFixture.menu[0].items.slice(1),
          ],
        },
        developmentContentFixture.menu[1],
      ],
    }

    expectValidationIssue(input, expectedPath)
  })

  it('requires labels when an item has multiple prices', () => {
    const item = developmentContentFixture.menu[0].items[0]
    const input = {
      ...developmentContentFixture,
      menu: [
        {
          ...developmentContentFixture.menu[0],
          items: [
            {
              ...item,
              priceOptions: [{ amount: 12.99 }, { label: 'Large', amount: 18.99 }],
            },
            ...developmentContentFixture.menu[0].items.slice(1),
          ],
        },
        developmentContentFixture.menu[1],
      ],
    }

    expectValidationIssue(input, 'menu[0].items[0].priceOptions[0].label')
  })

  it.each([
    [
      'duplicate weekday',
      developmentContentFixture.weeklySchedule.map((day, index) =>
        index === 1 ? { ...day, day: 'monday' } : day,
      ),
      'weeklySchedule[1].day',
    ],
    [
      'invalid local time',
      developmentContentFixture.weeklySchedule.map((day, index) =>
        index === 3 ? { ...day, intervals: [{ opensAt: '25:00', closesAt: '21:00' }] } : day,
      ),
      'weeklySchedule[3].intervals[0].opensAt',
    ],
    [
      'overlapping intervals',
      developmentContentFixture.weeklySchedule.map((day, index) =>
        index === 1
          ? {
              ...day,
              intervals: [
                { opensAt: '11:00', closesAt: '15:00' },
                { opensAt: '14:00', closesAt: '18:00' },
              ],
            }
          : day,
      ),
      'weeklySchedule[1].intervals',
    ],
    [
      'matching opening and closing time',
      developmentContentFixture.weeklySchedule.map((day, index) =>
        index === 3 ? { ...day, intervals: [{ opensAt: '10:00', closesAt: '10:00' }] } : day,
      ),
      'weeklySchedule[3].intervals[0].closesAt',
    ],
  ])('rejects a schedule with a %s', (_label, weeklySchedule, expectedPath) => {
    expectValidationIssue({ ...developmentContentFixture, weeklySchedule }, expectedPath)
  })

  it('normalizes omitted intervals on a closed exception to an empty list', () => {
    const input = {
      ...developmentContentFixture,
      hoursExceptions: developmentContentFixture.hoursExceptions.map((exception, index) =>
        index === 0 ? { ...exception, intervals: undefined } : exception,
      ),
    }

    const normalized = normalizePublicSiteContent(input, { perspective: 'drafts' })

    expect(normalized.hoursExceptions[0]?.status).toBe('closed')
    expect(normalized.hoursExceptions[0]?.intervals).toEqual([])
  })

  it('rejects unresolved media references', () => {
    const input = {
      ...developmentContentFixture,
      page: {
        ...developmentContentFixture.page,
        socialImageId: 'development.media.does-not-exist',
      },
    }

    expectValidationIssue(input, 'page.socialImageId')
  })

  it('accepts provisional content only in draft perspective', () => {
    expect(() =>
      normalizePublicSiteContent(developmentContentFixture, { perspective: 'drafts' }),
    ).not.toThrow()

    try {
      normalizePublicSiteContent(developmentContentFixture, { perspective: 'published' })
      throw new Error('Expected production provenance validation to fail')
    } catch (error) {
      expect(error).toBeInstanceOf(ContentValidationError)
      expect((error as ContentValidationError).issues[0]?.path).toBe('business.provenance.status')
    }
  })

  it('accepts a fully verified published projection', () => {
    expect(() =>
      normalizePublicSiteContent(productionReadyTestInput(), { perspective: 'published' }),
    ).not.toThrow()
  })

  it('rejects a provisional menu item in a published projection', () => {
    const productionInput = productionReadyTestInput()
    const input = {
      ...productionInput,
      menu: productionInput.menu.map((category, categoryIndex) => ({
        ...category,
        items: category.items.map((item, itemIndex) =>
          categoryIndex === 0 && itemIndex === 0
            ? {
                ...item,
                provenance: {
                  status: 'provisional',
                  source: 'AUTOMATED TEST ONLY — intentionally unverified.',
                },
              }
            : item,
        ),
      })),
    }

    expectValidationIssue(input, 'menu[0].items[0].provenance.status', 'published')
  })

  it('rejects provisional media rights in a published projection', () => {
    const productionInput = productionReadyTestInput()
    const input = {
      ...productionInput,
      media: productionInput.media.map((media, index) =>
        index === 0 ? { ...media, rightsStatus: 'provisional' } : media,
      ),
    }

    try {
      normalizePublicSiteContent(input, { perspective: 'published' })
      throw new Error('Expected provisional media rights to fail')
    } catch (error) {
      expect(error).toBeInstanceOf(ContentValidationError)
      expect((error as ContentValidationError).issues[0]?.path).toBe('media[0].rightsStatus')
    }
  })
})
