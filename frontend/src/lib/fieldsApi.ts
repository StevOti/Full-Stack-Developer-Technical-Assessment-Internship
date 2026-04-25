import { apiDelete, apiGet, apiPatch, apiPost } from './apiClient'
import type { AgentUser, FieldCreatePayload, FieldRecord, FieldUpdatePayload } from '../types/field'

export function fetchFields() {
  return apiGet<FieldRecord[]>('/api/fields/')
}

export function fetchField(fieldId: number) {
  return apiGet<FieldRecord>(`/api/fields/${fieldId}/`)
}

export function createField(payload: FieldCreatePayload) {
  return apiPost<FieldCreatePayload, FieldRecord>('/api/fields/', payload)
}

export function updateField(fieldId: number, payload: FieldUpdatePayload) {
  return apiPatch<FieldUpdatePayload, FieldRecord>(`/api/fields/${fieldId}/`, payload)
}

export function deleteField(fieldId: number) {
  return apiDelete(`/api/fields/${fieldId}/`)
}

export function fetchAgentUsers() {
  return apiGet<AgentUser[]>('/api/users/?role=agent')
}
