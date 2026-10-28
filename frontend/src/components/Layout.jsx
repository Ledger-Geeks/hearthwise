import React, { useState } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, MessageSquare, FileText, User,
  LogOut, Menu, X, Flame, ChevronRight, Settings
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const NAV = [
  { to: '/dashboard', label: 'Dashboard',  Icon: LayoutDashboard, desc: 'Overview & stats' },
  { to: '/chat',      label: 'AI Chat',    Icon: MessageSquare,   desc: 'Ask questions' },
  { to: '/documents', label: 'Documents',  Icon: FileText,        desc: 'Manage files' },
  { to: '/profile',   label: 'Profile',    Icon: User,            desc: 'Account settings' },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate         = useNavigate()
  const location         = useLocation()
  const [mobile, setMobile] = useState(false)

  const handleLogout = () => { logout(); navigate('/') }

  const initials = user?.full_name
    ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : (user?.username?.[0] || '?').toUpperCase()

  return (
    <div className="flex h-screen overflow-hidden bg-ink">

      {/* ── Desktop sidebar ─────────────────────────────── */}
      <aside className="hidden md:flex w-[250px] shrink-0 p-3">
        <motion.div
          initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="card flex-1 rounded-[2rem] overflow-hidden"
        >
          <Sidebar user={user} initials={initials} onLogout={handleLogout} />
        </motion.div>
      </aside>

      {/* ── Mobile overlay ──────────────────────────────── */}
      <AnimatePresence>
        {mobile && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-ink/80 backdrop-blur-sm md:hidden"
              onClick={() => setMobile(false)}
            />
            <motion.aside
              key="drawer"
              initial={{ x: -240 }} animate={{ x: 0 }} exit={{ x: -240 }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              className="fixed inset-y-0 left-0 z-50 w-[250px] flex flex-col
                         border-r border-line bg-ink-900 md:hidden"
            >
              <Sidebar user={user} initials={initials} onLogout={handleLogout} onClose={() => setMobile(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Content ────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Mobile header */}
        <header className="md:hidden flex items-center justify-between h-14 px-4 border-b border-line/60 bg-ink-950/80 backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <div className="clay-brown w-8 h-8 rounded-xl flex items-center justify-center">
              <Flame className="w-4 h-4 text-brand-300" />
            </div>
            <span className="font-display font-semibold text-fg">Hearthwise</span>
          </div>
          <button onClick={() => setMobile(true)}
            className="btn-icon">
            <Menu className="w-4.5 h-4.5" size={18} />
          </button>
        </header>

        {/* Page content with animated route transition */}
        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}

function Sidebar({ user, initials, onLogout, onClose }) {
  return (
    <div className="flex flex-col h-full">

      {/* Logo row */}
      <div className="flex items-center justify-between px-5 pt-6 pb-5 shrink-0">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: [0, -10, 8, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 4, ease: 'easeInOut' }}
            className="clay-brown w-10 h-10 rounded-2xl flex items-center justify-center"
          >
            <Flame className="w-5 h-5 text-brand-300" strokeWidth={2.5} />
          </motion.div>
          <span className="font-display text-lg font-semibold text-fg">Hearthwise</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="btn-icon w-8 h-8" aria-label="Close menu">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Nav links: active item sits on a clay pill that springs between items */}
      <nav className="flex-1 px-3 space-y-1">
        {NAV.map(({ to, label, Icon }, i) => (
          <motion.div key={to}
            initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + i * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <NavLink to={to} onClick={onClose}
              className={({ isActive }) => `
                group relative flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold
                transition-colors duration-150
                ${isActive ? 'text-bark-950' : 'text-fg-muted hover:text-fg hover:bg-ink-800'}
              `}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId="sidebar-pill"
                      className="absolute inset-0 rounded-2xl clay-orange"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <Icon size={18} strokeWidth={1.9}
                    className={`relative transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6
                      ${isActive ? 'text-bark-950' : 'text-fg-subtle group-hover:text-brand-600'}`} />
                  <span className="relative flex-1">{label}</span>
                </>
              )}
            </NavLink>
          </motion.div>
        ))}
      </nav>

      {/* Ask promo */}
      <div className="px-3 pb-3 shrink-0">
        <div className="theme-dark band-blush rounded-[1.5rem] p-4">
          <p className="font-display font-semibold text-fg leading-tight mb-1">Got a food question?</p>
          <p className="text-xs text-fg-muted mb-3">Ask from your own library.</p>
          <NavLink to="/chat" onClick={onClose} className="btn-primary w-full py-2 text-xs">
            <MessageSquare className="w-3.5 h-3.5" /> Ask Hearthwise
          </NavLink>
        </div>
      </div>

      {/* User footer */}
      <div className="p-3 pt-0 shrink-0">
        <div className="flex items-center gap-3 px-2 py-2 rounded-2xl">
          <div className="clay-brown w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-bold shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-fg truncate leading-tight">
              {user?.full_name || user?.username}
            </p>
            <p className="text-[11px] text-fg-subtle truncate leading-tight">{user?.email}</p>
          </div>
          <button
            onClick={onLogout}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-fg-subtle hover:text-red-600 hover:bg-red-500/10 transition-colors"
            title="Sign out" aria-label="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
