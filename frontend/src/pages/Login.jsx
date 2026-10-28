import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, useAnimationControls } from 'framer-motion'
import { Flame, Mail, Lock, ArrowRight, Eye, EyeOff, Brain, Zap, Shield } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import AuthIllustration from '../components/AuthIllustration'
import WordReveal from '../components/WordReveal'

const field = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16,1,0.3,1] } },
}

const iconCls = 'absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-subtle pointer-events-none ' +
  'transition-[color,transform] duration-300 group-focus-within:text-brand-600 group-focus-within:scale-110'

export default function Login() {
  const [form, setForm]       = useState({ email: '', password: '' })
  const [showPw, setShowPw]   = useState(false)
  const [loading, setLoading] = useState(false)
  const { login }             = useAuth()
  const navigate              = useNavigate()
  const shake                 = useAnimationControls()

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(form.email, form.password)
      toast.success('Welcome back!')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Invalid email or password')
      shake.start({ x: [0, -12, 12, -8, 8, -4, 0], transition: { duration: 0.5 } })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-ink flex overflow-hidden">

      {/* ── Left decorative panel ─────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 p-4">
        <div className="theme-dark band-blush relative flex-1 rounded-[2.5rem] flex flex-col justify-between p-10 overflow-hidden">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 w-fit">
            <div className="clay-brown w-9 h-9 rounded-2xl flex items-center justify-center">
              <Flame className="w-4 h-4 text-brand-300" strokeWidth={2.5} />
            </div>
            <span className="font-display text-lg font-semibold text-fg">Hearthwise</span>
          </Link>

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16,1,0.3,1] }}
          >
            <AuthIllustration className="w-full max-w-md mx-auto" />
          </motion.div>

          <div>
            {/* Feature chips */}
            <motion.div
              initial="hidden" animate="show"
              variants={{ show: { transition: { staggerChildren: 0.1, delayChildren: 0.3 } } }}
              className="flex flex-wrap gap-3 mb-6"
            >
              {[
                { Icon: Brain,  label: 'RAG-powered answers' },
                { Icon: Zap,    label: 'Instant semantic search' },
                { Icon: Shield, label: 'Private & secure' },
              ].map(({ Icon, label }) => (
                <motion.div key={label}
                  variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16,1,0.3,1] } } }}
                  className="card flex items-center gap-2.5 px-4 py-2.5 rounded-full text-sm text-fg"
                >
                  <Icon className="text-brand-400" strokeWidth={1.8} size={16} />
                  {label}
                </motion.div>
              ))}
            </motion.div>

            {/* Quote */}
            <p className="text-fg-muted text-sm italic leading-relaxed">
              "Good advice is slow-cooked from real evidence. Hearthwise keeps it that way."
            </p>
          </div>
        </div>
      </div>

      {/* ── Right form panel ──────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 relative overflow-hidden">
        {/* Drifting glow + floating clay pebbles */}
        <motion.div aria-hidden
          animate={{ x: [0, 50, -30, 0], y: [0, -40, 25, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/4 right-1/4 w-80 h-80 bg-brand-500/[0.12] rounded-full blur-3xl will-change-transform" />
        <div aria-hidden className="clay-orange absolute top-[12%] right-[14%] w-10 h-10 rounded-full opacity-70 animate-float" />
        <div aria-hidden className="clay-brown absolute bottom-[14%] left-[12%] w-14 h-14 rounded-[1.2rem] opacity-60 animate-float" style={{ animationDelay: '-2s' }} />
        <div aria-hidden className="clay-orange absolute bottom-[32%] right-[8%] w-6 h-6 rounded-full opacity-60 animate-float" style={{ animationDelay: '-3.5s' }} />

        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 140, damping: 18, delay: 0.1 }}
          className="relative w-full max-w-sm"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-6">
            <div className="clay-brown w-8 h-8 rounded-xl flex items-center justify-center">
              <Flame className="w-4 h-4 text-brand-300" />
            </div>
            <span className="font-display font-semibold text-fg">Hearthwise</span>
          </div>

          {/* Card shakes on a failed sign-in */}
          <motion.div animate={shake} className="card p-8">
            {/* Header */}
            <div className="mb-7">
              <motion.div
                animate={{ rotate: [0, -12, 10, -6, 0], y: [0, -4, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 2.4, ease: 'easeInOut' }}
                className="clay-orange w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
              >
                <Flame className="w-6 h-6" />
              </motion.div>
              <h1 className="text-3xl font-bold text-brand-600 mb-1.5">
                <WordReveal text="Welcome back" delay={0.3} />
              </h1>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6, duration: 0.6 }}
                className="text-fg-muted text-sm"
              >
                Sign in to pick up where you left off
              </motion.p>
            </div>

            {/* Form: fields stagger in; focused field lights up orange */}
            <motion.form onSubmit={handleSubmit} className="space-y-4"
              initial="hidden" animate="show"
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1, delayChildren: 0.5 } } }}
            >
              <motion.div variants={field} className="group">
                <label htmlFor="login-email" className="input-label transition-colors group-focus-within:text-brand-600">Email address</label>
                <div className="relative">
                  <Mail className={iconCls} />
                  <input
                    id="login-email" type="email" required autoComplete="email"
                    placeholder="you@example.com"
                    value={form.email} onChange={set('email')}
                    className="input pl-10"
                  />
                </div>
              </motion.div>

              <motion.div variants={field} className="group">
                <label htmlFor="login-password" className="input-label transition-colors group-focus-within:text-brand-600">Password</label>
                <div className="relative">
                  <Lock className={iconCls} />
                  <input
                    id="login-password" type={showPw ? 'text' : 'password'} required autoComplete="current-password"
                    placeholder="Your password"
                    value={form.password} onChange={set('password')}
                    className="input pl-10 pr-10"
                  />
                  <button type="button" tabIndex={-1} onClick={() => setShowPw(v => !v)}
                    aria-label={showPw ? 'Hide password' : 'Show password'}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-fg-subtle hover:text-brand-600 transition-colors">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </motion.div>

              <motion.button
                type="submit" disabled={loading} variants={field}
                whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}
                className="btn-primary group/btn relative w-full py-3 text-sm mt-2 overflow-hidden"
              >
                {/* Shine that sweeps across on hover */}
                <span aria-hidden className="absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/35 to-transparent
                                             transition-transform duration-700 group-hover/btn:translate-x-[300%]" />
                {loading ? (
                  <span className="relative flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/25 border-t-white rounded-full animate-spin" />
                    Signing in…
                  </span>
                ) : (
                  <span className="relative flex items-center justify-center gap-2">
                    Sign in <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
                  </span>
                )}
              </motion.button>
            </motion.form>
          </motion.div>

          {/* Footer */}
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}
            className="text-center text-fg-muted text-sm mt-6"
          >
            No account?{' '}
            <Link to="/register" className="text-brand-600 hover:text-brand-700 font-semibold transition-colors">
              Create one free
            </Link>
          </motion.p>
        </motion.div>
      </div>
    </div>
  )
}
