<script module lang="ts">
  import type {
    DayOfWeek,
    DietaryLabel,
    HoursException,
    MenuCategory,
    MenuItem,
    NormalizedPublicSiteSnapshot,
    PublicMedia,
    WeeklyScheduleDay,
  } from '@grande/content'

  const SCHEMA_ORIGIN = 'https://schema.org/'
  const DAY_MS = 86_400_000

  const schemaDays = {
    monday: `${SCHEMA_ORIGIN}Monday`,
    tuesday: `${SCHEMA_ORIGIN}Tuesday`,
    wednesday: `${SCHEMA_ORIGIN}Wednesday`,
    thursday: `${SCHEMA_ORIGIN}Thursday`,
    friday: `${SCHEMA_ORIGIN}Friday`,
    saturday: `${SCHEMA_ORIGIN}Saturday`,
    sunday: `${SCHEMA_ORIGIN}Sunday`,
  } as const satisfies Record<DayOfWeek, string>

  const schemaDiets = {
    vegetarian: `${SCHEMA_ORIGIN}VegetarianDiet`,
    vegan: `${SCHEMA_ORIGIN}VeganDiet`,
    'gluten-free': `${SCHEMA_ORIGIN}GlutenFreeDiet`,
  } as const satisfies Record<DietaryLabel, string>

  interface OpeningHoursStructuredData {
    readonly '@type': 'OpeningHoursSpecification'
    readonly closes: string
    readonly dayOfWeek?: string
    readonly description?: string
    readonly opens: string
    readonly validFrom?: string
    readonly validThrough?: string
  }

  interface OfferStructuredData {
    readonly '@type': 'Offer'
    readonly availability: string
    readonly name?: string
    readonly price: string
    readonly priceCurrency: string
  }

  interface MenuItemStructuredData {
    readonly '@type': 'MenuItem'
    readonly description?: string
    readonly name: string
    readonly offers?: readonly OfferStructuredData[]
    readonly suitableForDiet?: readonly string[]
  }

  interface MenuSectionStructuredData {
    readonly '@type': 'MenuSection'
    readonly description?: string
    readonly hasMenuItem: readonly MenuItemStructuredData[]
    readonly name: string
  }

  export interface MenuStructuredData {
    readonly '@id': string
    readonly '@type': 'Menu'
    readonly hasMenuSection: readonly MenuSectionStructuredData[]
    readonly name: string
  }

  export interface RestaurantStructuredData {
    readonly '@id': string
    readonly '@type': 'Restaurant'
    readonly address: {
      readonly '@type': 'PostalAddress'
      readonly addressCountry: string
      readonly addressLocality: string
      readonly addressRegion: string
      readonly postalCode: string
      readonly streetAddress: string
    }
    readonly description: string
    readonly geo: {
      readonly '@type': 'GeoCoordinates'
      readonly latitude: number
      readonly longitude: number
    }
    readonly hasMenu: { readonly '@id': string }
    readonly image?: string
    readonly name: string
    readonly openingHoursSpecification: readonly OpeningHoursStructuredData[]
    readonly priceRange?: string
    readonly sameAs?: readonly string[]
    readonly specialOpeningHoursSpecification?: readonly OpeningHoursStructuredData[]
    readonly telephone: string
    readonly url: string
  }

  export interface SeoView {
    readonly canonicalUrl: string
    readonly description: string
    readonly openGraph: {
      readonly description: string
      readonly image?: string
      readonly imageAlt?: string
      readonly imageHeight?: number
      readonly imageWidth?: number
      readonly title: string
      readonly type: 'website'
      readonly url: string
    }
    readonly structuredData: {
      readonly '@context': 'https://schema.org'
      readonly '@graph': readonly [RestaurantStructuredData, MenuStructuredData]
    }
    readonly title: string
  }

  function socialImage(content: NormalizedPublicSiteSnapshot): PublicMedia | undefined {
    if (!content.page.socialImageId) return undefined

    return content.media.find(
      ({ id, rightsStatus }) => id === content.page.socialImageId && rightsStatus !== 'provisional',
    )
  }

  function weeklyHours(
    schedule: readonly WeeklyScheduleDay[],
  ): readonly OpeningHoursStructuredData[] {
    return schedule.flatMap(({ day, intervals }) =>
      intervals.map(({ closesAt, opensAt }) => ({
        '@type': 'OpeningHoursSpecification' as const,
        closes: closesAt,
        dayOfWeek: schemaDays[day],
        opens: opensAt,
      })),
    )
  }

  function specialHours(
    exceptions: readonly HoursException[],
  ): readonly OpeningHoursStructuredData[] {
    const exceptionDates = [
      ...new Set(
        exceptions.flatMap((exception) => {
          const startsAt = Date.parse(`${exception.startsOn}T00:00:00.000Z`)
          const endsAt = Date.parse(`${exception.endsOn}T00:00:00.000Z`)

          return Array.from({ length: (endsAt - startsAt) / DAY_MS + 1 }, (_, index) =>
            new Date(startsAt + index * DAY_MS).toISOString().slice(0, 10),
          )
        }),
      ),
    ].sort()

    return exceptionDates.flatMap((date) => {
      const exception = exceptions
        .filter(({ endsOn, startsOn }) => startsOn <= date && endsOn >= date)
        .sort((left, right) => {
          const leftSpan = Date.parse(left.endsOn) - Date.parse(left.startsOn)
          const rightSpan = Date.parse(right.endsOn) - Date.parse(right.startsOn)

          return (
            leftSpan - rightSpan ||
            right.priority - left.priority ||
            left.id.localeCompare(right.id)
          )
        })[0]

      if (!exception) return []

      const common = {
        '@type': 'OpeningHoursSpecification' as const,
        ...(exception.publicNote ? { description: exception.publicNote } : {}),
        validFrom: date,
        validThrough: date,
      }

      if (exception.status === 'closed') {
        return [{ ...common, closes: '00:00', opens: '00:00' }]
      }

      return exception.intervals.map(({ closesAt, opensAt }) => ({
        ...common,
        closes: closesAt,
        opens: opensAt,
      }))
    })
  }

  function offers(item: MenuItem): readonly OfferStructuredData[] | undefined {
    if (item.pricingKind === 'market') return undefined

    const availability =
      item.availability === 'sold-out' ? `${SCHEMA_ORIGIN}OutOfStock` : `${SCHEMA_ORIGIN}InStock`

    return item.priceOptions.map(({ label, price }) => ({
      '@type': 'Offer' as const,
      availability,
      ...(label ? { name: label } : {}),
      price: (price.amountMinor / 100).toFixed(2),
      priceCurrency: price.currency,
    }))
  }

  function menuItem(item: MenuItem): MenuItemStructuredData {
    const itemOffers = offers(item)

    return {
      '@type': 'MenuItem',
      ...(item.description ? { description: item.description } : {}),
      name: item.name,
      ...(itemOffers ? { offers: itemOffers } : {}),
      ...(item.dietaryLabels.length > 0
        ? { suitableForDiet: item.dietaryLabels.map((label) => schemaDiets[label]) }
        : {}),
    }
  }

  function menuSection(category: MenuCategory): MenuSectionStructuredData {
    return {
      '@type': 'MenuSection',
      ...(category.description ? { description: category.description } : {}),
      hasMenuItem: category.items.map(menuItem),
      name: category.name,
    }
  }

  export function buildSeoView(content: NormalizedPublicSiteSnapshot, siteUrl: string): SeoView {
    const canonicalUrl = new URL('/', siteUrl).href
    const restaurantId = `${canonicalUrl}#restaurant`
    const menuId = `${canonicalUrl}#menu`
    const image = socialImage(content)
    const specialOpeningHours = specialHours(content.hoursExceptions)
    const sameAs = content.business.socialLinks.map(({ url }) => url)

    const restaurant: RestaurantStructuredData = {
      '@id': restaurantId,
      '@type': 'Restaurant',
      address: {
        '@type': 'PostalAddress',
        addressCountry: content.business.address.country,
        addressLocality: content.business.address.locality,
        addressRegion: content.business.address.region,
        postalCode: content.business.address.postalCode,
        streetAddress: content.business.address.street,
      },
      description: content.page.seoDescription,
      geo: {
        '@type': 'GeoCoordinates',
        latitude: content.business.coordinates.latitude,
        longitude: content.business.coordinates.longitude,
      },
      hasMenu: { '@id': menuId },
      ...(image ? { image: image.url } : {}),
      name: content.business.name,
      openingHoursSpecification: weeklyHours(content.weeklySchedule),
      ...(content.business.priceRange ? { priceRange: content.business.priceRange } : {}),
      ...(sameAs.length > 0 ? { sameAs } : {}),
      ...(specialOpeningHours.length > 0
        ? { specialOpeningHoursSpecification: specialOpeningHours }
        : {}),
      telephone: content.business.phone.e164,
      url: canonicalUrl,
    }

    const menu: MenuStructuredData = {
      '@id': menuId,
      '@type': 'Menu',
      hasMenuSection: content.menu.map(menuSection),
      name: content.page.menuHeading,
    }

    return {
      canonicalUrl,
      description: content.page.seoDescription,
      openGraph: {
        description: content.page.seoDescription,
        ...(image
          ? {
              image: image.url,
              ...(!image.decorative ? { imageAlt: image.alt } : {}),
              imageHeight: image.dimensions.height,
              imageWidth: image.dimensions.width,
            }
          : {}),
        title: content.page.seoTitle,
        type: 'website',
        url: canonicalUrl,
      },
      structuredData: {
        '@context': 'https://schema.org',
        '@graph': [restaurant, menu],
      },
      title: content.page.seoTitle,
    }
  }

  export function serializeStructuredData(data: SeoView['structuredData']): string {
    return JSON.stringify(data).replaceAll('<', '\\u003c')
  }
</script>

<script lang="ts">
  let { view }: { view: SeoView } = $props()
  const structuredData = $derived(serializeStructuredData(view.structuredData))
</script>

<svelte:head>
  <title>{view.title}</title>
  <meta name="description" content={view.description} />
  <link rel="canonical" href={view.canonicalUrl} />

  <meta property="og:type" content={view.openGraph.type} />
  <meta property="og:title" content={view.openGraph.title} />
  <meta property="og:description" content={view.openGraph.description} />
  <meta property="og:url" content={view.openGraph.url} />
  {#if view.openGraph.image}
    <meta property="og:image" content={view.openGraph.image} />
    <meta property="og:image:width" content={view.openGraph.imageWidth?.toString()} />
    <meta property="og:image:height" content={view.openGraph.imageHeight?.toString()} />
    {#if view.openGraph.imageAlt}
      <meta property="og:image:alt" content={view.openGraph.imageAlt} />
    {/if}
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:image" content={view.openGraph.image} />
    {#if view.openGraph.imageAlt}
      <meta name="twitter:image:alt" content={view.openGraph.imageAlt} />
    {/if}
  {:else}
    <meta name="twitter:card" content="summary" />
  {/if}
  <meta name="twitter:title" content={view.openGraph.title} />
  <meta name="twitter:description" content={view.openGraph.description} />

  <svelte:element this={"script"} type="application/ld+json">{structuredData}</svelte:element>
</svelte:head>
