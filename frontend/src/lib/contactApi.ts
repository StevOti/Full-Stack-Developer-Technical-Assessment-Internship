import { apiPost } from './apiClient'

export type ContactTopic = 'General Question' | 'Field Support' | 'Technical Issue' | 'Partnership'

export interface ContactRequest {
  full_name: string
  email: string
  phone?: string
  topic: ContactTopic
  message: string
}

export interface ContactResponse {
  id: string
  message: string
  submission: ContactRequest
}

export function submitContactRequest(payload: ContactRequest) {
  return apiPost<ContactRequest, ContactResponse>('/api/contact/', payload)
}