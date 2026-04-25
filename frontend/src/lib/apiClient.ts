import { clearAuthSession, getAuthSession, getRefreshToken, updateAccessToken } from './authStorage'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000'

class ApiError extends Error {
  status: number
  details: unknown

  constructor(message: string, status: number, details: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

function stringifyErrors(payload: unknown): string {
  if (!payload || typeof payload !== 'object') {
    return 'Request failed. Please try again.'
  }

  const record = payload as Record<string, unknown>

  if (typeof record.detail === 'string') {
    return record.detail
  }

  const firstEntry = Object.entries(record)[0]
  if (!firstEntry) {
    return 'Request failed. Please try again.'
  }

  const [, value] = firstEntry
  if (typeof value === 'string') {
    return value
  }

  if (Array.isArray(value) && typeof value[0] === 'string') {
    return value[0]
  }

  return 'Request failed. Please check your input.'
}

function buildHeaders(headers: HeadersInit | undefined, isJsonPayload: boolean, token?: string) {
  const nextHeaders = new Headers(headers)

  if (isJsonPayload) {
    nextHeaders.set('Content-Type', 'application/json')
  }

  if (token) {
    nextHeaders.set('Authorization', `Bearer ${token}`)
  }

  return nextHeaders
}

async function refreshAccessToken() {
  const refreshToken = getRefreshToken()
  if (!refreshToken) {
    return null
  }

  const response = await fetch(`${API_BASE_URL}/api/auth/refresh/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refresh: refreshToken }),
  })

  const responseData = await response.json().catch(() => ({}))

  if (!response.ok || typeof responseData.access !== 'string') {
    clearAuthSession()
    return null
  }

  updateAccessToken(responseData.access)
  return responseData.access as string
}

export async function apiRequest<TResponse>(path: string, options: RequestInit = {}, retryOnAuthFailure = true) {
  const accessToken = getAuthSession()?.accessToken
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: buildHeaders(options.headers, Boolean(options.body), accessToken),
  })

  const responseData = await response.json().catch(() => ({}))

  if (response.status === 401 && retryOnAuthFailure) {
    const newToken = await refreshAccessToken()
    if (newToken) {
      return apiRequest<TResponse>(path, options, false)
    }
  }

  if (!response.ok) {
    throw new ApiError(stringifyErrors(responseData), response.status, responseData)
  }

  return responseData as TResponse
}

export async function apiGet<TResponse>(path: string) {
  return apiRequest<TResponse>(path, { method: 'GET' })
}

export async function apiPost<TPayload, TResponse>(path: string, payload: TPayload) {
  return apiRequest<TResponse>(path, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function apiPatch<TPayload, TResponse>(path: string, payload: TPayload) {
  return apiRequest<TResponse>(path, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export async function apiDelete(path: string) {
  return apiRequest<Record<string, never>>(path, {
    method: 'DELETE',
  })
}

export { ApiError }
