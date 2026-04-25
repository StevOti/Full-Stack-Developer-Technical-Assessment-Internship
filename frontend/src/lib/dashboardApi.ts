import { apiGet } from './apiClient'
import type { DashboardResponse } from '../types/dashboard'

export function fetchDashboard() {
  return apiGet<DashboardResponse>('/api/dashboard/')
}
