import React, { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  motion, useScroll, useTransform, useSpring, useReducedMotion, useInView, animate,
} from 'framer-motion'
import DemoChatbot from '../components/DemoChatbot'
import WordReveal from '../components/WordReveal'
import {
  Flame, MessageSquare, FileText, Zap, Shield, ArrowRight, Brain, Upload,
  Database, Search, Bot, Stethoscope, FlaskConical, ChefHat, Dumbbell, Plus,
} from 'lucide-react'

/* ── Animation variants ───────────────────────────────────────── */
const fadeUp = (delay = 0) => ({
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] } },
})

// Stack container slides in and staggers its cards. Cards animate opacity only,
// so framer never writes an inline transform that would block the CSS hover lift.
const stackIn = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1], staggerChildren: 0.09 } },
}
const cardIn = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.5 } } }

const stagger = (delay = 0) => ({
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: delay } },
})

const inView = { initial: 'hidden', whileInView: 'show', viewport: { once: true, margin: '-80px' } }

export default function Landing() {
  const reduce = useReducedMotion()
  const { scrollY, scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 })
  // Spring-smoothed scroll so parallax eases instead of tracking the wheel 1:1
  const smoothY = useSpring(scrollY, { stiffness: 90, damping: 24, mass: 0.4 })
  const slowY = useTransform(smoothY, v => (reduce ? 0 : v * -0.12))
  const fastY = useTransform(smoothY, v => (reduce ? 0 : v * -0.3))
  const deckY = useTransform(smoothY, [0, 700], [0, reduce ? 0 : -70])

  // Hero deck tilts toward the pointer
  const tiltX = useSpring(0, { stiffness: 150, damping: 18 })
  const tiltY = useSpring(0, { stiffness: 150, damping: 18 })
  const onTilt = (e) => {
    if (reduce) return
    const r = e.currentTarget.getBoundingClientRect()
    tiltY.set(((e.clientX - r.left) / r.width - 0.5) * 14)
    tiltX.set(((e.clientY - r.top) / r.height - 0.5) * -14)
  }
  const resetTilt = () => { tiltX.set(0); tiltY.set(0) }

  return (
    <div className="min-h-screen bg-ink overflow-x-hidden">

      {/* ── Scroll progress ─────────────────────────────────── */}
      <motion.div style={{ scaleX: progress }}
        className="fixed top-0 inset-x-0 h-1 z-50 origin-left bg-gradient-to-r from-bark-500 via-brand-500 to-brand-400" />

      {/* ── Background: parallax glows + floating clay pebbles ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden>
        <div className="bg-dots absolute inset-0 opacity-40" />
        <motion.div style={{ y: slowY }} className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-brand-600/[0.07] rounded-full blur-[120px] will-change-transform" />
        <motion.div style={{ y: slowY }} className="absolute top-1/2 -left-48 w-[500px] h-[500px] bg-bark-500/[0.08] rounded-full blur-[120px] will-change-transform" />
        <motion.div style={{ y: fastY }} className="absolute top-[16%] left-[4%]">
          <div className="clay-orange w-12 h-12 rounded-full opacity-60 animate-float" />
        </motion.div>
        <motion.div style={{ y: slowY }} className="absolute top-[58%] right-[4%]">
          <div className="clay-brown w-20 h-20 rounded-[1.8rem] opacity-50 animate-float" style={{ animationDelay: '-2s' }} />
        </motion.div>
        <motion.div style={{ y: fastY }} className="absolute bottom-[10%] left-[10%]">
          <div className="clay-orange w-7 h-7 rounded-full opacity-50 animate-float" style={{ animationDelay: '-4s' }} />
        </motion.div>
      </div>

      {/* ── Floating clay nav ──────────────────────────────── */}
      <motion.nav
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="sticky top-4 z-30 px-4"
      >
        <div className="card max-w-5xl mx-auto px-4 py-2.5 flex items-center justify-between rounded-full">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="clay-brown w-9 h-9 rounded-2xl flex items-center justify-center">
              <Flame className="w-4 h-4 text-brand-300" strokeWidth={2.5} />
            </div>
            <span className="font-display text-lg font-semibold text-fg">Hearthwise</span>
          </Link>
          <div className="hidden md:flex items-center gap-7">
            {[['Features', '#features'], ['How it works', '#how'], ['FAQ', '#faq']].map(([l, href]) => (
              <a key={l} href={href} className="text-sm text-fg-muted hover:text-brand-700 transition-colors">{l}</a>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Link to="/login" className="btn-ghost text-sm hidden sm:inline-flex">Sign in</Link>
            <Link to="/register" className="btn-primary text-sm py-2 px-4 rounded-full">
              Get started <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* ── Hero: split, card deck on the right ────────────── */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pt-16 md:pt-24 pb-20 grid md:grid-cols-[1.1fr_1fr] gap-14 items-center">
        <motion.div variants={stagger(0.1)} initial="hidden" animate="show">
          <motion.div variants={fadeUp(0)}
            className="clay-orange inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-7"
          >
            <Flame className="w-3.5 h-3.5" /> Grounded AI for food & nutrition research
          </motion.div>

          <h1 className="text-5xl md:text-7xl font-bold leading-[0.95] mb-6 text-brand-600">
            <WordReveal text="Nutrition wisdom," delay={0.15} />
            <br />
            <WordReveal text="kindled from your shelf" delay={0.35} wordClassName="text-gradient" />
          </h1>

          <motion.p variants={fadeUp(0.1)} className="text-fg-muted text-lg max-w-md mb-9 leading-relaxed">
            Upload documents, ask questions in plain English, get precise answers
            grounded in evidence — not hallucinations.
          </motion.p>

          <motion.div variants={fadeUp(0.15)} className="flex flex-wrap items-center gap-4">
            <Link to="/register" className="btn-primary px-7 py-3.5 text-base">
              Start for free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/login" className="btn-secondary px-7 py-3.5 text-base">Sign in</Link>
          </motion.div>
        </motion.div>

        {/* Deck: three clay cards that fan out on hover and tilt toward the pointer */}
        <motion.div style={{ y: deckY }}>
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          onMouseMove={onTilt} onMouseLeave={resetTilt}
          style={{ rotateX: tiltX, rotateY: tiltY, transformPerspective: 1100 }}
          className="group relative h-[460px] md:h-[480px]"
        >
          <div className="relative h-full animate-float">
          <div className="card absolute inset-x-6 top-0 p-5 -rotate-[5deg] transition-transform duration-500
                          group-hover:-rotate-[10deg] group-hover:-translate-x-8 group-hover:-translate-y-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="clay-brown w-10 h-10 rounded-2xl flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-fg">plant-protein-guide.pdf</p>
                <p className="text-2xs text-fg-subtle">Chunked & indexed</p>
              </div>
            </div>
            <div className="h-2.5 rounded-full bg-ink-950" style={{ boxShadow: 'var(--clay-pressed)' }}>
              <div className="clay-orange h-full w-4/5 rounded-full" />
            </div>
          </div>

          <div className="card absolute inset-x-3 top-28 p-5 rotate-[4deg] transition-transform duration-500
                          group-hover:rotate-[9deg] group-hover:translate-x-8">
            <div className="flex items-center gap-3">
              <div className="clay-orange w-10 h-10 rounded-2xl flex items-center justify-center">
                <Search className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-fg">Retrieved 5 passages</p>
                <p className="text-2xs text-fg-subtle">Semantic match across your library</p>
              </div>
            </div>
          </div>

          <div className="card absolute inset-x-0 top-52 p-5 space-y-3 transition-transform duration-500 group-hover:translate-y-4">
            <MockMessage role="user" text="What are the best plant-based complete protein sources?" />
            <MockMessage role="ai" delay={0.8}
              text="From your documents: quinoa (all 9 essential amino acids), edamame (18g per cup) and tempeh (31g per cup) rank highest." />
            <MockTyping delay={1.2} />
          </div>
          </div>
        </motion.div>
        </motion.div>
      </section>


      {/* ── Specs: clay blobs (facts from the actual pipeline) ── */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pb-20">
        <motion.div variants={stagger()} {...inView} className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {specs.map((s, i) => (
            <motion.div key={s.label} variants={fadeUp(i * 0.05)} whileHover={{ y: -8, rotate: i % 2 ? 2 : -2 }}>
              <div className={`${i % 2 ? 'clay-orange' : 'clay-brown'} rounded-[2rem] px-5 py-6 text-center animate-float`}
                style={{ animationDelay: `${-i * 1.5}s` }}
              >
                <p className="font-display text-3xl font-bold"><CountUp value={s.value} /></p>
                <p className="text-xs font-medium opacity-80 mt-1">{s.label}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── Features: horizontal card stack ───────────────── */}
      <section id="features" className="relative z-10 max-w-6xl mx-auto px-6 py-16 scroll-mt-24">
        <SectionHead eyebrow="Everything included" title="Built for precision"
          desc="Hover the stack — each card pulls forward." />
        <motion.div variants={stackIn} {...inView} className="clay-stack">
          {features.map((f, i) => (
            <motion.article key={f.title} variants={cardIn} tabIndex={0} className="card p-6 h-64 flex flex-col">
              <div className={`${i % 2 ? 'clay-orange' : 'clay-brown'} w-12 h-12 rounded-2xl flex items-center justify-center mb-5`}>
                <f.Icon className="w-5 h-5" strokeWidth={2} />
              </div>
              <h3 className="font-semibold text-fg text-lg mb-2">{f.title}</h3>
              <p className="text-fg-muted text-sm leading-relaxed">{f.desc}</p>
            </motion.article>
          ))}
        </motion.div>
      </section>

      {/* ── How it works: clay pebbles on a groove, in a blush band ── */}
      <motion.section id="how"
        initial={{ opacity: 0, scale: 0.94 }} whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="theme-dark band-blush relative z-10 max-w-6xl mx-4 md:mx-auto my-8 px-6 md:px-12 py-14 rounded-[3rem] scroll-mt-24">
        <SectionHead eyebrow="Simple workflow" title="Three steps to insight" />
        <div className="relative grid md:grid-cols-3 gap-10">
          <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-3 rounded-full bg-ink-950 overflow-hidden"
            style={{ boxShadow: 'var(--clay-pressed)' }}
          >
            <motion.div className="clay-orange h-full origin-left"
              initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }}
              transition={{ duration: 1.4, delay: 0.3, ease: [0.16, 1, 0.3, 1] }} />
          </div>
          {steps.map((s, i) => (
            <motion.div key={s.title} variants={fadeUp(i * 0.1)} {...inView}
              className="relative flex flex-col items-center text-center gap-5"
            >
              <motion.div whileHover={{ rotate: -8, scale: 1.08 }} transition={{ type: 'spring', stiffness: 300, damping: 12 }}
                className="clay-orange w-24 h-24 rounded-[2rem] flex items-center justify-center relative"
              >
                <s.Icon className="w-9 h-9" strokeWidth={1.8} />
                <span className="clay-brown absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold">
                  {i + 1}
                </span>
              </motion.div>
              <div>
                <h3 className="font-semibold text-fg text-lg mb-2">{s.title}</h3>
                <p className="text-fg-muted text-sm leading-relaxed max-w-xs">{s.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ── Who it's for: second stack ─────────────────────── */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-16">
        <SectionHead eyebrow="Who it's for" title="A hearth for every kitchen" />
        <motion.div variants={stackIn} {...inView} className="clay-stack">
          {audiences.map((a, i) => (
            <motion.article key={a.title} variants={cardIn} tabIndex={0}
              className={`${i % 2 ? 'clay-orange' : 'clay-brown'} rounded-[2rem] p-7 h-72 flex flex-col justify-between`}
            >
              <a.Icon className="w-10 h-10" strokeWidth={1.6} />
              <div>
                <h3 className="font-display text-2xl font-bold mb-2">{a.title}</h3>
                <p className="text-sm leading-relaxed opacity-85">{a.desc}</p>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </section>

      {/* ── Ask it anything: chat card + question pebbles ───── */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-16">
        <SectionHead eyebrow="Ask it anything" title="Questions it loves" />
        <div className="grid md:grid-cols-[1.3fr_1fr] gap-6">
          <motion.div variants={fadeUp()} {...inView} className="card p-6 space-y-4">
            <MockMessage role="user" text="How does fiber affect gut microbiome diversity?" />
            <MockMessage role="ai"
              text="Your uploaded reviews link higher fermentable-fiber intake with greater microbial diversity, mainly via short-chain fatty acid production." />
            <div className="flex items-center gap-2 bg-ink-950 rounded-2xl px-4 py-3" style={{ boxShadow: 'var(--clay-pressed)' }}>
              <span className="flex-1 text-fg-subtle text-sm">Ask a question about your documents…</span>
              <div className="clay-orange w-8 h-8 rounded-xl flex items-center justify-center">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </motion.div>
          <motion.div variants={stagger()} {...inView} className="flex flex-col gap-3">
            {questions.map((q, i) => (
              <motion.div key={q} variants={fadeUp(i * 0.05)} whileHover={{ x: 8 }}
                className={`card px-5 py-4 text-sm text-fg flex items-center gap-3 ${i % 2 ? 'md:ml-8' : ''}`}
              >
                <MessageSquare className="w-4 h-4 text-brand-600 shrink-0" />
                {q}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── FAQ: native <details>, no JS ───────────────────── */}
      <section id="faq" className="relative z-10 max-w-3xl mx-auto px-6 py-16 scroll-mt-24">
        <SectionHead eyebrow="Good to know" title="Questions, answered" />
        <div className="space-y-4">
          {faqs.map(f => (
            <details key={f.q} className="card group px-6 py-5">
              <summary className="flex items-center justify-between cursor-pointer list-none font-semibold text-fg">
                {f.q}
                <span className="clay-orange w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ml-4 transition-transform group-open:rotate-45">
                  <Plus className="w-4 h-4" />
                </span>
              </summary>
              <p className="text-fg-muted text-sm leading-relaxed mt-3 group-open:animate-slide-up">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ── CTA: big orange clay slab ──────────────────────── */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="clay-orange rounded-[2.5rem] px-8 py-16 text-center bg-[length:200%_200%] animate-gradient"
        >
          <div className="clay-brown w-16 h-16 rounded-[1.4rem] flex items-center justify-center mx-auto mb-6 animate-float">
            <Flame className="w-7 h-7 text-brand-300" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-bark-950 mb-4">Light up your library</h2>
          <p className="text-bark-900 mb-9 max-w-md mx-auto">
            Join and get precise, evidence-based answers from your own documents in minutes.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/register" className="btn-primary px-8 py-3.5 text-base">
              Create free account <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/login" className="btn-secondary px-6 py-3.5 text-base">Sign in</Link>
          </div>
        </motion.div>
      </section>

      {/* ── Footer ───────────────────────────────────────── */}
      <motion.footer initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="theme-dark band-blush relative z-10 rounded-t-[3rem] mt-6 py-12">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-brand-500" />
            <span className="font-display text-fg font-semibold">Hearthwise</span>
          </div>
          <p className="text-fg-subtle text-xs">© 2026 Hearthwise · Nutrition wisdom, kindled from your shelf</p>
        </div>
      </motion.footer>

      <DemoChatbot />
    </div>
  )
}

/* ── Sub-components ─────────────────────────────────────────── */
// Counts the number inside a label ("10 MB") up from 0 the first time it's seen
function CountUp({ value }) {
  const ref = useRef(null)
  const seen = useInView(ref, { once: true })
  const reduce = useReducedMotion()
  useEffect(() => {
    const num = value.match(/\d+/)?.[0]
    if (!seen || !num || reduce) return
    const controls = animate(0, Number(num), {
      duration: 1.4, ease: [0.16, 1, 0.3, 1],
      onUpdate: v => { if (ref.current) ref.current.textContent = value.replace(num, Math.round(v)) },
    })
    return () => controls.stop()
  }, [seen, value, reduce])
  return <span ref={ref}>{value}</span>
}
function SectionHead({ eyebrow, title, desc }) {
  return (
    <motion.div variants={stagger()} {...inView} className="mb-10">
      <motion.p variants={fadeUp()} className="text-brand-600 text-xs font-semibold tracking-widest uppercase mb-3">
        {eyebrow}
      </motion.p>
      <h2 className="text-4xl md:text-5xl font-bold text-brand-600">
        <WordReveal text={title} whenInView />
      </h2>
      {desc && <motion.p variants={fadeUp(0.1)} className="text-fg-muted mt-3">{desc}</motion.p>}
    </motion.div>
  )
}

function MockMessage({ role, text, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={`flex gap-2.5 items-end ${role === 'user' ? 'justify-end' : ''}`}
    >
      {role === 'ai' && (
        <div className="clay-brown w-7 h-7 rounded-xl flex items-center justify-center shrink-0">
          <Flame className="w-3.5 h-3.5 text-brand-300" />
        </div>
      )}
      <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed
        ${role === 'user' ? 'clay-orange rounded-br-md' : 'bg-ink-950 text-fg-muted rounded-bl-md'}`}
        style={role === 'user' ? undefined : { boxShadow: 'var(--clay-pressed)' }}
      >
        {text}
      </div>
    </motion.div>
  )
}

function MockTyping({ delay = 0 }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay }} className="flex gap-2.5 items-end">
      <div className="clay-brown w-7 h-7 rounded-xl flex items-center justify-center shrink-0">
        <Flame className="w-3.5 h-3.5 text-brand-300" />
      </div>
      <div className="px-4 py-3 bg-ink-950 rounded-2xl rounded-bl-md flex gap-1" style={{ boxShadow: 'var(--clay-pressed)' }}>
        {[0, 1, 2].map(i => (
          <span key={i} className="w-1.5 h-1.5 bg-brand-400/70 rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.18}s` }} />
        ))}
      </div>
    </motion.div>
  )
}

/* ── Content ────────────────────────────────────────────────── */
const specs = [
  { value: 'PDF · TXT', label: 'Supported formats' },
  { value: '10 MB',     label: 'Per file' },
  { value: 'Top 5',     label: 'Passages per answer' },
  { value: '2',         label: 'LLM providers' },
]

const features = [
  { Icon: Brain,         title: 'RAG-Powered Answers',       desc: 'Retrieval-augmented generation grounds every answer in your actual documents — no hallucinations.' },
  { Icon: Upload,        title: 'Smart Document Processing', desc: 'Upload PDFs and text files. Automatic chunking, embedding, and vector indexing in seconds.' },
  { Icon: Search,        title: 'Semantic Search',           desc: 'Find relevant content even when you use different words or phrasing.' },
  { Icon: MessageSquare, title: 'Conversational AI',         desc: 'Chat naturally with your knowledge base. Follow-ups, clarifications, deep exploration.' },
  { Icon: Shield,        title: 'Private by Design',         desc: 'Your documents stay in your private project space. Full control, no shared knowledge.' },
  { Icon: Database,      title: 'Vector Database',           desc: 'Powered by pgvector or Qdrant for fast similarity search.' },
]

const steps = [
  { Icon: Upload, title: 'Upload documents', desc: 'Drop in PDFs and text files — research papers, guidelines, nutrition data.' },
  { Icon: Zap,    title: 'Process & index',  desc: 'Your content is chunked, embedded, and stored in a vector database.' },
  { Icon: Bot,    title: 'Ask & get answers', desc: 'Query your knowledge base in plain English, get precise sourced answers.' },
]

const audiences = [
  { Icon: Stethoscope,  title: 'Dietitians',  desc: 'Answer client questions straight from the guidelines you already trust.' },
  { Icon: FlaskConical, title: 'Researchers', desc: 'Interrogate a stack of papers without rereading every methods section.' },
  { Icon: ChefHat,      title: 'Home cooks',  desc: 'Turn cookbooks and nutrition labels into a kitchen-side assistant.' },
  { Icon: Dumbbell,     title: 'Coaches',     desc: 'Build meal guidance on evidence, not on whatever trended this week.' },
]

const questions = [
  'Which foods are highest in iron per serving?',
  'Compare whey and pea protein absorption.',
  'What do my guidelines say about sodium limits?',
  'Summarize the omega-3 findings in this review.',
]

const faqs = [
  { q: 'Which files can I upload?', a: 'PDF and plain-text files, up to 10 MB each. Each file is split into chunks and indexed for search.' },
  { q: 'Is my library shared with anyone?', a: 'No. Documents live in your own project space and answers are drawn only from what you uploaded.' },
  { q: 'Which AI models power the answers?', a: 'Cohere or OpenAI, chosen in the server configuration. The same retrieval pipeline feeds either one.' },
  { q: 'Is this medical advice?', a: 'No. Hearthwise summarizes the documents you provide. Talk to a qualified professional before changing your diet or treatment.' },
]
