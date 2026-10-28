import React, { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Flame, X, Send, Sparkles } from 'lucide-react'
import { demoApi } from '../services/api'

/* Scripted demo that plays the first time the widget opens */
const DEMO_SCRIPT = [
  { role: 'user', content: 'Is quinoa a complete protein?' },
  { role: 'assistant', content: 'Yes — quinoa contains all nine essential amino acids, with about 8g of protein per cooked cup. Signed in, I can answer from your own uploaded guides and papers.' },
]

const ERRORS = {
  503: 'Live answers are off. Add OPENAI_API_KEY to src/.env and restart the backend.',
  429: 'Easy there — too many messages. Try again in a minute.',
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms))

export default function DemoChatbot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [typing, setTyping] = useState(false)
  const [demoDone, setDemoDone] = useState(false)
  const [input, setInput] = useState('')
  const scrollRef = useRef(null)
  const playedRef = useRef(false)

  // Play the scripted demo once, typing the assistant reply word by word.
  // Not cancelled on close: closing mid-demo must not leave the input disabled forever.
  useEffect(() => {
    if (!open || playedRef.current) return
    playedRef.current = true
    ;(async () => {
      await sleep(400)
      for (const msg of DEMO_SCRIPT) {
        if (msg.role === 'user') {
          setMessages(m => [...m, msg])
          setTyping(true)
          await sleep(900)
          continue
        }
        setTyping(false)
        setMessages(m => [...m, { role: 'assistant', content: '' }])
        for (const word of msg.content.split(' ')) {
          await sleep(45)
          setMessages(m => {
            const last = m[m.length - 1]
            return [...m.slice(0, -1), { ...last, content: last.content ? `${last.content} ${word}` : word }]
          })
        }
      }
      setDemoDone(true)
    })()
  }, [open])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, typing])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  async function send(e) {
    e.preventDefault()
    const text = input.trim()
    if (!text || typing) return
    // Errors shown in the chat are UI-only; don't send them back to the model
    const history = [...messages.filter(m => !m.error), { role: 'user', content: text }]
    setMessages(m => [...m, { role: 'user', content: text }])
    setInput('')
    setTyping(true)
    try {
      const { data } = await demoApi.chat(history.slice(-12))
      setMessages(m => [...m, { role: 'assistant', content: data.answer }])
    } catch (err) {
      const msg = ERRORS[err.response?.status] || 'Something went wrong. Is the backend running?'
      setMessages(m => [...m, { role: 'assistant', content: msg, error: true }])
    } finally {
      setTyping(false)
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-4">
      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog" aria-label="Hearthwise demo chat"
            initial={{ opacity: 0, y: 24, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            style={{ transformOrigin: 'bottom right' }}
            className="card w-[min(360px,calc(100vw-2.5rem))] h-[min(520px,calc(100vh-7rem))] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="band-blush theme-dark flex items-center gap-3 px-5 py-4">
              <div className="clay-orange w-9 h-9 rounded-2xl flex items-center justify-center">
                <Flame className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="font-display font-semibold text-fg leading-none">Hearthwise</p>
                <p className="text-2xs text-fg-muted mt-1 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" /> Demo assistant
                </p>
              </div>
              <button onClick={() => setOpen(false)} aria-label="Close chat" className="btn-icon text-fg-muted hover:text-fg">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {messages.map((m, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className={`flex ${m.role === 'user' ? 'justify-end' : ''}`}
                >
                  <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed
                    ${m.role === 'user' ? 'clay-orange rounded-br-md'
                      : m.error ? 'bg-red-500/10 text-red-700 rounded-bl-md'
                      : 'bg-ink-950 text-fg rounded-bl-md'}`}
                    style={m.role === 'user' || m.error ? undefined : { boxShadow: 'var(--clay-pressed)' }}
                  >
                    {m.content}
                  </div>
                </motion.div>
              ))}
              {typing && (
                <div className="flex gap-1 px-4 py-3 bg-ink-950 rounded-2xl rounded-bl-md w-fit" style={{ boxShadow: 'var(--clay-pressed)' }}>
                  {[0, 1, 2].map(i => (
                    <span key={i} className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.18}s` }} />
                  ))}
                </div>
              )}
              {demoDone && messages.length === DEMO_SCRIPT.length && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="text-center text-2xs text-fg-subtle flex items-center justify-center gap-1 pt-1"
                >
                  <Sparkles className="w-3 h-3 text-brand-500" /> That was a demo — now ask your own question
                </motion.p>
              )}
            </div>

            {/* Input */}
            <form onSubmit={send} className="p-3 flex gap-2 border-t border-line">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                maxLength={500}
                disabled={!demoDone}
                placeholder={demoDone ? 'Ask about food or nutrition…' : 'Watching the demo…'}
                aria-label="Message"
                className="input py-2"
              />
              <button type="submit" disabled={!demoDone || typing || !input.trim()} aria-label="Send"
                className="btn-primary px-3 py-2 shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Launcher */}
      <motion.button
        onClick={() => setOpen(o => !o)}
        aria-label={open ? 'Close demo chat' : 'Open demo chat'}
        aria-expanded={open}
        whileHover={{ scale: 1.08, rotate: -6 }}
        whileTap={{ scale: 0.92 }}
        className="clay-orange relative w-16 h-16 rounded-[1.6rem] flex items-center justify-center"
      >
        {!open && <span className="absolute inset-0 rounded-[1.6rem] bg-brand-500/40 animate-ping" />}
        <AnimatePresence mode="wait" initial={false}>
          <motion.span key={open ? 'x' : 'flame'}
            initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}
            className="relative"
          >
            {open ? <X className="w-6 h-6" /> : <Flame className="w-7 h-7" />}
          </motion.span>
        </AnimatePresence>
      </motion.button>
    </div>
  )
}
