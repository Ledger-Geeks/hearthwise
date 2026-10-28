import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Landing    from './pages/Landing'
import Login      from './pages/Login'
import Register   from './pages/Register'
import VerifyEmail from './pages/VerifyEmail'
import Dashboard  from './pages/Dashboard'
import Chat       from './pages/Chat'
import Documents  from './pages/Documents'
import Profile    from './pages/Profile'
import Layout     from './components/Layout'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <FullPageLoader />
  if (!user) return <Navigate to="/login" replace />
  // `=== false` so a user object without the field (older cache) isn't locked out
  return user.verified === false ? <Navigate to="/verify" replace /> : children
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <FullPageLoader />
  if (!user) return children
  return <Navigate to={user.verified === false ? '/verify' : '/dashboard'} replace />
}

function VerifyRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <FullPageLoader />
  if (!user) return <Navigate to="/login" replace />
  return user.verified === false ? children : <Navigate to="/dashboard" replace />
}

function FullPageLoader() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 text-sm">Loading…</p>
      </div>
    </div>
  )
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/verify" element={<VerifyRoute><VerifyEmail /></VerifyRoute>} />
      <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/chat"      element={<Chat />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/profile"   element={<Profile />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
