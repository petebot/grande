import { describe, expect, it } from 'vitest'

import { ContentValidationError } from '../src/normalize.js'
import { PUBLIC_SITE_CONTENT_QUERY } from '../src/queries.js'
import {
  SnapshotParseError,
  buildPublishedSnapshot,
  generatePublishedSnapshot,
  parsePublishedSnapshot,
  serializePublishedSnapshot,
  summarizePublishedSnapshot,
} from '../src/snapshot.js'
import { PUBLIC_CONTENT_SCHEMA_VERSION } from '../src/types.js'
import {
  DEVELOPMENT_REFERENCE_NOW,
  developmentContentFixture,
} from '../test/fixtures/development-content.js'

const confirmedProvenance = {
  status: 'confirmed',
  source: 'AUTOMATED TEST ONLY — not real-world verification.',
  verifiedAt: DEVELOPMENT_REFERENCE_NOW,
  verifiedBy: 'Automated snapshot test',
} as const

const licensedProvenance = {
  status: 'licensed',
  source: 'AUTOMATED TEST ONLY — not a real asset license.',
  verifiedAt: DEVELOPMENT_REFERENCE_NOW,
  verifiedBy: 'Automated snapshot test',
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

describe('generatePublishedSnapshot', () => {
  it('fetches the canonical published projection and writes authoritative metadata', async () => {
    const input = productionReadyTestInput()
    let capturedRequest: unknown

    const result = await generatePublishedSnapshot({
      now: DEVELOPMENT_REFERENCE_NOW,
      fetchContent: (request) => {
        capturedRequest = request
        return Promise.resolve({
          ...input,
          schemaVersion: 999,
          generatedAt: '2000-01-01T00:00:00.000Z',
        })
      },
    })

    expect(capturedRequest).toEqual({
      query: PUBLIC_SITE_CONTENT_QUERY,
      params: { now: DEVELOPMENT_REFERENCE_NOW },
      perspective: 'published',
      useCdn: true,
    })
    expect(result.snapshot.schemaVersion).toBe(PUBLIC_CONTENT_SCHEMA_VERSION)
    expect(result.snapshot.generatedAt).toBe(DEVELOPMENT_REFERENCE_NOW)
    expect(result.snapshot.contentRevision).toBe(input.contentRevision)
    expect(result.serialized).toBe(`${JSON.stringify(result.snapshot, null, 2)}\n`)
  })

  it('rejects provisional projected content instead of producing a public snapshot', async () => {
    await expect(
      generatePublishedSnapshot({
        now: DEVELOPMENT_REFERENCE_NOW,
        fetchContent: () => Promise.resolve(developmentContentFixture),
      }),
    ).rejects.toBeInstanceOf(ContentValidationError)
  })
})

describe('published snapshot validation and serialization', () => {
  it('normalizes ordering into stable output without mutating input', () => {
    const input = productionReadyTestInput()
    const scrambled = {
      ...input,
      hoursExceptions: [...input.hoursExceptions].reverse(),
      menu: [...input.menu].reverse().map((category) => ({
        ...category,
        items: [...category.items].reverse(),
      })),
      announcements: [...input.announcements].reverse(),
      media: [...input.media].reverse(),
    }
    const before = structuredClone(scrambled)

    const first = buildPublishedSnapshot(input, { generatedAt: DEVELOPMENT_REFERENCE_NOW })
    const second = buildPublishedSnapshot(scrambled, { generatedAt: DEVELOPMENT_REFERENCE_NOW })

    expect(serializePublishedSnapshot(second)).toBe(serializePublishedSnapshot(first))
    expect(scrambled).toEqual(before)
  })

  it('parses and revalidates a complete fallback snapshot', () => {
    const snapshot = buildPublishedSnapshot(productionReadyTestInput(), {
      generatedAt: DEVELOPMENT_REFERENCE_NOW,
    })

    expect(parsePublishedSnapshot(serializePublishedSnapshot(snapshot))).toEqual(snapshot)
  })

  it('rejects malformed JSON and valid JSON with invalid fallback content', () => {
    expect(() => parsePublishedSnapshot('{not-json')).toThrow(SnapshotParseError)
    expect(() => parsePublishedSnapshot(JSON.stringify(developmentContentFixture))).toThrow(
      ContentValidationError,
    )
  })

  it('summarizes only safe operational metadata and counts', () => {
    const snapshot = buildPublishedSnapshot(productionReadyTestInput(), {
      generatedAt: DEVELOPMENT_REFERENCE_NOW,
    })

    expect(summarizePublishedSnapshot(snapshot)).toEqual({
      schemaVersion: PUBLIC_CONTENT_SCHEMA_VERSION,
      generatedAt: DEVELOPMENT_REFERENCE_NOW,
      contentRevision: developmentContentFixture.contentRevision,
      menuCategoryCount: 2,
      menuItemCount: 4,
      announcementCount: 3,
      mediaCount: 3,
    })
  })
})
