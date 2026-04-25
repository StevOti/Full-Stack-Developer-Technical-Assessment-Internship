import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'

const NAV_ITEMS = [
  { label: 'Home', to: '/' },
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'Contact', to: '/contact' },
]

interface GlobalNavbarProps {
  isAuthenticated: boolean
  onLogout: () => void
}

export default function GlobalNavbar({ isAuthenticated, onLogout }: GlobalNavbarProps) {
  const [isOpen, setIsOpen] = useState(false)

  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition ${isActive ? 'text-slate-900' : 'text-slate-600 hover:text-slate-900'}`

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex w-full max-w-6xl items-center px-4 py-3 sm:px-6 lg:px-8" aria-label="Main navigation">
        <Link to="/" className="text-lg font-semibold tracking-tight text-slate-900" onClick={() => setIsOpen(false)}>
          SmartSeason
        </Link>

        <div className="ml-auto hidden items-center gap-6 md:flex">
          <ul className="flex items-center gap-6">
            {NAV_ITEMS.map((item) => (
              <li key={item.label}>
                <NavLink to={item.to} className={navLinkClasses}>
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <button
                onClick={onLogout}
                className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Logout
              </button>
            ) : (
              <>
                <Link to="/login" className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                  Login
                </Link>
                <Link to="/register" className="rounded-full bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>

        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="ml-auto inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-300 text-slate-700 md:hidden"
          aria-expanded={isOpen}
          aria-controls="mobile-nav"
          aria-label="Toggle navigation"
        >
          <span className="text-lg">{isOpen ? 'x' : '='}</span>
        </button>
      </nav>

      {isOpen ? (
        <div id="mobile-nav" className="border-t border-slate-200 bg-white px-4 py-4 md:hidden sm:px-6">
          <ul className="space-y-3">
            {NAV_ITEMS.map((item) => (
              <li key={item.label}>
                <NavLink
                  to={item.to}
                  className="block rounded-lg px-2 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex gap-2">
            {isAuthenticated ? (
              <button
                onClick={() => {
                  onLogout()
                  setIsOpen(false)
                }}
                className="w-full rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Logout
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="w-full rounded-full border border-slate-300 px-4 py-2 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsOpen(false)}
                  className="w-full rounded-full bg-emerald-700 px-4 py-2 text-center text-sm font-semibold text-white transition hover:bg-emerald-800"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      ) : null}
    </header>
  )
}
