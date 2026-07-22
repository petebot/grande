import type { Handle, HandleServerError } from '@sveltejs/kit'

export const PREVIEW_CACHE_CONTROL = 'private, no-store, max-age=0'

const PUBLIC_ERROR_MESSAGE = "We couldn't load this page. Please try again in a moment."

const SECURITY_HEADERS = {
  'cross-origin-opener-policy': 'same-origin',
  'permissions-policy': 'camera=(), microphone=(), geolocation=()',
  'referrer-policy': 'strict-origin-when-cross-origin',
  'x-content-type-options': 'nosniff',
  'x-dns-prefetch-control': 'off',
} as const

export interface ServerErrorLogRecord {
  errorName: string
  event: 'request_failed'
  level: 'error'
  method: string
  path: string
  requestId: string
  routeId: string | null
  status: number
}

interface HandleDependencies {
  createRequestId?: () => string
}

interface HandleErrorDependencies extends HandleDependencies {
  logError?: (record: ServerErrorLogRecord) => void
}

function defaultRequestId(): string {
  return globalThis.crypto.randomUUID()
}

function mutableResponse(response: Response): Response {
  return new Response(response.body, {
    headers: new Headers(response.headers),
    status: response.status,
    statusText: response.statusText,
  })
}

function appendVary(headers: Headers, names: string[]): void {
  const values = (headers.get('vary') ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
  const normalizedValues = new Set(values.map((value) => value.toLowerCase()))

  for (const name of names) {
    if (!normalizedValues.has(name.toLowerCase())) {
      values.push(name)
      normalizedValues.add(name.toLowerCase())
    }
  }

  headers.set('vary', values.join(', '))
}

function applyPreviewIsolation(headers: Headers): void {
  headers.set('cache-control', PREVIEW_CACHE_CONTROL)
  headers.delete('cdn-cache-control')
  headers.delete('surrogate-control')
  headers.set('expires', '0')
  headers.set('pragma', 'no-cache')
  headers.set('x-robots-tag', 'noindex, nofollow, noarchive')
  appendVary(headers, ['Cookie', 'Authorization'])
}

export function createHandle({
  createRequestId = defaultRequestId,
}: HandleDependencies = {}): Handle {
  return async ({ event, resolve }) => {
    event.locals.preview = false
    event.locals.requestId = createRequestId()

    const response = mutableResponse(await resolve(event))

    for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
      response.headers.set(name, value)
    }
    response.headers.set('x-request-id', event.locals.requestId)

    if (event.locals.preview) {
      applyPreviewIsolation(response.headers)
    }

    return response
  }
}

export function createHandleError({
  createRequestId = defaultRequestId,
  logError = (record) => console.error(JSON.stringify(record)),
}: HandleErrorDependencies = {}): HandleServerError {
  return ({ error, event, status }) => {
    const requestId = event.locals.requestId || createRequestId()
    event.locals.requestId = requestId

    logError({
      errorName: error instanceof Error ? error.name : 'NonErrorRejection',
      event: 'request_failed',
      level: 'error',
      method: event.request.method,
      path: event.url.pathname,
      requestId,
      routeId: event.route.id,
      status,
    })

    return {
      message: PUBLIC_ERROR_MESSAGE,
      requestId,
    }
  }
}

export const handle = createHandle()
export const handleError = createHandleError()
