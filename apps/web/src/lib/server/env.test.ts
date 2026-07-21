import { describe, expect, it, vi } from 'vitest'

vi.mock('$env/dynamic/public', () => ({ env: {} }))
vi.mock('$env/dynamic/private', () => ({ env: {} }))

import { loadPreviewEnvironment, loadPublicEnvironment, loadServerEnvironment } from './env'

const validPublicEnvironment = {
  PUBLIC_SANITY_PROJECT_ID: 'w6vleqf7',
  PUBLIC_SANITY_DATASET: 'development',
  PUBLIC_SANITY_API_VERSION: '2026-07-21',
  PUBLIC_SITE_URL: 'http://localhost:5173/',
}

describe('loadPublicEnvironment', () => {
  it('normalizes browser-safe configuration', () => {
    expect(loadPublicEnvironment(validPublicEnvironment)).toEqual({
      sanity: {
        projectId: 'w6vleqf7',
        dataset: 'development',
        apiVersion: '2026-07-21',
      },
      siteUrl: 'http://localhost:5173',
    })
  })

  it.each([
    ['PUBLIC_SANITY_PROJECT_ID', { ...validPublicEnvironment, PUBLIC_SANITY_PROJECT_ID: 'Bad ID' }],
    ['PUBLIC_SANITY_DATASET', { ...validPublicEnvironment, PUBLIC_SANITY_DATASET: '-invalid' }],
    [
      'PUBLIC_SANITY_API_VERSION',
      { ...validPublicEnvironment, PUBLIC_SANITY_API_VERSION: '2026-02-30' },
    ],
    ['PUBLIC_SITE_URL', { ...validPublicEnvironment, PUBLIC_SITE_URL: 'ftp://example.com' }],
  ])('rejects invalid %s values', (variableName, source) => {
    expect(() => loadPublicEnvironment(source)).toThrowError(
      new RegExp(`Invalid environment variable ${variableName}`),
    )
  })

  it('does not expose server-only values', () => {
    const publicEnvironment = loadPublicEnvironment({
      ...validPublicEnvironment,
      SANITY_VIEWER_TOKEN: 'server-only-secret',
    })

    expect(publicEnvironment).not.toHaveProperty('sanityViewerToken')
    expect(JSON.stringify(publicEnvironment)).not.toContain('server-only-secret')
  })
})

describe('server environment', () => {
  it('allows ordinary server rendering without a preview token', () => {
    expect(loadServerEnvironment(validPublicEnvironment, {}).sanityViewerToken).toBeNull()
  })

  it('requires the viewer token only for authenticated preview', () => {
    expect(() => loadPreviewEnvironment(validPublicEnvironment, {})).toThrowError(
      /SANITY_VIEWER_TOKEN/,
    )

    expect(
      loadPreviewEnvironment(validPublicEnvironment, {
        SANITY_VIEWER_TOKEN: 'sanity-preview-token',
      }).sanityViewerToken,
    ).toBe('sanity-preview-token')
  })
})
