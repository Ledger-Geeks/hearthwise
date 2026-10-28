import React from 'react'
import { motion } from 'framer-motion'

const wordUp = {
  hidden: { y: '110%' },
  show: { y: '0%', transition: { type: 'spring', stiffness: 170, damping: 22 } },
}

// Each word rises out of its own mask. Gradient goes on the word, not a parent:
// background-clip:text on a parent doesn't survive transformed children.
export default function WordReveal({ text, delay = 0, wordClassName = '', whenInView = false }) {
  const trigger = whenInView
    ? { initial: 'hidden', whileInView: 'show', viewport: { once: true, margin: '-80px' } }
    : { initial: 'hidden', animate: 'show' }
  return (
    <motion.span {...trigger} variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07, delayChildren: delay } } }}>
      {text.split(' ').map((w, i) => (
        <React.Fragment key={i}>
          <span className="inline-block overflow-hidden align-bottom py-[0.08em] -my-[0.08em]">
            <motion.span variants={wordUp} className={`inline-block ${wordClassName}`}>{w}</motion.span>
          </span>{' '}
        </React.Fragment>
      ))}
    </motion.span>
  )
}
