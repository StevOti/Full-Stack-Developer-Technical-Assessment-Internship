import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { ApiError, loginUser } from '../lib/authApi'
import { saveAuthSession } from '../lib/authStorage'

interface LocationState {
  from?: string
}

export default function LoginPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const from = (location.state as LocationState | undefined)?.from ?? '/dashboard'

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const authData = await loginUser({ email, password })
      saveAuthSession(authData)
      navigate(from, { replace: true })
    } catch (submitError) {
      if (submitError instanceof ApiError) {
        setError(submitError.message)
      } else {
        setError('Unable to login right now. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="mx-auto w-full max-w-md rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm sm:p-8">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Access SmartSeason</h1>
      <p className="mt-2 text-sm text-slate-600">Sign in to manage field assignments, stage updates, and operational summaries.</p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <label className="block text-sm font-medium text-slate-700">
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900"
          />
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900"
          />
        </label>

        {error ? <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-full bg-emerald-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <p className="mt-4 text-sm text-slate-600">
        New here?{' '}
        <Link to="/register" className="font-semibold text-emerald-700 hover:text-emerald-800">
          Create an account
        </Link>
      </p>
    </section>
  )
}
