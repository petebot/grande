import {
  buildPublishedSnapshot,
  serializePublishedSnapshot,
  type NormalizedPublicSiteSnapshot,
} from '@grande/content'
import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  PUBLIC_CONTENT_CACHE_CONTROL,
  PublicContentUnavailableError,
  createPublicContentLoader,
} from './content'
import {
  DEVELOPMENT_REFERENCE_NOW,
  developmentContentFixture,
} from '../../../../../packages/content/test/fixtures/development-content'

const confirmedProvenance = {
  status: 'confirmed',
  source: 'AUTOMATED TEST ONLY — not real-world verification.',
  verifiedAt: DEVELOPMENT_REFERENCE_NOW,
  verifiedBy: 'Automated content-loader test',
} as const

const licensedProvenance = {
  status: 'licensed',
  source: 'AUTOMATED TEST ONLY — not a real asset license.',
  verifiedAt: DEVELOPMENT_REFERENCE_NOW,
  verifiedBy: 'Automated content-loader test',
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

function publishedSnapshot(
  overrides: Partial<NormalizedPublicSiteSnapshot> = {},
): NormalizedPublicSiteSnapshot {
  return {
    ...buildPublishedSnapshot(productionReadyTestInput(), {
      generatedAt: DEVELOPMENT_REFERENCE_NOW,
    }),
    ...overrides,
  }
}

function serializedFallback(overrides: Partial<NormalizedPublicSiteSnapshot> = {}): string {
  return serializePublishedSnapshot(publishedSnapshot(overrides))
}

afterEach(() => {
  vi.useRealTimers()
})

describe('createPublicContentLoader', () => {
  it('returns a validated live snapshot with the shared public cache policy', async () => {
    const live = publishedSnapshot({ contentRevision: 'live-revision' })
    const fetchContent = vi.fn().mockResolvedValue(live)
    const loadPublicContent = createPublicContentLoader({
      fetchContent,
      fallbackSnapshot: serializedFallback({ contentRevision: 'fallback-revision' }),
      now: () => new Date(DEVELOPMENT_REFERENCE_NOW),
    })

    const result = await loadPublicContent()

    expect(result.content).toEqual(live)
    expect(result.contentSource).toBe('live')
    expect(result.generatedAt).toBe(DEVELOPMENT_REFERENCE_NOW)
    expect(result.cacheControl).toBe(PUBLIC_CONTENT_CACHE_CONTROL)
    expect(result.diagnostics).toEqual({
      contentSource: 'live',
      generatedAt: DEVELOPMENT_REFERENCE_NOW,
      contentRevision: 'live-revision',
    })
    expect(fetchContent).toHaveBeenCalledWith(
      expect.objectContaining({
        perspective: 'published',
        params: { now: DEVELOPMENT_REFERENCE_NOW },
        useCdn: true,
      }),
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    )
  })

  it('bounds a stalled Sanity request, aborts it, and returns the deployment snapshot', async () => {
    vi.useFakeTimers()
    const fallback = publishedSnapshot({ contentRevision: 'fallback-after-timeout' })
    let capturedSignal: AbortSignal | undefined
    const loadPublicContent = createPublicContentLoader({
      fetchContent: (_request, { signal }) => {
        capturedSignal = signal
        return new Promise(() => undefined)
      },
      fallbackSnapshot: serializePublishedSnapshot(fallback),
      timeoutMs: 25,
      now: () => new Date(DEVELOPMENT_REFERENCE_NOW),
    })

    const pendingResult = loadPublicContent()
    await vi.advanceTimersByTimeAsync(25)
    const result = await pendingResult

    expect(capturedSignal?.aborted).toBe(true)
    expect(result.contentSource).toBe('snapshot')
    expect(result.content).toEqual(fallback)
    expect(result.diagnostics.fallbackReason).toBe('timeout')
  })

  it('rejects a malformed live response and returns one complete fallback without mixing', async () => {
    const fallback = publishedSnapshot({ contentRevision: 'complete-fallback' })
    const malformedLive = {
      ...publishedSnapshot({ contentRevision: 'bad-live-revision' }),
      business: {
        ...fallback.business,
        name: 'MUST NOT LEAK FROM INVALID LIVE CONTENT',
      },
      menu: [
        {
          ...fallback.menu[0],
          items: [{ ...fallback.menu[0]!.items[0], priceOptions: [] }],
        },
      ],
    }
    const loadPublicContent = createPublicContentLoader({
      fetchContent: () => Promise.resolve(malformedLive),
      fallbackSnapshot: serializePublishedSnapshot(fallback),
      now: () => new Date(DEVELOPMENT_REFERENCE_NOW),
    })

    const result = await loadPublicContent()

    expect(result.contentSource).toBe('snapshot')
    expect(result.content).toEqual(fallback)
    expect(result.content.business.name).not.toContain('MUST NOT LEAK')
    expect(result.diagnostics.fallbackReason).toBe('invalid-live-content')
  })

  it('uses a recent complete live cache before the older deployment snapshot', async () => {
    let now = new Date(DEVELOPMENT_REFERENCE_NOW)
    const live = publishedSnapshot({ contentRevision: 'cached-live-revision' })
    const fetchContent = vi
      .fn()
      .mockResolvedValueOnce(live)
      .mockRejectedValueOnce(new Error('AUTOMATED TEST ONLY — simulated Sanity outage'))
    const loadPublicContent = createPublicContentLoader({
      fetchContent,
      fallbackSnapshot: serializedFallback({ contentRevision: 'older-fallback-revision' }),
      cacheMaxAgeMs: 5_000,
      now: () => now,
    })

    await expect(loadPublicContent()).resolves.toMatchObject({ contentSource: 'live' })
    now = new Date(new Date(DEVELOPMENT_REFERENCE_NOW).getTime() + 1_000)
    const cachedResult = await loadPublicContent()

    expect(cachedResult.contentSource).toBe('cache')
    expect(cachedResult.content).toEqual(live)
    expect(cachedResult.diagnostics).toMatchObject({
      contentSource: 'cache',
      contentRevision: 'cached-live-revision',
      fallbackReason: 'fetch-failed',
      cacheAgeMs: 1_000,
    })
  })

  it('fails deliberately when neither live content nor the snapshot is valid', async () => {
    const loadPublicContent = createPublicContentLoader({
      fetchContent: () => Promise.reject(new Error('sensitive provider detail')),
      fallbackSnapshot: '{malformed-fallback',
      now: () => new Date(DEVELOPMENT_REFERENCE_NOW),
    })

    const error = await loadPublicContent().catch((caught: unknown) => caught)

    expect(error).toBeInstanceOf(PublicContentUnavailableError)
    expect(error).toMatchObject({
      message: 'Published content is temporarily unavailable',
      liveFailure: 'fetch-failed',
      snapshotFailure: 'invalid-snapshot',
    })
    expect(JSON.stringify(error)).not.toContain('sensitive provider detail')
  })
})
