export interface DashboardResponse {
  total_fields: number
  status_breakdown: {
    active: number
    at_risk: number
    completed: number
  }
  stage_breakdown: {
    planted: number
    growing: number
    ready: number
    harvested: number
  }
}
