import { apiPost } from './apiClient'
import type { AuthResponse, LoginRequest, RegisterRequest } from '../types/auth'

export { ApiError } from './apiClient'

export function loginUser(payload: LoginRequest) {
  return apiPost<LoginRequest, AuthResponse>('/api/auth/login/', payload)
}

export function registerUser(payload: RegisterRequest) {
  return apiPost<RegisterRequest, AuthResponse>('/api/auth/register/', payload)
}
