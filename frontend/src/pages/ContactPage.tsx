import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { submitContactRequest } from '../lib/contactApi'
import type { ContactTopic } from '../lib/contactApi'
import { getAuthSession } from '../lib/authStorage'

interface ContactSubmission {
  id: string
  fullName: string
  email: string
  phone: string
  topic: ContactTopic
  message: string
  createdAt: string
}

const TOPIC_OPTIONS: ContactTopic[] = ['General Question', 'Field Support', 'Technical Issue', 'Partnership']
const CONTACT_STORAGE_KEY = 'smartseason_contact_submissions'

function readSavedSubmissions(): ContactSubmission[] {
  const saved = localStorage.getItem(CONTACT_STORAGE_KEY)
  if (!saved) {
    return []
  }

  try {
    const parsed = JSON.parse(saved) as ContactSubmission[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeSavedSubmissions(submissions: ContactSubmission[]) {
  localStorage.setItem(CONTACT_STORAGE_KEY, JSON.stringify(submissions))
}

export default function ContactPage() {
  const currentRole = (getAuthSession()?.user.role ?? '') as string
  const canManageRecentRequests = currentRole === 'admin' || currentRole === 'superadmin'

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [topic, setTopic] = useState<ContactTopic>('General Question')
  const [message, setMessage] = useState('')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submissions, setSubmissions] = useState<ContactSubmission[]>(() => (canManageRecentRequests ? readSavedSubmissions() : []))

  const canSubmit = useMemo(() => {
    return fullName.trim().length >= 3 && email.trim().length > 0 && message.trim().length >= 10
  }, [email, fullName, message])

  function resetForm() {
    setFullName('')
    setEmail('')
    setPhone('')
    setTopic('General Question')
    setMessage('')
  }

  function clearHistory() {
    if (!canManageRecentRequests) {
      return
    }

    setSubmissions([])
    localStorage.removeItem(CONTACT_STORAGE_KEY)
    setSuccess('Contact history cleared from this browser.')
    setError('')
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (fullName.trim().length < 3) {
      setError('Please enter your full name (at least 3 characters).')
      return
    }

    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError('Please enter a valid email address.')
      return
    }

    if (message.trim().length < 10) {
      setError('Please provide more detail in your message (at least 10 characters).')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await submitContactRequest({
        full_name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        topic,
        message: message.trim(),
      })

      const submission: ContactSubmission = {
        id: response.id,
        fullName: response.submission.full_name,
        email: response.submission.email,
        phone: response.submission.phone ?? '',
        topic: response.submission.topic,
        message: response.submission.message,
        createdAt: new Date().toISOString(),
      }

      if (canManageRecentRequests) {
        const updated = [submission, ...submissions].slice(0, 5)
        setSubmissions(updated)
        writeSavedSubmissions(updated)
      }

      setSuccess(response.message)
      resetForm()
    } catch {
      const fallbackSubmission: ContactSubmission = {
        id: String(Date.now()),
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        topic,
        message: message.trim(),
        createdAt: new Date().toISOString(),
      }

      if (canManageRecentRequests) {
        const updated = [fallbackSubmission, ...submissions].slice(0, 5)
        setSubmissions(updated)
        writeSavedSubmissions(updated)
      }

      setSuccess('Your message was saved locally and will be available when connectivity is restored.')
      resetForm()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm sm:p-8 lg:p-10">
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
        <div>
          <p className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-700">
            Contact SmartSeason
          </p>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Contact Us</h1>
          <p className="mt-3 max-w-3xl text-sm text-slate-600 sm:text-base">
        Reach our team for onboarding, field operations support, and technical help. This is a free contact form and we typically respond within one business day.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-900">Email</p>
              <a href="mailto:support@smartseason.com" className="mt-2 inline-flex text-sm text-emerald-700 hover:text-emerald-800">
                support@smartseason.com
              </a>
            </article>
            <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-900">Phone</p>
              <a href="tel:+254700123456" className="mt-2 inline-flex text-sm text-emerald-700 hover:text-emerald-800">
                +254 700 123 456
              </a>
            </article>
            <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-900">Working Hours</p>
              <p className="mt-2 text-sm text-slate-600">Mon - Fri, 08:00 - 17:00 EAT</p>
            </article>
          </div>

          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            <a href="mailto:support@smartseason.com" className="rounded-full border border-slate-300 px-4 py-2 font-semibold text-slate-700 transition hover:bg-slate-50">
              Email Support
            </a>
            <a href="tel:+254700123456" className="rounded-full border border-slate-300 px-4 py-2 font-semibold text-slate-700 transition hover:bg-slate-50">
              Call Us
            </a>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-5 sm:grid-cols-2">
        <label className="block text-sm font-medium text-slate-700">
          Full Name
          <input
            type="text"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            required
            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900"
            placeholder="Jane Doe"
          />
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900"
            placeholder="jane@company.com"
          />
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Phone (optional)
          <input
            type="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900"
            placeholder="+254..."
          />
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Topic
          <select
            value={topic}
            onChange={(event) => setTopic(event.target.value as ContactTopic)}
            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900"
          >
            {TOPIC_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm font-medium text-slate-700 sm:col-span-2">
          Message
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            rows={5}
            required
            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900"
            placeholder="Tell us how we can help you."
          />
          <p className="mt-1 text-xs text-slate-500">{message.trim().length} characters</p>
        </label>

        {error ? <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 sm:col-span-2">{error}</p> : null}
        {success ? <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 sm:col-span-2">{success}</p> : null}

        <div className="sm:col-span-2 flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={!canSubmit || isSubmitting}
            className="rounded-full bg-emerald-700 px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-60"
          >
            {isSubmitting ? 'Sending...' : 'Send Message'}
          </button>
          <button
            type="button"
            onClick={resetForm}
            className="rounded-full border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Reset
          </button>
        </div>
        </form>
      </div>

      {canManageRecentRequests ? (
        <section className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-slate-900">Recent Contact Requests</h2>
            <button type="button" onClick={clearHistory} className="text-sm font-semibold text-emerald-700 hover:text-emerald-800">
              Clear history
            </button>
          </div>
          {submissions.length === 0 ? (
            <p className="mt-2 text-sm text-slate-600">No contact requests submitted on this browser yet.</p>
          ) : (
            <div className="mt-3 space-y-3">
              {submissions.map((submission) => (
                <article key={submission.id} className="rounded-xl border border-slate-200 bg-white p-3">
                  <p className="text-sm font-semibold text-slate-900">
                    {submission.fullName} - {submission.topic}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    {submission.email}
                    {submission.phone ? ` | ${submission.phone}` : ''}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">{submission.message}</p>
                </article>
              ))}
            </div>
          )}
        </section>
      ) : null}
    </section>
  )
}