import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { ApiError } from '../lib/apiClient'
import { deleteField, fetchAgentUsers, fetchField, updateField } from '../lib/fieldsApi'
import { clearAuthSession, getAuthSession } from '../lib/authStorage'
import type { AgentUser, FieldRecord, FieldStage, FieldUpdatePayload } from '../types/field'

const STAGE_OPTIONS: FieldStage[] = ['planted', 'growing', 'ready', 'harvested']

function formatStageLabel(stage: FieldStage) {
  return stage.charAt(0).toUpperCase() + stage.slice(1)
}

export default function FieldDetailPage() {
  const { fieldId } = useParams()
  const navigate = useNavigate()
  const session = getAuthSession()
  const isAdmin = session?.user.role === 'admin'
  const parsedFieldId = Number(fieldId)

  const [field, setField] = useState<FieldRecord | null>(null)
  const [agents, setAgents] = useState<AgentUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [name, setName] = useState('')
  const [cropType, setCropType] = useState('')
  const [plantingDate, setPlantingDate] = useState('')
  const [stage, setStage] = useState<FieldStage>('planted')
  const [assignedAgent, setAssignedAgent] = useState<string>('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (!Number.isFinite(parsedFieldId) || parsedFieldId <= 0) {
      navigate('/dashboard', { replace: true })
      return
    }

    let isMounted = true

    async function loadField() {
      try {
        setIsLoading(true)
        setError('')
        const [fieldResponse, agentsResponse] = await Promise.all([
          fetchField(parsedFieldId),
          isAdmin ? fetchAgentUsers() : Promise.resolve([]),
        ])

        if (!isMounted) {
          return
        }

        setField(fieldResponse)
        setName(fieldResponse.name)
        setCropType(fieldResponse.crop_type)
        setPlantingDate(fieldResponse.planting_date)
        setStage(fieldResponse.stage)
        setAssignedAgent(fieldResponse.assigned_agent ? String(fieldResponse.assigned_agent) : '')
        setNotes(fieldResponse.notes)
        setAgents(agentsResponse)
      } catch (loadError) {
        if (!isMounted) {
          return
        }

        if (loadError instanceof ApiError && loadError.status === 401) {
          clearAuthSession()
          navigate('/login', { replace: true })
          return
        }

        setError(loadError instanceof Error ? loadError.message : 'Unable to load field details.')
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadField()

    return () => {
      isMounted = false
    }
  }, [isAdmin, navigate, parsedFieldId])

  async function handleUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!field) {
      return
    }

    setIsSubmitting(true)
    setError('')
    setSuccessMessage('')

    const payload: FieldUpdatePayload = {
      stage,
      notes,
    }

    if (isAdmin) {
      payload.name = name
      payload.crop_type = cropType
      payload.planting_date = plantingDate
      payload.assigned_agent = assignedAgent ? Number(assignedAgent) : null
    }

    try {
      const updated = await updateField(field.id, payload)
      setField(updated)
      setSuccessMessage('Field updated successfully.')
    } catch (updateError) {
      if (updateError instanceof ApiError && updateError.status === 401) {
        clearAuthSession()
        navigate('/login', { replace: true })
        return
      }

      setError(updateError instanceof Error ? updateError.message : 'Unable to update this field.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!field || !isAdmin) {
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      await deleteField(field.id)
      navigate('/dashboard', { replace: true })
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Unable to delete this field.')
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm sm:p-8 lg:p-10">
        <p className="text-sm text-slate-600">Loading field...</p>
      </section>
    )
  }

  if (!field) {
    return (
      <section className="rounded-3xl border border-red-200 bg-red-50 p-6 shadow-sm sm:p-8 lg:p-10">
        <h1 className="text-2xl font-semibold text-red-900">Field not found</h1>
        <Link to="/dashboard" className="mt-3 inline-flex text-sm font-semibold text-emerald-700">
          Back to dashboard
        </Link>
      </section>
    )
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm sm:p-8 lg:p-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Field Details: {field.name}</h1>
        <Link to="/dashboard" className="text-sm font-semibold text-emerald-700 hover:text-emerald-800">
          Back to dashboard
        </Link>
      </div>

      <p className="mt-2 text-sm text-slate-600">Status: {field.status}</p>

      {error ? <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
      {successMessage ? <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{successMessage}</p> : null}

      <form className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2" onSubmit={handleUpdate}>
        <label className="block text-sm font-medium text-slate-700">
          Name
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            disabled={!isAdmin}
            required
            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 disabled:bg-slate-100"
          />
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Crop type
          <input
            type="text"
            value={cropType}
            onChange={(event) => setCropType(event.target.value)}
            disabled={!isAdmin}
            required
            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 disabled:bg-slate-100"
          />
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Planting date
          <input
            type="date"
            value={plantingDate}
            onChange={(event) => setPlantingDate(event.target.value)}
            disabled={!isAdmin}
            required
            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 disabled:bg-slate-100"
          />
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Stage
          <select
            value={stage}
            onChange={(event) => setStage(event.target.value as FieldStage)}
            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900"
          >
            {STAGE_OPTIONS.map((stageValue) => (
              <option key={stageValue} value={stageValue}>
                {formatStageLabel(stageValue)}
              </option>
            ))}
          </select>
        </label>

        {isAdmin ? (
          <label className="block text-sm font-medium text-slate-700 sm:col-span-2">
            Assigned agent
            <select
              value={assignedAgent}
              onChange={(event) => setAssignedAgent(event.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900"
            >
              <option value="">Unassigned</option>
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.first_name || agent.last_name ? `${agent.first_name} ${agent.last_name}`.trim() : agent.email}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        <label className="block text-sm font-medium text-slate-700 sm:col-span-2">
          Notes
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={4}
            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900"
          />
        </label>

        <div className="sm:col-span-2 flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-full bg-emerald-700 px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-60"
          >
            {isSubmitting ? 'Saving...' : 'Save changes'}
          </button>
          {isAdmin ? (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isSubmitting}
              className="rounded-full border border-red-300 px-5 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-60"
            >
              Delete field
            </button>
          ) : null}
        </div>
      </form>
    </section>
  )
}
