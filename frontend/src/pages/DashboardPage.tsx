import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { ApiError } from '../lib/apiClient'
import { fetchDashboard } from '../lib/dashboardApi'
import { createField, fetchAgentUsers, fetchFields } from '../lib/fieldsApi'
import { clearAuthSession, getAuthSession } from '../lib/authStorage'
import type { DashboardResponse } from '../types/dashboard'
import type { AgentUser, FieldRecord, FieldStage } from '../types/field'

const STAGE_OPTIONS: FieldStage[] = ['planted', 'growing', 'ready', 'harvested']

function formatStageLabel(stage: FieldStage) {
  return stage.charAt(0).toUpperCase() + stage.slice(1)
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const session = getAuthSession()
  const isAdmin = session?.user.role === 'admin'

  const storedFirstName = session?.user.first_name?.trim() ?? ''
  const emailFirstChunk = session?.user.email?.split('@')[0]?.trim() ?? ''
  const derivedFirstName = emailFirstChunk ? emailFirstChunk.charAt(0).toUpperCase() + emailFirstChunk.slice(1) : ''
  const displayFirstName = storedFirstName && storedFirstName.toLowerCase() !== 'demo' ? storedFirstName : derivedFirstName || 'User'

  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null)
  const [fields, setFields] = useState<FieldRecord[]>([])
  const [agents, setAgents] = useState<AgentUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [name, setName] = useState('')
  const [cropType, setCropType] = useState('')
  const [plantingDate, setPlantingDate] = useState('')
  const [stage, setStage] = useState<FieldStage>('planted')
  const [assignedAgent, setAssignedAgent] = useState('')
  const [notes, setNotes] = useState('')

  const fieldsById = useMemo(() => {
    return new Map(fields.map((field) => [field.id, field]))
  }, [fields])

  useEffect(() => {
    let isMounted = true

    async function loadDashboard() {
      try {
        setIsLoading(true)
        setError('')
        const [dashboardResponse, fieldsResponse, agentsResponse] = await Promise.all([
          fetchDashboard(),
          fetchFields(),
          isAdmin ? fetchAgentUsers() : Promise.resolve([]),
        ])

        if (isMounted) {
          setDashboardData(dashboardResponse)
          setFields(fieldsResponse)
          setAgents(agentsResponse)
        }
      } catch (fetchError) {
        if (!isMounted) {
          return
        }

        if (fetchError instanceof ApiError && fetchError.status === 401) {
          clearAuthSession()
          navigate('/login', { replace: true })
          return
        }

        setError(fetchError instanceof Error ? fetchError.message : 'Unable to load dashboard data.')
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadDashboard()

    return () => {
      isMounted = false
    }
  }, [isAdmin, navigate])

  async function handleCreateField(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!isAdmin) {
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const created = await createField({
        name,
        crop_type: cropType,
        planting_date: plantingDate,
        stage,
        assigned_agent: assignedAgent ? Number(assignedAgent) : null,
        notes,
      })

      const [dashboardResponse, fieldsResponse] = await Promise.all([fetchDashboard(), fetchFields()])
      setDashboardData(dashboardResponse)
      setFields(fieldsResponse)

      setName('')
      setCropType('')
      setPlantingDate('')
      setStage('planted')
      setAssignedAgent('')
      setNotes('')

      navigate(`/fields/${created.id}`)
    } catch (submitError) {
      if (submitError instanceof ApiError && submitError.status === 401) {
        clearAuthSession()
        navigate('/login', { replace: true })
        return
      }

      setError(submitError instanceof Error ? submitError.message : 'Unable to create field.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm sm:p-8 lg:p-10">
        <p className="text-sm text-slate-600">Loading dashboard...</p>
      </section>
    )
  }

  if (error) {
    return (
      <section className="rounded-3xl border border-red-200 bg-red-50 p-6 shadow-sm sm:p-8 lg:p-10">
        <h1 className="text-2xl font-semibold tracking-tight text-red-900">Dashboard unavailable</h1>
        <p className="mt-2 text-sm text-red-700">{error}</p>
      </section>
    )
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm sm:p-8 lg:p-10">
      <p className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-700">
        Operations Dashboard
      </p>
      <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Welcome back, {displayFirstName}</h1>
      <p className="mt-3 max-w-3xl text-sm text-slate-600 sm:text-base">
        You are logged in as <span className="font-semibold capitalize text-slate-800">{session?.user.role || 'agent'}</span>. This dashboard summarizes your permitted field operations and live monitoring data.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <h2 className="text-base font-semibold text-slate-900">Access Scope</h2>
          <p className="mt-1 text-sm text-slate-600">Role permissions are enforced by the backend on every field and dashboard request.</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <h2 className="text-base font-semibold text-slate-900">Operational Focus</h2>
          <p className="mt-1 text-sm text-slate-600">Track stage updates, notes, and assignment progress from one place.</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <h2 className="text-base font-semibold text-slate-900">Total Fields</h2>
          <p className="mt-1 text-3xl font-semibold text-emerald-700">{dashboardData?.total_fields ?? 0}</p>
        </article>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <h2 className="text-base font-semibold text-slate-900">Status Breakdown</h2>
          <div className="mt-3 space-y-2 text-sm text-slate-600">
            <p>Active: {dashboardData?.status_breakdown.active ?? 0}</p>
            <p>At Risk: {dashboardData?.status_breakdown.at_risk ?? 0}</p>
            <p>Completed: {dashboardData?.status_breakdown.completed ?? 0}</p>
          </div>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <h2 className="text-base font-semibold text-slate-900">Stage Breakdown</h2>
          <div className="mt-3 space-y-2 text-sm text-slate-600">
            <p>Planted: {dashboardData?.stage_breakdown.planted ?? 0}</p>
            <p>Growing: {dashboardData?.stage_breakdown.growing ?? 0}</p>
            <p>Ready: {dashboardData?.stage_breakdown.ready ?? 0}</p>
            <p>Harvested: {dashboardData?.stage_breakdown.harvested ?? 0}</p>
          </div>
        </article>
      </div>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900">Fields</h2>
          <p className="text-sm text-slate-600">{fields.length} items</p>
        </div>

        {fields.length === 0 ? (
          <p className="mt-3 text-sm text-slate-600">No fields available yet.</p>
        ) : (
          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
            {fields.map((field) => (
              <Link
                key={field.id}
                to={`/fields/${field.id}`}
                className="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-emerald-300"
              >
                <p className="text-sm font-semibold text-slate-900">{field.name}</p>
                <p className="mt-1 text-sm text-slate-600">{field.crop_type}</p>
                <p className="mt-2 text-xs text-slate-500">Stage: {formatStageLabel(field.stage)}</p>
                <p className="text-xs text-slate-500">Status: {fieldsById.get(field.id)?.status}</p>
              </Link>
            ))}
          </div>
        )}
      </section>

      {isAdmin ? (
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
          <h2 className="text-lg font-semibold text-slate-900">Create New Field</h2>
          <form className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2" onSubmit={handleCreateField}>
            <label className="block text-sm font-medium text-slate-700">
              Name
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Crop type
              <input
                type="text"
                value={cropType}
                onChange={(event) => setCropType(event.target.value)}
                required
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Planting date
              <input
                type="date"
                value={plantingDate}
                onChange={(event) => setPlantingDate(event.target.value)}
                required
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900"
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
            <label className="block text-sm font-medium text-slate-700 sm:col-span-2">
              Notes
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={3}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900"
              />
            </label>
            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-full bg-emerald-700 px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-60"
              >
                {isSubmitting ? 'Creating...' : 'Create field'}
              </button>
            </div>
          </form>
        </section>
      ) : null}
    </section>
  )
}
