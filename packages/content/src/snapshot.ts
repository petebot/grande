import { ContentValidationError, normalizePublicSiteContent } from './normalize.js'
import {
  createPublicSiteContentQueryRequest,
  type PublicSiteContentQueryRequest,
} from './queries.js'
import {
  PUBLIC_CONTENT_SCHEMA_VERSION,
  type IsoDateTime,
  type NormalizedPublicSiteSnapshot,
} from './types.js'

type UnknownRecord = Record<string, unknown>

export class SnapshotParseError extends Error {
  readonly cause: unknown

  constructor(cause: unknown) {
    super('Published content snapshot must contain valid JSON')
    this.name = 'SnapshotParseError'
    this.cause = cause
  }
}

export interface BuildPublishedSnapshotOptions {
  readonly generatedAt: IsoDateTime
}

export type FetchPublishedContent = (request: PublicSiteContentQueryRequest) => Promise<unknown>

export interface GeneratePublishedSnapshotOptions {
  readonly now: IsoDateTime
  readonly fetchContent: FetchPublishedContent
}

export interface PublishedSnapshotSummary {
  readonly schemaVersion: number
  readonly generatedAt: IsoDateTime
  readonly contentRevision: string
  readonly menuCategoryCount: number
  readonly menuItemCount: number
  readonly announcementCount: number
  readonly mediaCount: number
}

export interface GeneratedPublishedSnapshot {
  readonly snapshot: NormalizedPublicSiteSnapshot
  readonly serialized: string
  readonly summary: PublishedSnapshotSummary
}

function snapshotRecord(value: unknown): UnknownRecord {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new ContentValidationError([{ path: '$', message: 'must be an object' }])
  }

  return value as UnknownRecord
}

/**
 * Converts projected Sanity data into a production-safe, deterministic fallback.
 * Snapshot metadata is owned by the generator rather than trusted from the query result.
 */
export function buildPublishedSnapshot(
  value: unknown,
  options: BuildPublishedSnapshotOptions,
): NormalizedPublicSiteSnapshot {
  const source = snapshotRecord(value)
  const generatedAt = createPublicSiteContentQueryRequest({
    perspective: 'published',
    now: options.generatedAt,
  }).params.now

  return normalizePublicSiteContent(
    {
      ...source,
      schemaVersion: PUBLIC_CONTENT_SCHEMA_VERSION,
      generatedAt,
    },
    { perspective: 'published' },
  )
}

/** Revalidates before serialization so hand-edited or stale files cannot bypass the boundary. */
export function serializePublishedSnapshot(value: unknown): string {
  const snapshot = normalizePublicSiteContent(value, { perspective: 'published' })
  return `${JSON.stringify(snapshot, null, 2)}\n`
}

/** Parses and fully revalidates the fallback before the public application can use it. */
export function parsePublishedSnapshot(serialized: string): NormalizedPublicSiteSnapshot {
  let parsed: unknown

  try {
    parsed = JSON.parse(serialized)
  } catch (error) {
    throw new SnapshotParseError(error)
  }

  return normalizePublicSiteContent(parsed, { perspective: 'published' })
}

/** Returns operational metadata only; public content and provenance notes stay out of logs. */
export function summarizePublishedSnapshot(value: unknown): PublishedSnapshotSummary {
  const snapshot = normalizePublicSiteContent(value, { perspective: 'published' })

  return {
    schemaVersion: snapshot.schemaVersion,
    generatedAt: snapshot.generatedAt,
    contentRevision: snapshot.contentRevision,
    menuCategoryCount: snapshot.menu.length,
    menuItemCount: snapshot.menu.reduce((count, category) => count + category.items.length, 0),
    announcementCount: snapshot.announcements.length,
    mediaCount: snapshot.media.length,
  }
}

export async function generatePublishedSnapshot(
  options: GeneratePublishedSnapshotOptions,
): Promise<GeneratedPublishedSnapshot> {
  const request = createPublicSiteContentQueryRequest({
    perspective: 'published',
    now: options.now,
  })
  const projectedContent = await options.fetchContent(request)
  const snapshot = buildPublishedSnapshot(projectedContent, {
    generatedAt: request.params.now,
  })

  return {
    snapshot,
    serialized: serializePublishedSnapshot(snapshot),
    summary: summarizePublishedSnapshot(snapshot),
  }
}
