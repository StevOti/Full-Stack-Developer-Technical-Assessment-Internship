import { Link } from 'react-router-dom'

export default function CallToActionSection() {
  return (
    <section className="rounded-3xl border border-emerald-200/70 bg-gradient-to-br from-emerald-50 to-white p-6 sm:p-8 lg:p-10">
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Ready to manage this growing season with confidence?</h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">
            Start with demo credentials or create users, assign fields to agents, and monitor Active, At Risk, and Completed status from one dashboard.
          </p>
        </div>
        <Link to="/contact" className="rounded-full bg-emerald-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800">
          Contact Us
        </Link>
      </div>
    </section>
  )
}
