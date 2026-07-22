import { evaluate, parse } from 'groq-js'
import { describe, expect, it } from 'vitest'

import { normalizePublicSiteContent } from '../src/normalize.js'
import { PUBLIC_SITE_CONTENT_QUERY, createPublicSiteContentQueryRequest } from '../src/queries.js'
import type { NormalizedPublicSiteSnapshot } from '../src/types.js'
import {
  DEVELOPMENT_REFERENCE_NOW,
  developmentContentFixture,
  developmentFixtureCoverage,
} from '../test/fixtures/development-content.js'

const referenceNow = '2026-07-22T00:00:00.000Z'

function sanityDatasetFromDevelopmentFixture(): unknown[] {
  const fixture: NormalizedPublicSiteSnapshot = developmentContentFixture

  return [
    {
      _id: fixture.business.id,
      _rev: fixture.business.revision,
      _type: 'businessProfile',
      provenance: fixture.business.provenance,
      name: fixture.business.name,
      tagline: fixture.business.tagline,
      phone: fixture.business.phone,
      address: fixture.business.address,
      coordinates: {
        _type: 'geopoint',
        lat: fixture.business.coordinates.latitude,
        lng: fixture.business.coordinates.longitude,
      },
      timezone: fixture.business.timezone,
      orderingUrl: fixture.business.orderingUrl,
      directionsUrl: fixture.business.directionsUrl,
      socialLinks: fixture.business.socialLinks,
      priceRange: fixture.business.priceRange,
      lastReviewedAt: fixture.business.lastReviewedAt,
    },
    {
      _id: 'development.weekly-schedule',
      _rev: 'development.weekly-schedule.revision-001',
      _type: 'weeklySchedule',
      days: fixture.weeklySchedule,
    },
    ...fixture.hoursExceptions.map((exception) => ({
      _id: exception.id,
      _rev: exception.revision,
      _type: 'hoursException',
      provenance: exception.provenance,
      startsOn: exception.startsOn,
      endsOn: exception.endsOn,
      status: exception.status,
      intervals: exception.intervals,
      publicNote: exception.publicNote,
      priority: exception.priority,
      expiresAt: exception.expiresAt,
    })),
    ...fixture.menu.map((category) => ({
      _id: category.id,
      _rev: category.revision,
      _type: 'menuCategory',
      name: category.name,
      slug: { _type: 'slug', current: category.slug },
      description: category.description,
      sortOrder: category.sortOrder,
      isActive: category.isActive,
    })),
    ...fixture.menu.flatMap((category) =>
      category.items.map((item) => ({
        _id: item.id,
        _rev: item.revision,
        _type: 'menuItem',
        provenance: item.provenance,
        category: { _type: 'reference', _ref: category.id },
        name: item.name,
        description: item.description,
        pricingKind: item.pricingKind,
        ...(item.pricingKind === 'fixed'
          ? {
              priceOptions: item.priceOptions.map((option) => ({
                label: option.label,
                amount: option.price.amountMinor / 100,
              })),
            }
          : { marketPriceLabel: item.marketPriceLabel }),
        dietaryLabels: item.dietaryLabels,
        heatLevel: item.heatLevel,
        availability: item.availability,
        isVisible: item.isVisible,
        isFeatured: item.isFeatured,
        seasonality: item.seasonality,
        image: item.imageId ? { _type: 'reference', _ref: item.imageId } : undefined,
        sortOrder: item.sortOrder,
      })),
    ),
    ...fixture.announcements.map((announcement) => ({
      _id: announcement.id,
      _rev: announcement.revision,
      _type: 'announcement',
      provenance: announcement.provenance,
      title: announcement.title,
      message: announcement.message,
      kind: announcement.kind,
      startsAt: announcement.startsAt,
      endsAt: announcement.endsAt,
      action: announcement.action,
      priority: announcement.priority,
      isEnabled: announcement.isEnabled,
    })),
    {
      _id: fixture.page.id,
      _rev: fixture.page.revision,
      _type: 'pageContent',
      provenance: fixture.page.provenance,
      heroEyebrow: fixture.page.heroEyebrow,
      heroHeading: fixture.page.heroHeading,
      heroBody: fixture.page.heroBody,
      storyHeading: fixture.page.storyHeading,
      storyBody: fixture.page.storyBody.map((block) => ({
        _key: block.key,
        _type: block.type,
        style: block.style,
        listItem: block.listItem,
        level: block.level,
        children: block.children.map((span) => ({
          _key: span.key,
          _type: span.type,
          text: span.text,
          marks: span.marks,
        })),
        markDefs: block.markDefinitions.map((mark) => ({
          _key: mark.key,
          _type: mark.type,
          href: mark.href,
        })),
      })),
      menuHeading: fixture.page.menuHeading,
      locationHeading: fixture.page.locationHeading,
      seoTitle: fixture.page.seoTitle,
      seoDescription: fixture.page.seoDescription,
      socialImage: fixture.page.socialImageId
        ? { _type: 'reference', _ref: fixture.page.socialImageId }
        : undefined,
    },
    ...fixture.media.map((media) => ({
      _id: media.id,
      _rev: media.revision,
      _type: 'media',
      provenance: media.provenance,
      image: {
        _type: 'image',
        asset: { _type: 'reference', _ref: media.assetId },
        ...(media.focalPoint ? { hotspot: { x: media.focalPoint.x, y: media.focalPoint.y } } : {}),
      },
      decorative: media.decorative,
      alt: media.alt,
      caption: media.caption,
      credit: media.credit,
      rightsStatus: media.rightsStatus,
    })),
    ...fixture.media.map((media) => ({
      _id: media.assetId,
      _rev: `${media.assetId}.revision-001`,
      _type: 'sanity.imageAsset',
      url: media.url,
      metadata: { dimensions: media.dimensions },
    })),
  ]
}

describe('PUBLIC_SITE_CONTENT_QUERY', () => {
  it('is valid GROQ with one canonical projection for every public content type', () => {
    expect(() => parse(PUBLIC_SITE_CONTENT_QUERY, { params: { now: referenceNow } })).not.toThrow()

    for (const documentType of [
      'businessProfile',
      'weeklySchedule',
      'hoursException',
      'menuCategory',
      'menuItem',
      'announcement',
      'pageContent',
      'media',
    ]) {
      expect(PUBLIC_SITE_CONTENT_QUERY).toContain(`_type == "${documentType}"`)
    }
  })

  it('projects the complete normalized boundary and no Studio-only evidence', () => {
    for (const publicField of [
      'schemaVersion',
      'generatedAt',
      'contentRevision',
      'business',
      'weeklySchedule',
      'hoursExceptions',
      'menu',
      'announcements',
      'page',
      'media',
    ]) {
      expect(PUBLIC_SITE_CONTENT_QUERY).toContain(`"${publicField}"`)
    }

    expect(PUBLIC_SITE_CONTENT_QUERY).not.toMatch(/\b(?:internalNote|notes|rightsEvidence)\b/)
  })

  it('derives draft identity and uses a caller-supplied instant for scheduled content', () => {
    expect(PUBLIC_SITE_CONTENT_QUERY).toContain('_originalId in path("drafts.**")')
    expect(PUBLIC_SITE_CONTENT_QUERY).toContain('dateTime($now)')
    expect(PUBLIC_SITE_CONTENT_QUERY).not.toContain('now()')
  })

  it('evaluates fixture-shaped Sanity documents into a valid normalized draft boundary', async () => {
    const params = { now: DEVELOPMENT_REFERENCE_NOW }
    const tree = parse(PUBLIC_SITE_CONTENT_QUERY, { params })
    const evaluated = await evaluate(tree, {
      dataset: sanityDatasetFromDevelopmentFixture(),
      params,
    })
    const result = await evaluated.get()
    const normalized = normalizePublicSiteContent(result, { perspective: 'drafts' })

    expect(normalized.announcements.map(({ id }) => id)).toEqual([
      developmentFixtureCoverage.activeAnnouncementId,
    ])
    expect(normalized.menu).toHaveLength(developmentContentFixture.menu.length)
    expect(normalized.media).toHaveLength(developmentContentFixture.media.length)
    expect(normalized.contentRevision).not.toBe('')
  })
})

describe('createPublicSiteContentQueryRequest', () => {
  it('uses the same query and CDN-safe published options', () => {
    expect(
      createPublicSiteContentQueryRequest({ perspective: 'published', now: referenceNow }),
    ).toEqual({
      query: PUBLIC_SITE_CONTENT_QUERY,
      params: { now: referenceNow },
      perspective: 'published',
      useCdn: true,
    })
  })

  it('disables the CDN for authenticated draft perspective', () => {
    expect(
      createPublicSiteContentQueryRequest({ perspective: 'drafts', now: referenceNow }),
    ).toEqual({
      query: PUBLIC_SITE_CONTENT_QUERY,
      params: { now: referenceNow },
      perspective: 'drafts',
      useCdn: false,
    })
  })

  it.each([
    ['an invalid instant', { perspective: 'published', now: 'tomorrow-ish' }],
    ['the raw perspective', { perspective: 'raw', now: referenceNow }],
  ])('rejects %s', (_label, options) => {
    expect(() =>
      createPublicSiteContentQueryRequest(
        options as Parameters<typeof createPublicSiteContentQueryRequest>[0],
      ),
    ).toThrow()
  })
})
