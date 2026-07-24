import { describe, expect, it, vi } from 'vitest'

import { loadGooglePlaceSummary, loadGooglePlacesConfiguration } from './google-places'

const responseBody = {
  attributions: [
    { provider: 'Fixture provider', providerUri: 'https://example.com/fixture-provider' },
  ],
  googleMapsLinks: { reviewsUri: 'https://www.google.com/maps/place/fixture/reviews' },
  rating: 4.8,
  userRatingCount: 143,
}

describe('loadGooglePlacesConfiguration', () => {
  it('returns a complete server-only configuration', () => {
    expect(
      loadGooglePlacesConfiguration({
        GOOGLE_PLACES_API_KEY: 'server-only-key',
        GOOGLE_PLACE_ID: 'ChIJFixturePlace',
      }),
    ).toEqual({ apiKey: 'server-only-key', placeId: 'ChIJFixturePlace' })
  })

  it('disables enrichment when configuration is absent, partial, or malformed', () => {
    expect(loadGooglePlacesConfiguration({})).toBeNull()
    expect(loadGooglePlacesConfiguration({ GOOGLE_PLACE_ID: 'ChIJFixturePlace' })).toBeNull()
    expect(
      loadGooglePlacesConfiguration({
        GOOGLE_PLACES_API_KEY: 'bad key',
        GOOGLE_PLACE_ID: 'ChIJFixturePlace',
      }),
    ).toBeNull()
  })
})

describe('loadGooglePlaceSummary', () => {
  it('requests only the display fields and keeps the API key out of the URL', async () => {
    const fetcher = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(responseBody), {
        headers: { 'content-type': 'application/json' },
        status: 200,
      }),
    )

    await expect(
      loadGooglePlaceSummary({
        apiKey: 'server-only-key',
        fetcher,
        placeId: 'ChIJFixturePlace',
      }),
    ).resolves.toEqual({
      attributions: responseBody.attributions,
      rating: 4.8,
      reviewCount: 143,
      reviewsUrl: responseBody.googleMapsLinks.reviewsUri,
    })

    const [url, init] = fetcher.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('https://places.googleapis.com/v1/places/ChIJFixturePlace')
    expect(url).not.toContain('server-only-key')
    expect(init.headers).toEqual({
      'X-Goog-Api-Key': 'server-only-key',
      'X-Goog-FieldMask': 'attributions,googleMapsLinks,googleMapsUri,rating,userRatingCount',
    })
  })

  it('returns no enrichment for failed or malformed provider responses', async () => {
    const failedFetch = vi.fn().mockResolvedValue(new Response(null, { status: 403 }))
    const malformedFetch = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify({ rating: 7 }), { status: 200 }))

    await expect(
      loadGooglePlaceSummary({
        apiKey: 'server-only-key',
        fetcher: failedFetch,
        placeId: 'ChIJFixturePlace',
      }),
    ).resolves.toBeNull()
    await expect(
      loadGooglePlaceSummary({
        apiKey: 'server-only-key',
        fetcher: malformedFetch,
        placeId: 'ChIJFixturePlace',
      }),
    ).resolves.toBeNull()
  })

  it('preserves a provider attribution even when Google supplies no provider link', async () => {
    const fetcher = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          ...responseBody,
          attributions: [{ provider: 'Fixture provider without a link' }],
        }),
        { status: 200 },
      ),
    )

    await expect(
      loadGooglePlaceSummary({
        apiKey: 'server-only-key',
        fetcher,
        placeId: 'ChIJFixturePlace',
      }),
    ).resolves.toMatchObject({
      attributions: [{ provider: 'Fixture provider without a link' }],
    })
  })

  it('bounds a stalled request and aborts it', async () => {
    vi.useFakeTimers()
    let signal: AbortSignal | undefined
    const fetcher = vi.fn<typeof fetch>().mockImplementation((_input, init) => {
      signal = init?.signal ?? undefined
      return new Promise<Response>((_resolve, reject) => {
        signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')))
      })
    })

    const pending = loadGooglePlaceSummary({
      apiKey: 'server-only-key',
      fetcher,
      placeId: 'ChIJFixturePlace',
      timeoutMs: 25,
    })
    await vi.advanceTimersByTimeAsync(25)

    await expect(pending).resolves.toBeNull()
    expect(signal?.aborted).toBe(true)
    vi.useRealTimers()
  })
})
