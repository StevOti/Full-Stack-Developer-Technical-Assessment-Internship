import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <section className="mx-auto w-full max-w-2xl rounded-3xl border border-slate-200 bg-white/90 p-6 text-center shadow-sm sm:p-8">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">404</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">SmartSeason page not found</h1>
      <p className="mt-3 text-sm text-slate-600 sm:text-base">The requested route is not available in the current field monitoring workflow.</p>
      <Link to="/" className="mt-6 inline-flex rounded-full bg-emerald-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800">
        Back to SmartSeason home
      </Link>
    </section>
  )
}
