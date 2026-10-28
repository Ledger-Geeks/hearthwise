import React from 'react'
import { motion } from 'framer-motion'

const INK = '#26150e'
const CREAM = '#fdfaf5'
const BLUSH = '#f47260'
const LEAF = '#8aa05a'
const loop = { repeat: Infinity, ease: 'easeInOut' }

// framer-motion only measures an SVG element (needed to apply transforms) on first render
// if a transform value already exists then. Without an initial transform, y/rotate/scale
// are silently dropped and only opacity animates. So every SVG motion element starts here.
const T0 = { x: 0, y: 0, rotate: 0, scale: 1, scaleX: 1, scaleY: 1 }

// Bob up and down with an optional wiggle
const float = (dy, duration, delay = 0, rot = 0) => ({
  animate: { y: [0, -dy, 0], rotate: rot ? [-rot, rot, -rot] : 0 },
  transition: { duration, delay, ...loop },
})

/* ── Shared pieces ───────────────────────────────────────────── */
function Face({ x, y, gap, r = 3.5, smile = 7, eye = INK, blush = true }) {
  return (
    <g>
      <motion.g initial={T0} animate={{ scaleY: [1, 1, 0.1, 1, 1] }}
        transition={{ duration: 4.5, times: [0, 0.9, 0.93, 0.96, 1], repeat: Infinity, delay: (x % 7) * 0.3 }}>
        <circle cx={x - gap} cy={y} r={r} fill={eye} />
        <circle cx={x + gap} cy={y} r={r} fill={eye} />
      </motion.g>
      {blush && <ellipse cx={x - gap - 5} cy={y + 7} rx={4} ry={2.5} fill={BLUSH} opacity="0.6" />}
      {blush && <ellipse cx={x + gap + 5} cy={y + 7} rx={4} ry={2.5} fill={BLUSH} opacity="0.6" />}
      <path d={`M${x - smile} ${y + 8} Q${x} ${y + 8 + smile * 0.8} ${x + smile} ${y + 8}`}
        stroke={eye} strokeWidth="2.5" strokeLinecap="round" fill="none" />
    </g>
  )
}

function Sparkle({ x, y, delay }) {
  return (
    <motion.path initial={T0}
      d={`M${x} ${y - 9} L${x + 2.5} ${y - 2.5} L${x + 9} ${y} L${x + 2.5} ${y + 2.5} L${x} ${y + 9} L${x - 2.5} ${y + 2.5} L${x - 9} ${y} L${x - 2.5} ${y - 2.5} Z`}
      fill="#fed7aa"
      animate={{ opacity: [0.2, 1, 0.2], scale: [0.6, 1.25, 0.6], rotate: [0, 90, 0] }}
      transition={{ duration: 2.2, delay, ...loop }}
    />
  )
}

// Flame mascot drawn around (200, 150); sways from its base, breathes, blinks
function Mascot({ wave = false, hat = false }) {
  return (
    <motion.g initial={T0} animate={{ rotate: [-4, 4, -4] }} transition={{ duration: 3.2, ...loop }} style={{ originX: 0.5, originY: 1 }}>
      <motion.g initial={T0} animate={{ scaleY: [1, 1.06, 1], scaleX: [1, 0.96, 1] }} transition={{ duration: 1.4, ...loop }}
        style={{ originX: 0.5, originY: 1 }}>
        <path d="M200 38 C232 86 282 110 277 176 C274 226 240 256 200 256 C160 256 126 226 123 176 C120 130 158 114 170 74 C181 96 188 104 200 38 Z"
          fill="url(#hw-flame)" />
        <motion.path initial={T0}
          d="M200 122 C220 152 246 166 241 202 C238 229 221 243 200 243 C179 243 162 229 159 202 C156 176 184 161 200 122 Z"
          fill="#fed7aa" opacity="0.85"
          animate={{ scaleY: [1, 1.1, 0.96, 1], scaleX: [1, 0.95, 1.02, 1] }}
          transition={{ duration: 1.1, ...loop }}
          style={{ originY: 1 }}
        />
      </motion.g>

      {/* Eyes blink every few seconds */}
      <motion.g initial={T0} animate={{ scaleY: [1, 1, 0.08, 1, 1] }}
        transition={{ duration: 3.6, times: [0, 0.88, 0.91, 0.94, 1], repeat: Infinity }}>
        <ellipse cx="180" cy="186" rx="9" ry="12" fill={INK} />
        <ellipse cx="220" cy="186" rx="9" ry="12" fill={INK} />
        <circle cx="183" cy="181" r="3.2" fill="#fff" />
        <circle cx="223" cy="181" r="3.2" fill="#fff" />
      </motion.g>
      <ellipse cx="166" cy="208" rx="10" ry="6" fill={BLUSH} opacity="0.6" />
      <ellipse cx="234" cy="208" rx="10" ry="6" fill={BLUSH} opacity="0.6" />
      <path d="M186 208 Q200 224 214 208" stroke={INK} strokeWidth="4" strokeLinecap="round" fill="none" />

      {wave && (
        <motion.g initial={T0} animate={{ rotate: [0, 24, -6, 24, -6, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 0.6, ease: 'easeInOut' }}
          style={{ originX: 0, originY: 1 }}>
          <path d="M266 186 Q292 166 298 140" stroke="#f97316" strokeWidth="11" strokeLinecap="round" fill="none" />
          <circle cx="298" cy="136" r="10" fill="#fb923c" />
        </motion.g>
      )}
      {!hat && <path d="M134 192 Q118 214 132 232" stroke="#f97316" strokeWidth="11" strokeLinecap="round" fill="none" />}

      {hat && (
        <motion.g initial={T0} animate={{ rotate: [-6, 6, -6] }} transition={{ duration: 2.4, ...loop }} style={{ originX: 0.5, originY: 1 }}>
          <circle cx="176" cy="36" r="17" fill={CREAM} />
          <circle cx="200" cy="24" r="21" fill={CREAM} />
          <circle cx="224" cy="36" r="17" fill={CREAM} />
          <rect x="166" y="42" width="68" height="18" rx="6" fill={CREAM} />
          <path d="M172 52 H228" stroke="#e9dccd" strokeWidth="3" strokeLinecap="round" />
        </motion.g>
      )}
    </motion.g>
  )
}

function Ember({ x, y, delay, drift }) {
  return (
    <motion.circle initial={T0} cx={x} cy={y} r="4" fill="#fdba74"
      animate={{ y: [0, -70], x: [0, drift], opacity: [0, 1, 0], scale: [1, 0.4] }}
      transition={{ duration: 2.2, delay, repeat: Infinity, ease: 'easeOut' }}
    />
  )
}

const Apple = () => (
  <g>
    <path d="M70 96 C55 83 35 93 38 116 C41 139 58 151 70 145 C82 151 99 139 102 116 C105 93 85 83 70 96 Z" fill="#e25d3a" />
    <path d="M70 96 Q72 85 77 80" stroke="#6f3e24" strokeWidth="3.5" strokeLinecap="round" fill="none" />
    <path d="M75 87 Q89 76 94 87 Q83 95 75 87 Z" fill={LEAF} />
    <ellipse cx="56" cy="106" rx="6" ry="9" fill="#fff" opacity="0.25" />
    <Face x={70} y={116} gap={8} />
  </g>
)

const Carrot = () => (
  <g transform="rotate(18 332 108)">
    <path d="M325 86 Q318 68 322 58 M331 86 Q331 64 337 56 M337 86 Q346 70 353 68"
      stroke={LEAF} strokeWidth="5" strokeLinecap="round" fill="none" />
    <path d="M318 86 L344 86 Q349 92 342 112 L334 144 Q331 151 328 144 L320 112 Q313 92 318 86 Z" fill="#f97316" />
    <path d="M322 120 L329 118 M336 128 L342 126" stroke="#c2410c" strokeWidth="2.5" strokeLinecap="round" />
    <Face x={331} y={100} gap={6} r={3} smile={5} />
  </g>
)

const Avocado = () => (
  <g>
    <path d="M335 205 C352 205 362 228 365 250 C368 275 352 292 335 292 C318 292 302 275 305 250 C308 228 318 205 335 205 Z" fill="#6b7f3a" />
    <path d="M335 214 C348 214 356 233 358 252 C360 272 348 284 335 284 C322 284 310 272 312 252 C314 233 322 214 335 214 Z" fill="#d9e3a0" />
    <circle cx="335" cy="258" r="17" fill="#8b4f2c" />
    <Face x={335} y={253} gap={6} r={2.6} smile={5} eye={CREAM} blush={false} />
  </g>
)

const Egg = () => (
  <g>
    <ellipse cx="62" cy="262" rx="25" ry="31" fill={CREAM} />
    <ellipse cx="54" cy="250" rx="6" ry="10" fill="#fff" />
    <Face x={62} y={262} gap={7} />
  </g>
)

/* ── Sign in: mascot reading on a stack of books ─────────────── */
function ReadingScene() {
  return (
    <>
      <ellipse cx="200" cy="330" rx="125" ry="10" fill="#000" opacity="0.25" />
      <rect x="110" y="290" width="180" height="32" rx="9" fill="#6f3e24" />
      <rect x="120" y="297" width="160" height="7" rx="3.5" fill={CREAM} opacity="0.85" />
      <rect x="124" y="262" width="156" height="30" rx="9" fill="#a0623b" />
      <rect x="133" y="269" width="138" height="6" rx="3" fill={CREAM} opacity="0.85" />
      <g transform="rotate(-4 205 252)">
        <rect x="140" y="238" width="132" height="26" rx="8" fill="#d2a985" />
        <rect x="148" y="245" width="116" height="5" rx="2.5" fill={CREAM} opacity="0.9" />
      </g>

      <motion.g initial={T0} {...float(10, 2.6)}>
        <g transform="translate(0 -14)">
          <Mascot wave />
          <Ember x={200} y={44} delay={0} drift={-14} />
          <Ember x={190} y={60} delay={0.7} drift={12} />
          <Ember x={210} y={58} delay={1.4} drift={-6} />
        </g>
      </motion.g>

      <motion.g initial={T0} {...float(16, 2.8, 0.2, 8)}><Apple /></motion.g>
      <motion.g initial={T0} {...float(14, 2.4, 0.9, 10)}><Carrot /></motion.g>
      <motion.g initial={T0} {...float(12, 3, 0.5, 7)}><Avocado /></motion.g>
      <motion.g initial={T0} {...float(18, 2.6, 1.3, 9)}><Egg /></motion.g>

      <Sparkle x={130} y={58} delay={0} />
      <Sparkle x={282} y={34} delay={0.8} />
      <Sparkle x={30} y={190} delay={1.4} />
      <Sparkle x={378} y={170} delay={0.4} />
    </>
  )
}

/* ── Register: chef mascot stirring a pot, food hops in ──────── */
// Each buddy rests, arcs into the pot (150, 228), vanishes, and fades back in
function Hop({ children, dx, dy, peak, delay }) {
  const times = [0, 0.35, 0.55, 0.7, 0.85, 1]
  return (
    <motion.g initial={T0}
      animate={{
        x: [0, 0, dx / 2, dx, 0, 0],
        y: [0, 0, peak, dy, 0, 0],
        opacity: [1, 1, 1, 0, 0, 1],
        scale: [1, 1, 1.05, 0.4, 0.4, 1],
      }}
      transition={{
        duration: 3.6, delay, times, repeat: Infinity,
        y: { duration: 3.6, delay, times, repeat: Infinity, ease: ['linear', 'easeOut', 'easeIn', 'linear', 'linear'] },
      }}
    >
      {children}
    </motion.g>
  )
}

function Steam({ x, delay }) {
  return (
    <motion.path initial={T0} d={`M${x} 214 q-8 -12 0 -24 q8 -12 0 -24`}
      stroke={CREAM} strokeWidth="4" strokeLinecap="round" fill="none"
      animate={{ y: [0, -22], opacity: [0, 0.75, 0] }}
      transition={{ duration: 2.4, delay, repeat: Infinity, ease: 'easeOut' }}
    />
  )
}

function CookingScene() {
  return (
    <>
      <ellipse cx="200" cy="330" rx="160" ry="10" fill="#000" opacity="0.25" />

      {/* Soup surface + bubbles */}
      <ellipse cx="150" cy="232" rx="74" ry="9" fill="#f97316" />
      {[[125, 231, 0], [152, 228, 0.6], [178, 232, 1.2]].map(([cx, cy, d]) => (
        <motion.circle initial={T0} key={cx} cx={cx} cy={cy} r="5" fill="#fdba74"
          animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
          transition={{ duration: 1.4, delay: d, repeat: Infinity, ease: 'easeOut' }} />
      ))}
      <Steam x={124} delay={0} />
      <Steam x={150} delay={0.8} />
      <Steam x={176} delay={1.6} />

      {/* Food hopping into the pot (drawn before the pot front so they drop inside) */}
      <Hop dx={100} dy={138} peak={-50} delay={0}>
        <g transform="translate(-20 -26)"><Apple /></g>
      </Hop>
      <Hop dx={105} dy={58} peak={-80} delay={1.2}>
        <g transform="translate(-286 62)"><Carrot /></g>
      </Hop>
      <Hop dx={130} dy={-22} peak={-110} delay={2.4}>
        <g transform="translate(-42 -12)"><Egg /></g>
      </Hop>

      {/* Stirring spoon */}
      <motion.g initial={T0} animate={{ rotate: [-9, 9, -9] }} transition={{ duration: 1.5, ...loop }}
        style={{ originX: 0.95, originY: 0.86 }}>
        <path d="M236 243 L172 223" stroke="#d2a985" strokeWidth="6" strokeLinecap="round" />
        <ellipse cx="166" cy="222" rx="10" ry="6" fill="#d2a985" />
      </motion.g>

      {/* Pot front */}
      <rect x="48" y="250" width="28" height="11" rx="5.5" fill="#8b4f2c" />
      <rect x="224" y="250" width="28" height="11" rx="5.5" fill="#8b4f2c" />
      <path d="M72 236 H228 V286 Q228 314 200 314 H100 Q72 314 72 286 Z" fill="#6f3e24" />
      <rect x="86" y="252" width="128" height="6" rx="3" fill={CREAM} opacity="0.2" />
      <rect x="64" y="226" width="172" height="16" rx="8" fill="#8b4f2c" />

      {/* Chef mascot */}
      <g transform="translate(165 148) scale(0.7)">
        <motion.g initial={T0} {...float(8, 2)}>
          <Mascot hat />
        </motion.g>
      </g>
      {/* Arm holding the spoon */}
      <path d="M258 272 Q244 258 238 246" stroke="#f97316" strokeWidth="9" strokeLinecap="round" fill="none" />
      <circle cx="236" cy="243" r="7" fill="#fb923c" />

      <motion.g initial={T0} {...float(10, 2.8, 0.4, 8)}>
        <g transform="translate(350 70) scale(0.6) translate(-335 -250)"><Avocado /></g>
      </motion.g>

      <Sparkle x={40} y={40} delay={0} />
      <Sparkle x={250} y={60} delay={0.7} />
      <Sparkle x={385} y={175} delay={1.3} />
      <Sparkle x={24} y={320} delay={0.4} />
    </>
  )
}

/* ── Dashboard: food friends orbiting a waving mascot ─────────── */
// Ring spins; each buddy counter-spins so it stays upright
const ORBIT = [
  { Buddy: Apple,   cx: 70,  cy: 116, x: 330, y: 175 },
  { Buddy: Carrot,  cx: 331, cy: 108, x: 200, y: 42 },
  { Buddy: Avocado, cx: 335, cy: 250, x: 70,  y: 175 },
  { Buddy: Egg,     cx: 62,  cy: 262, x: 200, y: 308 },
]

function OrbitScene() {
  const spin = { duration: 18, repeat: Infinity, ease: 'linear' }
  return (
    <>
      <circle cx="200" cy="175" r="133" fill="none" stroke={CREAM} strokeOpacity="0.15" strokeWidth="2" strokeDasharray="6 10" />
      <motion.g initial={T0} animate={{ rotate: 360 }} transition={spin}>
        {ORBIT.map(({ Buddy, cx, cy, x, y }) => (
          <g key={x + y} transform={`translate(${x} ${y})`}>
            <motion.g initial={T0} animate={{ rotate: -360 }} transition={spin}>
              <g transform={`scale(0.55) translate(${-cx} ${-cy})`}><Buddy /></g>
            </motion.g>
          </g>
        ))}
      </motion.g>
      <g transform="translate(200 182) scale(0.72) translate(-200 -150)">
        <motion.g {...float(10, 2.4)} initial={T0}>
          <Mascot wave />
        </motion.g>
      </g>
      <Sparkle x={60} y={50} delay={0} />
      <Sparkle x={345} y={60} delay={0.9} />
      <Sparkle x={355} y={300} delay={0.5} />
      <Sparkle x={45} y={295} delay={1.4} />
    </>
  )
}

const LABELS = {
  reading: 'Hearthwise flame mascot waving from a stack of books, surrounded by smiling fruits and vegetables',
  cooking: 'Hearthwise flame mascot in a chef hat stirring a pot while fruits and vegetables hop in',
  orbit: 'Hearthwise flame mascot waving while smiling fruits and vegetables circle around it',
}

export default function AuthIllustration({ scene = 'reading', className = '' }) {
  const label = LABELS[scene] || LABELS.reading
  return (
    <svg viewBox="0 0 400 350" className={className} role="img" aria-label={label}>
      <defs>
        <linearGradient id="hw-flame" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fdba74" />
          <stop offset="55%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#ea580c" />
        </linearGradient>
      </defs>
      {scene === 'cooking' ? <CookingScene /> : scene === 'orbit' ? <OrbitScene /> : <ReadingScene />}
    </svg>
  )
}
