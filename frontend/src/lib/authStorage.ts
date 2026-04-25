import type { AuthResponse } from '../types/auth'

const ACCESS_TOKEN_KEY = 'smartseason_access_token'
const REFRESH_TOKEN_KEY = 'smartseason_refresh_token'
const USER_KEY = 'smartseason_user'

export function saveAuthSession(payload: AuthResponse) {
  localStorage.setItem(ACCESS_TOKEN_KEY, payload.access)
  localStorage.setItem(REFRESH_TOKEN_KEY, payload.refresh)
  localStorage.setItem(USER_KEY, JSON.stringify(payload.user))
}

export function updateAccessToken(accessToken: string) {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
}

export function clearAuthSession() {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export function getAuthSession() {
  const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY)
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)
  const userRaw = localStorage.getItem(USER_KEY)

  if (!accessToken || !refreshToken || !userRaw) {
    return null
  }

  try {
    const user = JSON.parse(userRaw) as AuthResponse['user']

    return {
      accessToken,
      refreshToken,
      user,
    }
  } catch {
    clearAuthSession()
    return null
  }
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

export function hasActiveSession() {
  return Boolean(getAuthSession()?.accessToken)
}
