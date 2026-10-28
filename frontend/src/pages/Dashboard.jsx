import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText, MessageSquare, ArrowRight, Plus, Database, Activity, Layers, Sparkles,
  Lightbulb, Upload, Bot, MailCheck, UserPlus, User, Check, ArrowUpRight,
} from 'lucide-react'
import { nlpApi } from '../services/api'
import { useAuth } from '../context/AuthContext'
import AuthIllustration from '../components/AuthIllustration'
import WordReveal from '../components/WordReveal'

const rise = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] } }),
}

const PROJECT_ID = 1

const TIPS = [
  'Pair plant iron (beans, lentils, spinach) with vitamin C foods to boost absorption.',
  'Aim for half your plate as vegetables and fruit at most meals.',
  'Adult fiber targets are roughly 25–38 g a day, and most people fall short.',
  'Whole grains keep the bran and germ, which is where most of the fiber lives.',
  'Thirst can feel like hunger. A glass of water first is an easy check.',
]

const ACTIONS = [
  { to: '/chat',      Icon: MessageSquare, title: 'Ask Hearthwise',   desc: 'Get answers grounded in your own library.' },
  { to: '/documents', Icon: Upload,        title: 'Upload documents', desc: 'Add PDFs or text files to your shelf.' },
  { to: '/documents', Icon: Layers,        title: 'Process & index',  desc: 'Chunk and embed files for semantic search.' },
  { to: '/profile',   Icon: User,          title: 'Your profile',     desc: 'Update your name and account details.' },
]

export default function Dashboard() {
  const { user } = useAuth()
  const [info, setInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tip, setTip] = useState(0)

  useEffect(() => {
    nlpApi.getIndexInfo(PROJECT_ID)
      .then(r => setInfo(r.data))
      .catch(() => setInfo(null))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const t = setInterval(() => setTip(i => (i + 1) % TIPS.length), 6000)
    return () => clearInterval(t)
  }, [])

  const docCount = info?.collection_info?.record_count ?? 0
  const indexed  = docCount > 0
  const name     = user?.full_name?.split(' ')[0] || user?.username || 'there'

  const journey = [
    { label: 'Create account', Icon: UserPlus,  done: true },
    { label: 'Verify email',   Icon: MailCheck, done: user?.verified !== false },
    { label: 'Upload & index', Icon: Upload,    done: indexed, link: '/documents' },
    { label: 'Ask a question', Icon: Bot,       done: false,   link: '/chat' },
  ]
  const doneCount = journey.filter(s => s.done).length

  const stats = [
    { label: 'Indexed passages', Icon: Layers,    value: loading ? null : docCount },
    { label: 'Index status',     Icon: Activity,  value: loading ? null : indexed ? 'Ready' : 'Empty', live: indexed },
    { label: 'Email',            Icon: MailCheck, value: user?.verified === false ? 'Pending' : 'Verified' },
    { label: 'Journey',          Icon: Sparkles,  value: `${doneCount}/${journey.length}` },
  ]

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8 pb-16">

      {/* ── Hero ───────────────────────────────────────── */}
      <motion.section custom={0} variants={rise} initial="hidden" animate="show"
        className="theme-dark band-blush relative rounded-[2.5rem] p-8 md:p-10 grid md:grid-cols-[1.3fr_1fr] gap-6 items-center overflow-hidden"
      >
        <div>
          <p className="text-fg-muted text-xs uppercase tracking-widest mb-3">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-brand-400 leading-[1.05] mb-4">
            <WordReveal text={`Good ${greeting()},`} delay={0.2} />
            <br />
            <WordReveal text={`${name}!`} delay={0.4} wordClassName="text-fg" />
          </h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
            className="text-fg-muted mb-7 max-w-md leading-relaxed"
          >
            {indexed
              ? `Your library holds ${docCount} indexed passages, ready to answer your questions.`
              : 'Your hearth is lit. Add a document and start getting answers grounded in it.'}
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.85 }}
            className="flex flex-wrap gap-3"
          >
            <Link to="/chat" className="btn-primary px-5 py-3">
              <MessageSquare className="w-4 h-4" /> Ask Hearthwise
            </Link>
            <Link to="/documents" className="btn-secondary px-5 py-3">
              <Upload className="w-4 h-4" /> Upload documents
            </Link>
          </motion.div>
        </div>
        <AuthIllustration scene="orbit" className="w-full max-w-[300px] mx-auto" />
      </motion.section>

      {/* ── Stats ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div key={s.label} custom={i + 1} variants={rise} initial="hidden" animate="show"
            whileHover={{ y: -6 }} className="card group p-5"
          >
            <div className={`${i % 2 ? 'clay-brown' : 'clay-orange'} w-12 h-12 rounded-2xl flex items-center justify-center mb-4
                             transition-transform duration-300 group-hover:-rotate-12 group-hover:scale-110`}>
              <s.Icon className="w-5 h-5" strokeWidth={2} />
            </div>
            {s.value === null ? (
              <div className="skeleton h-8 w-20 mb-1" />
            ) : (
              <p className="font-display text-3xl font-bold text-fg flex items-center gap-2">
                {s.value}
                {s.live && <span className="w-2.5 h-2.5 rounded-full bg-brand-500 animate-pulse" aria-label="live" />}
              </p>
            )}
            <p className="text-xs text-fg-muted mt-1">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* ── Journey ────────────────────────────────────── */}
      <motion.section custom={5} variants={rise} initial="hidden" animate="show" className="card p-6 md:p-8">
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="text-brand-600 text-xs font-semibold tracking-widest uppercase mb-1">Your journey</p>
            <h2 className="text-2xl font-bold text-fg">
              {doneCount === journey.length ? 'All done. Nicely cooked!' : 'A few steps to a full hearth'}
            </h2>
          </div>
          <span className="font-display text-3xl font-bold text-brand-600">{Math.round((doneCount / journey.length) * 100)}%</span>
        </div>

        <div className="relative">
          {/* Groove that fills to the current progress */}
          <div className="hidden md:block absolute top-7 left-[12%] right-[12%] h-3 rounded-full bg-ink-950 overflow-hidden"
            style={{ boxShadow: 'var(--clay-pressed)' }}>
            <motion.div className="clay-orange h-full origin-left"
              initial={{ scaleX: 0 }} animate={{ scaleX: (doneCount - 1) / (journey.length - 1) }}
              transition={{ duration: 1.4, delay: 0.6, ease: [0.16, 1, 0.3, 1] }} />
          </div>
          <div className="relative grid grid-cols-2 md:grid-cols-4 gap-6">
            {journey.map((s, i) => {
              const pebble = (
                <motion.div
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 0.5 + i * 0.12 }}
                  whileHover={{ rotate: -8, scale: 1.08 }}
                  className={`w-14 h-14 rounded-[1.3rem] flex items-center justify-center mx-auto relative
                    ${s.done ? 'clay-orange' : 'bg-ink-950 text-fg-subtle'}`}
                  style={s.done ? undefined : { boxShadow: 'var(--clay-pressed)' }}
                >
                  <s.Icon className="w-6 h-6" strokeWidth={1.8} />
                  {s.done && (
                    <span className="clay-brown absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full flex items-center justify-center">
                      <Check className="w-3.5 h-3.5" strokeWidth={3} />
                    </span>
                  )}
                </motion.div>
              )
              return (
                <div key={s.label} className="text-center">
                  {s.link && !s.done ? <Link to={s.link} aria-label={s.label}>{pebble}</Link> : pebble}
                  <p className={`text-sm font-semibold mt-3 ${s.done ? 'text-fg' : 'text-fg-muted'}`}>{s.label}</p>
                  {s.link && !s.done && (
                    <Link to={s.link} className="inline-flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 mt-1">
                      Start <ArrowRight className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </motion.section>

      {/* ── Quick actions: horizontal stack ────────────── */}
      <motion.section custom={6} variants={rise} initial="hidden" animate="show">
        <p className="text-brand-600 text-xs font-semibold tracking-widest uppercase mb-1">Jump back in</p>
        <h2 className="text-2xl font-bold text-fg">Quick actions</h2>
        <div className="clay-stack -mt-2">
          {ACTIONS.map((a, i) => (
            <Link key={a.title} to={a.to}
              className={`${i % 2 ? 'clay-orange' : 'clay-brown'} rounded-[2rem] p-6 h-52 flex flex-col justify-between group`}
            >
              <a.Icon className="w-9 h-9 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6" strokeWidth={1.6} />
              <div>
                <h3 className="font-display text-xl font-bold mb-1 flex items-center gap-2">
                  {a.title}
                  <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </h3>
                <p className="text-sm leading-relaxed opacity-85">{a.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </motion.section>

      {/* ── Knowledge base + tip ───────────────────────── */}
      <div className="grid md:grid-cols-[1.4fr_1fr] gap-6">
        <motion.section custom={7} variants={rise} initial="hidden" animate="show" className="card overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-line/60">
            <div className="flex items-center gap-3">
              <div className="clay-brown w-10 h-10 rounded-2xl flex items-center justify-center">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold text-fg">Knowledge base</p>
                <p className="text-xs text-fg-muted">What Hearthwise can read from</p>
              </div>
            </div>
            <Link to="/documents" className="flex items-center gap-1 text-xs font-semibold text-fg-muted hover:text-brand-600 transition-colors">
              Manage <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="space-y-2.5">{[1, 2, 3].map(i => <div key={i} className="skeleton h-10" />)}</div>
            ) : info?.collection_info ? (
              <div className="space-y-2">
                <Row label="Collection" value={info.collection_info.table_info?.tablename || 'data_chunks'} mono />
                <Row label="Indexed passages" value={docCount} />
                <Row label="Vector search" value={indexed ? 'Active' : 'No data yet'} badge={indexed ? 'green' : 'gray'} />
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5 rounded-2xl bg-ink-950" style={{ boxShadow: 'var(--clay-pressed)' }}>
                <motion.div animate={{ rotate: [0, -10, 10, 0] }} transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1.5 }}
                  className="clay-orange w-12 h-12 rounded-2xl flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </motion.div>
                <div className="flex-1">
                  <p className="font-semibold text-fg mb-0.5">Your shelf is empty</p>
                  <p className="text-sm text-fg-muted">Upload and process a document to build your knowledge base.</p>
                </div>
                <Link to="/documents" className="btn-primary text-sm py-2 px-4 shrink-0">
                  <Plus className="w-4 h-4" /> Upload
                </Link>
              </div>
            )}
          </div>
        </motion.section>

        <motion.section custom={8} variants={rise} initial="hidden" animate="show"
          className="theme-dark band-blush rounded-[2rem] p-6 flex flex-col"
        >
          <div className="flex items-center gap-3 mb-5">
            <motion.div animate={{ y: [0, -4, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="clay-orange w-10 h-10 rounded-2xl flex items-center justify-center">
              <Lightbulb className="w-5 h-5" />
            </motion.div>
            <p className="font-semibold text-fg">Kitchen wisdom</p>
          </div>
          <div className="flex-1 relative min-h-[96px]" aria-live="polite">
            <AnimatePresence mode="wait">
              <motion.p key={tip}
                initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="font-display text-xl leading-snug text-fg"
              >
                {TIPS[tip]}
              </motion.p>
            </AnimatePresence>
          </div>
          <div className="flex gap-1.5 mt-5">
            {TIPS.map((_, i) => (
              <button key={i} onClick={() => setTip(i)} aria-label={`Show tip ${i + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === tip ? 'w-6 bg-brand-400' : 'w-1.5 bg-fg/30 hover:bg-fg/50'}`} />
            ))}
          </div>
          <p className="text-2xs text-fg-subtle mt-4">General guidance, not medical advice.</p>
        </motion.section>
      </div>
    </div>
  )
}

/* ── Sub-components ─────────────────────────────────────────── */
function Row({ label, value, mono, badge }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 rounded-2xl hover:bg-ink-800 transition-colors">
      <span className="text-sm text-fg-muted">{label}</span>
      {badge ? (
        <span className={badge === 'green' ? 'badge-green' : 'badge-gray'}>{String(value)}</span>
      ) : (
        <span className={`text-sm font-semibold ${mono ? 'font-mono text-brand-600' : 'text-fg'}`}>{String(value)}</span>
      )}
    </div>
  )
}

function greeting() {
  const h = new Date().getHours()
  return h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening'
}
