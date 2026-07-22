import { describe, expect, it } from 'vitest'
import { render } from 'svelte/server'

import {
  buildSeoView,
  type MenuStructuredData,
  type RestaurantStructuredData,
} from '$lib/components/Seo.svelte'
import Seo from '$lib/components/Seo.svelte'
import { developmentContentFixture } from '../../../../packages/content/test/fixtures/development-content'

const siteUrl = 'https://fixture-fiesta.example'

function itemAt<T>(items: readonly T[], index: number, label: string): T {
  const item = items[index]

  if (!item) throw new Error(`Expected ${label}`)
  return item
}

function graphNode(
  view: ReturnType<typeof buildSeoView>,
  type: 'Restaurant',
): RestaurantStructuredData
function graphNode(view: ReturnType<typeof buildSeoView>, type: 'Menu'): MenuStructuredData
function graphNode(view: ReturnType<typeof buildSeoView>, type: 'Menu' | 'Restaurant') {
  const node = view.structuredData['@graph'].find((entry) => entry['@type'] === type)

  if (!node) throw new Error(`Expected ${type} JSON-LD node`)
  return node
}

describe('page metadata', () => {
  it('renders crawlable head tags and raw JSON-LD during server rendering', () => {
    const { head } = render(Seo, {
      props: { view: buildSeoView(developmentContentFixture, siteUrl) },
    })

    expect(head).toContain(`<title>${developmentContentFixture.page.seoTitle}</title>`)
    expect(head).toContain(`<link rel="canonical" href="${siteUrl}/"/>`)
    expect(head).toContain('<script type="application/ld+json">')
    expect(head).toContain('"@context":"https://schema.org"')
    expect(head).not.toContain('&quot;@context&quot;')
  })

  it('builds canonical and social metadata from normalized page content', () => {
    const view = buildSeoView(developmentContentFixture, siteUrl)

    expect(view).toMatchObject({
      canonicalUrl: `${siteUrl}/`,
      description: developmentContentFixture.page.seoDescription,
      openGraph: {
        description: developmentContentFixture.page.seoDescription,
        title: developmentContentFixture.page.seoTitle,
        type: 'website',
        url: `${siteUrl}/`,
      },
      title: developmentContentFixture.page.seoTitle,
    })
    expect(view.openGraph.image).toBeUndefined()
  })

  it('uses a referenced production-safe image without exposing media internals', () => {
    const licensedContent = {
      ...developmentContentFixture,
      media: developmentContentFixture.media.map((media) =>
        media.id === developmentContentFixture.page.socialImageId
          ? { ...media, rightsStatus: 'licensed' as const }
          : media,
      ),
    }
    const view = buildSeoView(licensedContent, siteUrl)

    expect(view.openGraph.image).toBe('https://example.com/development-only-media/landscape.jpg')
    expect(view.openGraph.imageAlt).toBe(
      'Clearly fictional landscape-oriented food placeholder for development testing.',
    )
    expect(JSON.stringify(view)).not.toContain('development-landscape-asset')
  })
})

describe('Restaurant and Menu JSON-LD', () => {
  it('keeps identity, contact, location, and opening hours equal to visible content', () => {
    const restaurant = graphNode(buildSeoView(developmentContentFixture, siteUrl), 'Restaurant')

    expect(restaurant).toMatchObject({
      '@id': `${siteUrl}/#restaurant`,
      address: {
        '@type': 'PostalAddress',
        addressCountry: developmentContentFixture.business.address.country,
        addressLocality: developmentContentFixture.business.address.locality,
        addressRegion: developmentContentFixture.business.address.region,
        postalCode: developmentContentFixture.business.address.postalCode,
        streetAddress: developmentContentFixture.business.address.street,
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: developmentContentFixture.business.coordinates.latitude,
        longitude: developmentContentFixture.business.coordinates.longitude,
      },
      hasMenu: { '@id': `${siteUrl}/#menu` },
      name: developmentContentFixture.business.name,
      priceRange: developmentContentFixture.business.priceRange,
      telephone: developmentContentFixture.business.phone.e164,
      url: `${siteUrl}/`,
    })

    expect(restaurant.openingHoursSpecification).toEqual(
      developmentContentFixture.weeklySchedule.flatMap(({ day, intervals }) =>
        intervals.map(({ opensAt, closesAt }) => ({
          '@type': 'OpeningHoursSpecification',
          closes: closesAt,
          dayOfWeek: `https://schema.org/${day[0]?.toUpperCase()}${day.slice(1)}`,
          opens: opensAt,
        })),
      ),
    )
    expect(restaurant.specialOpeningHoursSpecification).toHaveLength(6)
    expect(
      restaurant.specialOpeningHoursSpecification?.filter(
        ({ validFrom }) => validFrom === '2030-08-02',
      ),
    ).toEqual([
      expect.objectContaining({
        closes: '23:00',
        opens: '18:00',
        validFrom: '2030-08-02',
        validThrough: '2030-08-02',
      }),
    ])
  })

  it('maps visible menu names, exact prices, dietary labels, and availability', () => {
    const menu = graphNode(buildSeoView(developmentContentFixture, siteUrl), 'Menu')
    const sections = menu.hasMenuSection
    const firstSection = itemAt(sections, 0, 'first menu section')
    const secondSection = itemAt(sections, 1, 'second menu section')
    const firstItem = itemAt(firstSection.hasMenuItem, 0, 'first menu item')
    const soldOutItem = itemAt(firstSection.hasMenuItem, 1, 'sold-out menu item')
    const marketPriceItem = itemAt(firstSection.hasMenuItem, 2, 'market-price menu item')
    const dietaryItem = itemAt(secondSection.hasMenuItem, 0, 'dietary menu item')
    const soldOutOffer = itemAt(soldOutItem.offers ?? [], 0, 'sold-out offer')

    expect(menu).toMatchObject({
      '@id': `${siteUrl}/#menu`,
      name: developmentContentFixture.page.menuHeading,
    })
    expect(sections.map((section: { name: string }) => section.name)).toEqual(
      developmentContentFixture.menu.map(({ name }) => name),
    )
    expect(firstItem).toMatchObject({
      name: developmentContentFixture.menu[0].items[0].name,
      offers: [
        {
          availability: 'https://schema.org/InStock',
          name: 'Regular test size',
          price: '12.99',
          priceCurrency: 'USD',
        },
        {
          availability: 'https://schema.org/InStock',
          name: 'Comically large test size',
          price: '18.99',
          priceCurrency: 'USD',
        },
      ],
      suitableForDiet: ['https://schema.org/VegetarianDiet'],
    })
    expect(soldOutOffer.availability).toBe('https://schema.org/OutOfStock')
    expect(marketPriceItem.offers).toBeUndefined()
    expect(dietaryItem.suitableForDiet).toEqual([
      'https://schema.org/VeganDiet',
      'https://schema.org/GlutenFreeDiet',
    ])
  })

  it('never publishes normalized content IDs, revisions, or provenance records', () => {
    const serialized = JSON.stringify(buildSeoView(developmentContentFixture, siteUrl))

    expect(serialized).not.toContain('development.business-profile')
    expect(serialized).not.toContain('revision-001')
    expect(serialized).not.toContain('DEVELOPMENT FIXTURE — every business fact')
    expect(serialized).not.toContain('verifiedBy')
  })
})
