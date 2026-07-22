import type { Handle, HandleServerError, RequestEvent } from '@sveltejs/kit'
import { describe, expect, it, vi } from 'vitest'

import {
  PREVIEW_CACHE_CONTROL,
  createHandle,
  createHandleError,
  type ServerErrorLogRecord,
} from './hooks.server'

function requestEvent(url = 'https://example.test/menu', headers: HeadersInit = {}): RequestEvent {
  return {
    locals: {
      preview: false,
      requestId: '',
    },
    request: new Request(url, { headers }),
    route: { id: '/menu' },
    url: new URL(url),
  } as unknown as RequestEvent
}

describe('createHandle', () => {
  it('adds baseline security headers while preserving public route caching', async () => {
    const event = requestEvent()
    const handle = createHandle({ createRequestId: () => 'request-public' })
    const resolve = vi.fn(
      async () =>
        new Response('public', {
          headers: {
            'cache-control': 'public, max-age=0, s-maxage=60, stale-while-revalidate=300',
          },
        }),
    )

    const response = await handle({ event, resolve })

    expect(event.locals).toEqual({ preview: false, requestId: 'request-public' })
    expect(resolve).toHaveBeenCalledWith(event)
    expect(response.headers.get('cache-control')).toBe(
      'public, max-age=0, s-maxage=60, stale-while-revalidate=300',
    )
    expect(response.headers.get('x-request-id')).toBe('request-public')
    expect(response.headers.get('x-content-type-options')).toBe('nosniff')
    expect(response.headers.get('referrer-policy')).toBe('strict-origin-when-cross-origin')
    expect(response.headers.get('permissions-policy')).toBe(
      'camera=(), microphone=(), geolocation=()',
    )
    expect(response.headers.get('cross-origin-opener-policy')).toBe('same-origin')
  })

  it('makes authenticated preview responses private and uncacheable', async () => {
    const event = requestEvent()
    const handle = createHandle({ createRequestId: () => 'request-preview' })
    const resolve: Parameters<Handle>[0]['resolve'] = async (resolvedEvent) => {
      resolvedEvent.locals.preview = true

      return new Response('preview', {
        headers: {
          'cache-control': 'public, s-maxage=60',
          'cdn-cache-control': 'public, s-maxage=300',
          'surrogate-control': 'max-age=300',
          vary: 'Accept-Encoding, Cookie',
        },
      })
    }

    const response = await handle({ event, resolve })

    expect(response.headers.get('cache-control')).toBe(PREVIEW_CACHE_CONTROL)
    expect(response.headers.get('pragma')).toBe('no-cache')
    expect(response.headers.get('expires')).toBe('0')
    expect(response.headers.get('x-robots-tag')).toBe('noindex, nofollow, noarchive')
    expect(response.headers.get('vary')).toBe('Accept-Encoding, Cookie, Authorization')
    expect(response.headers.has('cdn-cache-control')).toBe(false)
    expect(response.headers.has('surrogate-control')).toBe(false)
  })
})

describe('createHandleError', () => {
  it('returns a calm public error and logs only a safe diagnostic record', () => {
    const records: ServerErrorLogRecord[] = []
    const handleError = createHandleError({
      createRequestId: () => 'request-fallback',
      logError: (record) => records.push(record),
    })
    const event = requestEvent('https://example.test/menu?token=query-secret', {
      authorization: 'Bearer header-secret',
      cookie: 'preview=cookie-secret',
    })
    event.locals.requestId = 'request-existing'

    const publicError = handleError({
      error: new Error('provider-secret-message'),
      event,
      message: 'Internal Error',
      status: 500,
    } as Parameters<HandleServerError>[0])

    expect(publicError).toEqual({
      message: "We couldn't load this page. Please try again in a moment.",
      requestId: 'request-existing',
    })
    expect(records).toEqual([
      {
        errorName: 'Error',
        event: 'request_failed',
        level: 'error',
        method: 'GET',
        path: '/menu',
        requestId: 'request-existing',
        routeId: '/menu',
        status: 500,
      },
    ])

    const serializedRecord = JSON.stringify(records)
    expect(serializedRecord).not.toContain('provider-secret-message')
    expect(serializedRecord).not.toContain('query-secret')
    expect(serializedRecord).not.toContain('header-secret')
    expect(serializedRecord).not.toContain('cookie-secret')
  })

  it('creates a request ID when an error happens before the root handle runs', () => {
    const handleError = createHandleError({
      createRequestId: () => 'request-early-error',
      logError: vi.fn(),
    })
    const event = requestEvent()

    const publicError = handleError({
      error: 'non-error rejection',
      event,
      message: 'Internal Error',
      status: 500,
    } as Parameters<HandleServerError>[0])

    expect(publicError).toMatchObject({ requestId: 'request-early-error' })
    expect(event.locals.requestId).toBe('request-early-error')
  })
})
