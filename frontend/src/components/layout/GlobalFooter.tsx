import { Link } from 'react-router-dom'

export default function GlobalFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white/80">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-8 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <p className="text-sm text-slate-600">© {new Date().getFullYear()} SmartSeason. All rights reserved.</p>
        <div className="flex flex-wrap gap-4 text-sm text-slate-600">
          <Link to="/" className="transition hover:text-slate-900">
            Home
          </Link>
          <Link to="/dashboard" className="transition hover:text-slate-900">
            Dashboard
          </Link>
          <Link to="/contact" className="transition hover:text-slate-900">
            Contact Us
          </Link>
        </div>
      </div>
    </footer>
  )
}
