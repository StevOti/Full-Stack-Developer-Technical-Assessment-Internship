import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { hasActiveSession } from '../../lib/authStorage'

export default function ProtectedRoute() {
  const location = useLocation()

  if (!hasActiveSession()) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  return <Outlet />
}
