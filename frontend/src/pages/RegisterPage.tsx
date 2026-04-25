import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { ApiError, registerUser } from '../lib/authApi'
import { saveAuthSession } from '../lib/authStorage'
import type { UserRole } from '../types/auth'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<UserRole>('agent')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const authData = await registerUser({
        first_name: firstName,
        last_name: lastName,
        email,
        password,
        role,
      })
      saveAuthSession(authData)
      navigate('/dashboard', { replace: true })
    } catch (submitError) {
      if (submitError instanceof ApiError) {
        setError(submitError.message)
      } else {
        setError('Unable to register right now. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="mx-auto w-full max-w-lg rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm sm:p-8">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Create SmartSeason account</h1>
      <p className="mt-2 text-sm text-slate-600">Register an admin or field agent profile to start tracking fields and updates.</p>

      <form className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
        <label className="block text-sm font-medium text-slate-700">
          First name
          <input
            type="text"
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
            required
            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900"
          />
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Last name
          <input
            type="text"
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
            required
            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900"
          />
        </label>

        <label className="block text-sm font-medium text-slate-700 sm:col-span-2">
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900"
          />
        </label>

        <label className="block text-sm font-medium text-slate-700 sm:col-span-2">
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={8}
            required
            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900"
          />
        </label>

        <label className="block text-sm font-medium text-slate-700 sm:col-span-2">
          Role
          <select
            value={role}
            onChange={(event) => setRole(event.target.value as UserRole)}
            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900"
          >
            <option value="agent">Field Agent</option>
            <option value="admin">Admin</option>
          </select>
        </label>

        {error ? <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 sm:col-span-2">{error}</p> : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="sm:col-span-2 w-full rounded-full bg-emerald-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <p className="mt-4 text-sm text-slate-600">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-emerald-700 hover:text-emerald-800">
          Login
        </Link>
      </p>
    </section>
  )
}
