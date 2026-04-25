export type FieldStage = 'planted' | 'growing' | 'ready' | 'harvested'

export interface FieldRecord {
  id: number
  name: string
  crop_type: string
  planting_date: string
  stage: FieldStage
  assigned_agent: number | null
  notes: string
  updated_at: string
  created_at: string
  status: 'Active' | 'At Risk' | 'Completed'
}

export interface FieldCreatePayload {
  name: string
  crop_type: string
  planting_date: string
  stage: FieldStage
  assigned_agent: number | null
  notes: string
}

export interface FieldUpdatePayload {
  name?: string
  crop_type?: string
  planting_date?: string
  stage?: FieldStage
  assigned_agent?: number | null
  notes?: string
}

export interface AgentUser {
  id: number
  email: string
  first_name: string
  last_name: string
  role: 'agent'
}
