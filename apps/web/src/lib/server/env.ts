import { env as privateEnvironmentSource } from '$env/dynamic/private'
import { env as publicEnvironmentSource } from '$env/dynamic/public'

type EnvironmentSource = Record<string, string | undefined>

export interface PublicEnvironment {
  sanity: {
    projectId: string
    dataset: string
    apiVersion: string
  }
  siteUrl: string
}

export interface ServerEnvironment {
  public: PublicEnvironment
  sanityViewerToken: string | null
}

export interface PreviewEnvironment extends ServerEnvironment {
  sanityViewerToken: string
}

export class EnvironmentConfigurationError extends Error {
  constructor(variableName: string, reason: string) {
    super(`Invalid environment variable ${variableName}: ${reason}`)
    this.name = 'EnvironmentConfigurationError'
  }
}

function readRequired(source: EnvironmentSource, variableName: string): string {
  const value = source[variableName]?.trim()

  if (!value) {
    throw new EnvironmentConfigurationError(variableName, 'a non-empty value is required')
  }

  return value
}

function readSanityProjectId(source: EnvironmentSource): string {
  const projectId = readRequired(source, 'PUBLIC_SANITY_PROJECT_ID')

  if (!/^[a-z0-9]+$/.test(projectId)) {
    throw new EnvironmentConfigurationError(
      'PUBLIC_SANITY_PROJECT_ID',
      'use only lowercase letters and numbers',
    )
  }

  return projectId
}

function readSanityDataset(source: EnvironmentSource): string {
  const dataset = readRequired(source, 'PUBLIC_SANITY_DATASET')

  if (dataset.length > 64 || !/^[A-Za-z0-9][A-Za-z0-9_-]*$/.test(dataset)) {
    throw new EnvironmentConfigurationError(
      'PUBLIC_SANITY_DATASET',
      'start with a letter or number and use at most 64 letters, numbers, underscores, or hyphens',
    )
  }

  return dataset
}

function readSanityApiVersion(source: EnvironmentSource): string {
  const apiVersion = readRequired(source, 'PUBLIC_SANITY_API_VERSION')
  const date = new Date(`${apiVersion}T00:00:00.000Z`)

  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(apiVersion) ||
    Number.isNaN(date.valueOf()) ||
    date.toISOString().slice(0, 10) !== apiVersion
  ) {
    throw new EnvironmentConfigurationError(
      'PUBLIC_SANITY_API_VERSION',
      'use a real calendar date in YYYY-MM-DD format',
    )
  }

  return apiVersion
}

function readSiteUrl(source: EnvironmentSource): string {
  const value = readRequired(source, 'PUBLIC_SITE_URL')
  let siteUrl: URL

  try {
    siteUrl = new URL(value)
  } catch {
    throw new EnvironmentConfigurationError('PUBLIC_SITE_URL', 'use an absolute HTTP(S) URL')
  }

  if (!['http:', 'https:'].includes(siteUrl.protocol)) {
    throw new EnvironmentConfigurationError('PUBLIC_SITE_URL', 'use an HTTP(S) URL')
  }

  if (siteUrl.username || siteUrl.password || siteUrl.search || siteUrl.hash) {
    throw new EnvironmentConfigurationError(
      'PUBLIC_SITE_URL',
      'credentials, query parameters, and fragments are not allowed',
    )
  }

  if (siteUrl.pathname !== '/') {
    throw new EnvironmentConfigurationError('PUBLIC_SITE_URL', 'use the site origin without a path')
  }

  return siteUrl.origin
}

function readViewerToken(source: EnvironmentSource, required: true): string
function readViewerToken(source: EnvironmentSource, required: false): string | null
function readViewerToken(source: EnvironmentSource, required: boolean): string | null {
  const viewerToken = source.SANITY_VIEWER_TOKEN?.trim()

  if (!viewerToken) {
    if (required) {
      throw new EnvironmentConfigurationError(
        'SANITY_VIEWER_TOKEN',
        'a server-only token is required for draft preview',
      )
    }

    return null
  }

  if (/\s/.test(viewerToken)) {
    throw new EnvironmentConfigurationError('SANITY_VIEWER_TOKEN', 'whitespace is not allowed')
  }

  return viewerToken
}

export function loadPublicEnvironment(
  source: EnvironmentSource = publicEnvironmentSource,
): PublicEnvironment {
  return {
    sanity: {
      projectId: readSanityProjectId(source),
      dataset: readSanityDataset(source),
      apiVersion: readSanityApiVersion(source),
    },
    siteUrl: readSiteUrl(source),
  }
}

export function loadServerEnvironment(
  publicSource: EnvironmentSource = publicEnvironmentSource,
  privateSource: EnvironmentSource = privateEnvironmentSource,
): ServerEnvironment {
  return {
    public: loadPublicEnvironment(publicSource),
    sanityViewerToken: readViewerToken(privateSource, false),
  }
}

export function loadPreviewEnvironment(
  publicSource: EnvironmentSource = publicEnvironmentSource,
  privateSource: EnvironmentSource = privateEnvironmentSource,
): PreviewEnvironment {
  return {
    public: loadPublicEnvironment(publicSource),
    sanityViewerToken: readViewerToken(privateSource, true),
  }
}
