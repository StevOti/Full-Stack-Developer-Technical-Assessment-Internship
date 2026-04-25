import { Link } from 'react-router-dom'

export default function HeroSection() {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm sm:p-8 lg:p-10">
      <p className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-700">
        SmartSeason Field Monitoring
      </p>
      <h1 className="mt-5 max-w-4xl text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
        Coordinate Every Field From Planting To Harvest With Role-Based Visibility
      </h1>
      <p className="mt-4 max-w-3xl text-sm text-slate-600 sm:text-base lg:text-lg">
        SmartSeason helps Admins assign fields, monitor progress, and identify risk early, while Field Agents update stage and notes only for their assigned plots.
      </p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Link to="/register" className="rounded-full bg-emerald-700 px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-emerald-800">
          Create SmartSeason Account
        </Link>
        <Link to="/login" className="rounded-full border border-slate-300 bg-white px-6 py-3 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
          Login To Dashboard
        </Link>
      </div>
    </section>
  )
}
