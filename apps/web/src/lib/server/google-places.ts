import type { GooglePlaceAttribution, GooglePlaceSummary } from '$lib/google-place'

const PLACE_DETAILS_FIELDS = 'attributions,googleMapsLinks,googleMapsUri,rating,userRatingCount'

export const DEFAULT_GOOGLE_PLACES_TIMEOUT_MS = 1_500

type EnvironmentSource = Record<string, string | undefined>

export interface GooglePlacesConfiguration {
  readonly apiKey: string
  readonly placeId: string
}

export interface GooglePlaceSummaryLoaderOptions extends GooglePlacesConfiguration {
  readonly fetcher?: typeof fetch
  readonly timeoutMs?: number
}

function optionalValue(source: EnvironmentSource, key: string): string | null {
  return source[key]?.trim() || null
}

/**
 * Google enrichment is deliberately optional. A partial configuration disables it instead of
 * risking the restaurant's primary menu, hours, and contact experience.
 */
export function loadGooglePlacesConfiguration(
  source: EnvironmentSource,
): GooglePlacesConfiguration | null {
  const apiKey = optionalValue(source, 'GOOGLE_PLACES_API_KEY')
  const placeId = optionalValue(source, 'GOOGLE_PLACE_ID')

  if (!apiKey || !placeId || /\s/.test(apiKey) || /\s/.test(placeId)) return null

  return { apiKey, placeId }
}

function httpsUrl(value: unknown): string | null {
  if (typeof value !== 'string') return null

  try {
    const url = new URL(value)
    return url.protocol === 'https:' ? url.toString() : null
  } catch {
    return null
  }
}

function attribution(value: unknown): GooglePlaceAttribution | null {
  if (!value || typeof value !== 'object') return null

  const candidate = value as Record<string, unknown>
  const provider = typeof candidate.provider === 'string' ? candidate.provider.trim() : ''
  const providerUri = httpsUrl(candidate.providerUri)

  return provider ? { provider, ...(providerUri ? { providerUri } : {}) } : null
}

function summary(value: unknown): GooglePlaceSummary | null {
  if (!value || typeof value !== 'object') return null

  const candidate = value as Record<string, unknown>
  const rating = candidate.rating
  const reviewCount = candidate.userRatingCount
  const mapsLinks =
    candidate.googleMapsLinks && typeof candidate.googleMapsLinks === 'object'
      ? (candidate.googleMapsLinks as Record<string, unknown>)
      : undefined
  const reviewsUrl = httpsUrl(mapsLinks?.reviewsUri) ?? httpsUrl(candidate.googleMapsUri)

  if (
    typeof rating !== 'number' ||
    !Number.isFinite(rating) ||
    rating < 0 ||
    rating > 5 ||
    typeof reviewCount !== 'number' ||
    !Number.isInteger(reviewCount) ||
    reviewCount < 0 ||
    !reviewsUrl
  ) {
    return null
  }

  const attributions = Array.isArray(candidate.attributions)
    ? candidate.attributions
        .map(attribution)
        .filter((item): item is GooglePlaceAttribution => item !== null)
    : []

  return { attributions, rating, reviewCount, reviewsUrl }
}

/** Fetches a small, display-ready projection without caching or leaking provider errors. */
export async function loadGooglePlaceSummary(
  options: GooglePlaceSummaryLoaderOptions,
): Promise<GooglePlaceSummary | null> {
  const fetcher = options.fetcher ?? fetch
  const timeoutMs = options.timeoutMs ?? DEFAULT_GOOGLE_PLACES_TIMEOUT_MS

  if (!Number.isInteger(timeoutMs) || timeoutMs < 1) {
    throw new TypeError('timeoutMs must be an integer greater than or equal to 1')
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetcher(
      `https://places.googleapis.com/v1/places/${encodeURIComponent(options.placeId)}`,
      {
        headers: {
          'X-Goog-Api-Key': options.apiKey,
          'X-Goog-FieldMask': PLACE_DETAILS_FIELDS,
        },
        signal: controller.signal,
      },
    )

    if (!response.ok) return null
    return summary(await response.json())
  } catch {
    return null
  } finally {
    clearTimeout(timeout)
  }
}
