import { createClient } from '@sanity/client'
import {
  ContentValidationError,
  createPublicSiteContentQueryRequest,
  normalizePublicSiteContent,
  parsePublishedSnapshot,
  type ContentSource,
  type IsoDateTime,
  type NormalizedPublicSiteSnapshot,
  type PublicSiteContentQueryRequest,
} from '@grande/content'

export const DEFAULT_CONTENT_TIMEOUT_MS = 1_500
export const DEFAULT_CONTENT_CACHE_MAX_AGE_MS = 5 * 60 * 1_000
export const PUBLIC_CONTENT_CACHE_CONTROL =
  'public, max-age=0, s-maxage=60, stale-while-revalidate=300'

export type ContentFallbackReason = 'timeout' | 'fetch-failed' | 'invalid-live-content'

export interface PublicContentDiagnostics {
  readonly contentSource: ContentSource
  readonly generatedAt: IsoDateTime
  readonly contentRevision: string
  readonly fallbackReason?: ContentFallbackReason
  readonly cacheAgeMs?: number
}

export interface LoadedPublicContent {
  readonly content: NormalizedPublicSiteSnapshot
  readonly contentSource: ContentSource
  readonly generatedAt: IsoDateTime
  readonly cacheControl: typeof PUBLIC_CONTENT_CACHE_CONTROL
  readonly diagnostics: PublicContentDiagnostics
}

export interface PublicContentFetchOptions {
  readonly signal: AbortSignal
}

export type PublicContentFetcher = (
  request: PublicSiteContentQueryRequest,
  options: PublicContentFetchOptions,
) => Promise<unknown>

export type FallbackSnapshotSource = string | (() => string | Promise<string>)

export interface PublicContentLoaderOptions {
  readonly fetchContent: PublicContentFetcher
  readonly fallbackSnapshot: FallbackSnapshotSource
  readonly timeoutMs?: number
  readonly cacheMaxAgeMs?: number
  readonly now?: () => Date
}

export interface SanityContentLoaderOptions extends Omit<
  PublicContentLoaderOptions,
  'fetchContent'
> {
  readonly projectId: string
  readonly dataset: string
  readonly apiVersion: string
}

export class PublicContentUnavailableError extends Error {
  readonly liveFailure: ContentFallbackReason
  readonly snapshotFailure = 'invalid-snapshot' as const

  constructor(liveFailure: ContentFallbackReason) {
    super('Published content is temporarily unavailable')
    this.name = 'PublicContentUnavailableError'
    this.liveFailure = liveFailure
  }
}

class ContentRequestTimeoutError extends Error {
  constructor() {
    super('Published content request exceeded its timeout')
    this.name = 'ContentRequestTimeoutError'
  }
}

interface CachedPublicContent {
  readonly content: NormalizedPublicSiteSnapshot
  readonly cachedAt: number
}

function duration(
  name: 'timeoutMs' | 'cacheMaxAgeMs',
  value: number | undefined,
  fallback: number,
  allowZero: boolean,
): number {
  const normalized = value ?? fallback
  const minimum = allowZero ? 0 : 1

  if (!Number.isInteger(normalized) || normalized < minimum) {
    throw new TypeError(`${name} must be an integer greater than or equal to ${minimum}`)
  }

  return normalized
}

function diagnostics(
  content: NormalizedPublicSiteSnapshot,
  contentSource: ContentSource,
  fallbackReason?: ContentFallbackReason,
  cacheAgeMs?: number,
): PublicContentDiagnostics {
  return {
    contentSource,
    generatedAt: content.generatedAt,
    contentRevision: content.contentRevision,
    ...(fallbackReason === undefined ? {} : { fallbackReason }),
    ...(cacheAgeMs === undefined ? {} : { cacheAgeMs }),
  }
}

function loadedContent(
  content: NormalizedPublicSiteSnapshot,
  contentSource: ContentSource,
  fallbackReason?: ContentFallbackReason,
  cacheAgeMs?: number,
): LoadedPublicContent {
  return {
    content,
    contentSource,
    generatedAt: content.generatedAt,
    cacheControl: PUBLIC_CONTENT_CACHE_CONTROL,
    diagnostics: diagnostics(content, contentSource, fallbackReason, cacheAgeMs),
  }
}

async function fetchWithTimeout(
  fetchContent: PublicContentFetcher,
  request: PublicSiteContentQueryRequest,
  timeoutMs: number,
): Promise<unknown> {
  const controller = new AbortController()
  let timeoutHandle: ReturnType<typeof setTimeout> | undefined

  const timeout = new Promise<never>((_resolve, reject) => {
    timeoutHandle = setTimeout(() => {
      controller.abort()
      reject(new ContentRequestTimeoutError())
    }, timeoutMs)
  })

  try {
    return await Promise.race([
      Promise.resolve().then(() => fetchContent(request, { signal: controller.signal })),
      timeout,
    ])
  } finally {
    if (timeoutHandle !== undefined) clearTimeout(timeoutHandle)
  }
}

function liveFailure(error: unknown): ContentFallbackReason {
  if (error instanceof ContentRequestTimeoutError) return 'timeout'
  if (error instanceof ContentValidationError) return 'invalid-live-content'
  return 'fetch-failed'
}

async function readFallbackSnapshot(source: FallbackSnapshotSource): Promise<string> {
  return typeof source === 'function' ? source() : source
}

/**
 * Creates one isolated loader and its last-known-good in-memory cache. Every returned
 * value has passed the same published-content validator; sources are never combined.
 */
export function createPublicContentLoader(
  options: PublicContentLoaderOptions,
): () => Promise<LoadedPublicContent> {
  const timeoutMs = duration('timeoutMs', options.timeoutMs, DEFAULT_CONTENT_TIMEOUT_MS, false)
  const cacheMaxAgeMs = duration(
    'cacheMaxAgeMs',
    options.cacheMaxAgeMs,
    DEFAULT_CONTENT_CACHE_MAX_AGE_MS,
    true,
  )
  const now = options.now ?? (() => new Date())
  let cache: CachedPublicContent | undefined

  return async () => {
    const requestStartedAt = now()
    const request = createPublicSiteContentQueryRequest({
      perspective: 'published',
      now: requestStartedAt.toISOString(),
    })
    let fallbackReason: ContentFallbackReason

    try {
      const rawContent = await fetchWithTimeout(options.fetchContent, request, timeoutMs)
      const content = normalizePublicSiteContent(rawContent, { perspective: 'published' })
      cache = { content, cachedAt: requestStartedAt.getTime() }
      return loadedContent(content, 'live')
    } catch (error) {
      fallbackReason = liveFailure(error)
    }

    const cacheAgeMs = cache
      ? Math.max(0, now().getTime() - cache.cachedAt)
      : Number.POSITIVE_INFINITY
    if (cache && cacheAgeMs <= cacheMaxAgeMs) {
      return loadedContent(cache.content, 'cache', fallbackReason, cacheAgeMs)
    }

    try {
      const serializedSnapshot = await readFallbackSnapshot(options.fallbackSnapshot)
      const content = parsePublishedSnapshot(serializedSnapshot)
      return loadedContent(content, 'snapshot', fallbackReason)
    } catch {
      throw new PublicContentUnavailableError(fallbackReason)
    }
  }
}

/** Creates the production published-content loader backed by Sanity's API CDN. */
export function createSanityContentLoader(
  options: SanityContentLoaderOptions,
): () => Promise<LoadedPublicContent> {
  const client = createClient({
    projectId: options.projectId,
    dataset: options.dataset,
    apiVersion: options.apiVersion,
    perspective: 'published',
    useCdn: true,
  })

  return createPublicContentLoader({
    fallbackSnapshot: options.fallbackSnapshot,
    ...(options.timeoutMs === undefined ? {} : { timeoutMs: options.timeoutMs }),
    ...(options.cacheMaxAgeMs === undefined ? {} : { cacheMaxAgeMs: options.cacheMaxAgeMs }),
    ...(options.now === undefined ? {} : { now: options.now }),
    fetchContent: (request, { signal }) =>
      client.fetch(request.query, request.params, {
        perspective: request.perspective,
        signal,
      }),
  })
}
