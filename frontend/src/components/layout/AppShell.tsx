import { Outlet, useNavigate } from 'react-router-dom'

import { clearAuthSession, getAuthSession } from '../../lib/authStorage'
import GlobalFooter from './GlobalFooter'
import GlobalNavbar from './GlobalNavbar'

export default function AppShell() {
  const navigate = useNavigate()

  const handleLogout = () => {
    clearAuthSession()
    navigate('/')
  }

  return (
    <div className="min-h-screen">
      <GlobalNavbar isAuthenticated={Boolean(getAuthSession())} onLogout={handleLogout} />
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 md:py-10 lg:px-8">
        <Outlet />
      </main>
      <GlobalFooter />
    </div>
  )
}
