import { Route, Routes } from 'react-router-dom'

import AppShell from './components/layout/AppShell'
import ProtectedRoute from './components/routing/ProtectedRoute'
import ContactPage from './pages/ContactPage'
import DashboardPage from './pages/DashboardPage'
import FieldDetailPage from './pages/FieldDetailPage'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import NotFoundPage from './pages/NotFoundPage'
import RegisterPage from './pages/RegisterPage'
import './App.css'

function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<HomePage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="fields/:fieldId" element={<FieldDetailPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

export default App
