import { env as privateEnvironment } from '$env/dynamic/private'
import type { GooglePlaceSummary } from '$lib/google-place'
import { loadGooglePlaceSummary, loadGooglePlacesConfiguration } from '$lib/server/google-places'
import { json } from '@sveltejs/kit'

import type { RequestHandler } from './$types'

const TEST_SUMMARY = {
  attributions: [],
  rating: 4.8,
  reviewCount: 143,
  reviewsUrl: 'https://www.google.com/maps/place/fixture/reviews',
} satisfies GooglePlaceSummary

const NO_STORE_HEADERS = {
  'cache-control': 'private, no-store, max-age=0',
} as const

export const GET: RequestHandler = async () => {
  if (privateEnvironment.GRANDE_E2E_MODE === '1') {
    return json(TEST_SUMMARY, { headers: NO_STORE_HEADERS })
  }

  const configuration = loadGooglePlacesConfiguration(privateEnvironment)
  if (!configuration) return new Response(null, { headers: NO_STORE_HEADERS, status: 204 })

  const summary = await loadGooglePlaceSummary(configuration)
  if (!summary) {
    return json(
      { message: 'Google Maps rating is temporarily unavailable' },
      { headers: NO_STORE_HEADERS, status: 503 },
    )
  }

  return json(summary, { headers: NO_STORE_HEADERS })
}
