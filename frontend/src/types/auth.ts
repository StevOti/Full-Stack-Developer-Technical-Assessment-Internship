export type UserRole = 'admin' | 'agent'

export interface AuthUser {
  id: number
  email: string
  role: UserRole
  first_name: string
  last_name: string
}

export interface AuthResponse {
  access: string
  refresh: string
  user: AuthUser
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  first_name: string
  last_name: string
  role: UserRole
}
