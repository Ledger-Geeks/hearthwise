import React, { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence, useAnimationControls } from 'framer-motion'
import { Mail, ArrowRight, RotateCw, CheckCircle2, LogOut } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import WordReveal from '../components/WordReveal'

const LENGTH = 6
const RESEND_SECONDS = 60

function maskEmail(email = '') {
  const [name, domain] = email.split('@')
  if (!domain) return email
  return `${name[0]}${'•'.repeat(Math.max(name.length - 2, 1))}${name.length > 1 ? name.slice(-1) : ''}@${domain}`
}

export default function VerifyEmail() {
  const { user, verifyOtp, completeVerification, resendOtp, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const shake = useAnimationControls()
  const refs = useRef([])

  const [digits, setDigits] = useState(Array(LENGTH).fill(''))
  const [status, setStatus] = useState('idle') // idle | verifying | success
  const [error, setError] = useState('')
  // A code was just sent on sign-up; otherwise allow resending straight away
  const [cooldown, setCooldown] = useState(location.state?.justSent ? RESEND_SECONDS : 0)

  useEffect(() => { refs.current[0]?.focus() }, [])

  useEffect(() => {
    if (cooldown <= 0) return
    const t = setTimeout(() => setCooldown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [cooldown])

  const code = digits.join('')

  // Auto-submit once every box is filled
  useEffect(() => {
    if (code.length === LENGTH && status === 'idle') submit(code)
  }, [code]) // eslint-disable-line react-hooks/exhaustive-deps

  function fill(from, chars) {
    setError('')
    setDigits(d => {
      const next = [...d]
      chars.slice(0, LENGTH - from).split('').forEach((c, k) => { next[from + k] = c })
      return next
    })
    refs.current[Math.min(from + chars.length, LENGTH - 1)]?.focus()
  }

  function onChange(i, e) {
    const v = e.target.value.replace(/\D/g, '')
    if (!v) { setDigits(d => d.map((x, k) => (k === i ? '' : x))); return }
    fill(i, v.length > 1 ? v : v.slice(-1)) // multi-char input = autofill/paste into one box
  }

  function onKeyDown(i, e) {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      e.preventDefault()
      setDigits(d => d.map((x, k) => (k === i - 1 ? '' : x)))
      refs.current[i - 1]?.focus()
    } else if (e.key === 'ArrowLeft' && i > 0) refs.current[i - 1]?.focus()
    else if (e.key === 'ArrowRight' && i < LENGTH - 1) refs.current[i + 1]?.focus()
  }

  function onPaste(i, e) {
    const p = e.clipboardData.getData('text').replace(/\D/g, '')
    if (!p) return
    e.preventDefault()
    fill(i, p)
  }

  async function submit(value) {
    setStatus('verifying')
    try {
      const verified = await verifyOtp(value)
      setStatus('success')
      setTimeout(() => { completeVerification(verified); navigate('/dashboard', { replace: true }) }, 1400)
    } catch (err) {
      setStatus('idle')
      setError(err.response?.data?.detail || 'Could not verify the code. Try again.')
      setDigits(Array(LENGTH).fill(''))
      // Inputs are still disabled until the re-render; focus on the next frame
      requestAnimationFrame(() => refs.current[0]?.focus())
      shake.start({ x: [0, -12, 12, -8, 8, -4, 0], transition: { duration: 0.5 } })
    }
  }

  async function resend() {
    try {
      const data = await resendOtp()
      setCooldown(data.cooldown_seconds || RESEND_SECONDS)
      setError('')
      toast.success('A new code is on its way.')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Could not send a new code.')
    }
  }

  const switchAccount = () => { logout(); navigate('/register', { replace: true }) }

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center p-6 relative overflow-hidden">
      {/* Drifting glow + floating clay pebbles */}
      <motion.div aria-hidden
        animate={{ x: [0, 60, -40, 0], y: [0, -40, 30, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/4 left-1/3 w-96 h-96 bg-brand-500/[0.12] rounded-full blur-3xl will-change-transform" />
      <div aria-hidden className="clay-orange absolute top-[14%] left-[16%] w-12 h-12 rounded-full opacity-70 animate-float" />
      <div aria-hidden className="clay-brown absolute bottom-[16%] right-[14%] w-16 h-16 rounded-[1.4rem] opacity-60 animate-float" style={{ animationDelay: '-2s' }} />
      <div aria-hidden className="clay-orange absolute top-[30%] right-[20%] w-6 h-6 rounded-full opacity-60 animate-float" style={{ animationDelay: '-3.5s' }} />
      <div aria-hidden className="clay-brown absolute bottom-[26%] left-[10%] w-8 h-8 rounded-full opacity-50 animate-float" style={{ animationDelay: '-1s' }} />

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 140, damping: 18 }}
        className="relative w-full max-w-md"
      >
        <motion.div animate={shake} className="card p-8 md:p-10 text-center overflow-hidden">
          <AnimatePresence mode="wait">
            {status === 'success' ? (
              <motion.div key="done"
                initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 16 }}
                className="py-8"
              >
                <motion.div
                  initial={{ scale: 0, rotate: -120 }} animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 220, damping: 12, delay: 0.1 }}
                  className="clay-orange w-20 h-20 rounded-[1.8rem] flex items-center justify-center mx-auto mb-6"
                >
                  <CheckCircle2 className="w-10 h-10" strokeWidth={2} />
                </motion.div>
                <h1 className="text-3xl font-bold text-brand-600 mb-2"><WordReveal text="You're all set!" /></h1>
                <p className="text-fg-muted text-sm">Lighting up your dashboard…</p>
              </motion.div>
            ) : (
              <motion.div key="form" exit={{ opacity: 0, scale: 0.95 }}>
                {/* Envelope tile with a ping ring */}
                <div className="relative w-16 h-16 mx-auto mb-6">
                  <span aria-hidden className="absolute inset-0 rounded-[1.4rem] bg-brand-500/30 animate-ping" />
                  <motion.div
                    animate={{ y: [0, -6, 0], rotate: [0, -8, 8, 0] }}
                    transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                    className="clay-orange relative w-16 h-16 rounded-[1.4rem] flex items-center justify-center"
                  >
                    <Mail className="w-7 h-7" strokeWidth={2} />
                  </motion.div>
                </div>

                <h1 className="text-3xl font-bold text-brand-600 mb-2">
                  <WordReveal text="Check your inbox" delay={0.2} />
                </h1>
                <p className="text-fg-muted text-sm mb-8">
                  We sent a 6-digit code to <span className="font-semibold text-fg">{maskEmail(user?.email)}</span>
                </p>

                {/* OTP boxes */}
                <motion.div
                  initial="hidden" animate="show"
                  variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06, delayChildren: 0.35 } } }}
                  className="flex justify-center gap-2 sm:gap-3 mb-3"
                  role="group" aria-label="Verification code"
                >
                  {digits.map((d, i) => (
                    <motion.input
                      key={i}
                      ref={el => (refs.current[i] = el)}
                      variants={{ hidden: { opacity: 0, y: 14, scale: 0.8 }, show: { opacity: 1, y: 0, scale: 1 } }}
                      animate={d ? { scale: [1, 1.12, 1] } : undefined}
                      value={d}
                      onChange={e => onChange(i, e)}
                      onKeyDown={e => onKeyDown(i, e)}
                      onPaste={e => onPaste(i, e)}
                      onFocus={e => e.target.select()}
                      inputMode="numeric"
                      autoComplete={i === 0 ? 'one-time-code' : 'off'}
                      maxLength={LENGTH}
                      disabled={status === 'verifying'}
                      aria-label={`Digit ${i + 1}`}
                      className={`input w-11 h-14 sm:w-12 sm:h-16 p-0 text-center text-2xl font-display font-bold
                        ${d ? 'text-brand-600 ring-2 ring-brand-500/30' : ''}`}
                    />
                  ))}
                </motion.div>

                <div className="h-6 mb-4" aria-live="polite">
                  <AnimatePresence>
                    {error && (
                      <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="text-sm text-red-600">{error}</motion.p>
                    )}
                  </AnimatePresence>
                </div>

                <motion.button
                  onClick={() => submit(code)}
                  disabled={code.length < LENGTH || status === 'verifying'}
                  whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}
                  className="btn-primary group/btn relative w-full py-3 text-sm overflow-hidden"
                >
                  <span aria-hidden className="absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/35 to-transparent
                                               transition-transform duration-700 group-hover/btn:translate-x-[300%]" />
                  <span className="relative flex items-center justify-center gap-2">
                    {status === 'verifying' ? (
                      <><span className="w-4 h-4 border-2 border-white/25 border-t-white rounded-full animate-spin" /> Verifying…</>
                    ) : (
                      <>Verify email <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" /></>
                    )}
                  </span>
                </motion.button>

                <div className="mt-6 text-sm text-fg-muted">
                  Didn't get it? Check spam, or{' '}
                  {cooldown > 0 ? (
                    <span className="font-semibold text-fg-subtle tabular-nums">resend in 0:{String(cooldown).padStart(2, '0')}</span>
                  ) : (
                    <button onClick={resend} className="inline-flex items-center gap-1 font-semibold text-brand-600 hover:text-brand-700 transition-colors">
                      <RotateCw className="w-3.5 h-3.5" /> resend code
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {status !== 'success' && (
          <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
            onClick={switchAccount}
            className="mx-auto mt-6 flex items-center gap-1.5 text-sm text-fg-muted hover:text-brand-600 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" /> Wrong email? Use a different account
          </motion.button>
        )}
      </motion.div>
    </div>
  )
}
