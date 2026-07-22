import { readFile } from 'node:fs/promises'

import { env as privateEnvironment } from '$env/dynamic/private'
import bundledSnapshot from '$lib/content/public-content.snapshot.json?raw'
import { resolveHours } from '$lib/hours/resolve'
import {
  PublicContentUnavailableError,
  createPublicContentLoader,
  createSanityContentLoader,
  type LoadedPublicContent,
} from '$lib/server/content'
import { loadPublicEnvironment } from '$lib/server/env'
import { error } from '@sveltejs/kit'
import type { Announcement } from '@grande/content'

import type { PageServerLoad } from './$types'

const E2E_CONTENT_HEADER = 'x-grande-e2e-content'

let liveContentLoader: (() => Promise<LoadedPublicContent>) | undefined

// The first customer slice is fully server-rendered. A later hydration task will
// introduce a deliberately minimized browser data shape for live status refreshes.
export const csr = false

function productionContentLoader(): () => Promise<LoadedPublicContent> {
  if (liveContentLoader) return liveContentLoader

  const environment = loadPublicEnvironment()
  liveContentLoader = createSanityContentLoader({
    ...environment.sanity,
    fallbackSnapshot: bundledSnapshot,
  })

  return liveContentLoader
}

function requestNow(): Date {
  const fixedNow =
    privateEnvironment.GRANDE_E2E_MODE === '1' ? privateEnvironment.GRANDE_E2E_NOW : undefined
  const now = fixedNow ? new Date(fixedNow) : new Date()

  if (Number.isNaN(now.getTime())) throw new Error('GRANDE_E2E_NOW must be a valid ISO timestamp')
  return now
}

async function testContentLoader(request: Request): Promise<LoadedPublicContent | undefined> {
  if (privateEnvironment.GRANDE_E2E_MODE !== '1') return undefined

  const scenario = request.headers.get(E2E_CONTENT_HEADER) ?? 'live'
  if (scenario !== 'live' && scenario !== 'outage') {
    throw new Error(`Unsupported ${E2E_CONTENT_HEADER} browser-test scenario`)
  }

  const snapshotPath = privateEnvironment.GRANDE_E2E_SNAPSHOT_PATH
  if (!snapshotPath) throw new Error('GRANDE_E2E_SNAPSHOT_PATH is required in browser-test mode')

  const snapshot = await readFile(snapshotPath, 'utf8')
  const loader = createPublicContentLoader({
    fallbackSnapshot: snapshot,
    fetchContent:
      scenario === 'outage'
        ? () => Promise.reject(new Error('AUTOMATED TEST ONLY — simulated Sanity outage'))
        : () => Promise.resolve(JSON.parse(snapshot)),
    now: requestNow,
  })

  return loader()
}

function activeAnnouncements(
  announcements: readonly Announcement[],
  now: Date,
): readonly Announcement[] {
  const instant = now.toISOString()

  return announcements.filter(
    ({ endsAt, isEnabled, startsAt }) =>
      isEnabled && startsAt <= instant && (endsAt === undefined || endsAt > instant),
  )
}

export const load: PageServerLoad = async ({ request, setHeaders }) => {
  try {
    const loadedContent = (await testContentLoader(request)) ?? (await productionContentLoader()())
    const now = requestNow()
    const currentHours = resolveHours({
      hoursExceptions: loadedContent.content.hoursExceptions,
      now,
      timeZone: loadedContent.content.business.timezone,
      weeklySchedule: loadedContent.content.weeklySchedule,
    })

    setHeaders({
      'cache-control': loadedContent.cacheControl,
      vary: privateEnvironment.GRANDE_E2E_MODE === '1' ? E2E_CONTENT_HEADER : 'Accept-Encoding',
    })

    return {
      announcements: activeAnnouncements(loadedContent.content.announcements, now),
      content: loadedContent.content,
      contentSource: loadedContent.contentSource,
      currentHours,
      generatedAt: loadedContent.generatedAt,
    }
  } catch (caught) {
    if (caught instanceof PublicContentUnavailableError) {
      setHeaders({ 'cache-control': 'no-store' })
      error(503, 'Published menu and hours are temporarily unavailable')
    }

    throw caught
  }
}
