import { useEffect, useState } from 'react'
import { AnimatePresence, animate, motion } from 'motion/react'

const KEY = 'noor-preloaded'

export function alreadyShown() {
  try {
    return sessionStorage.getItem(KEY) === '1'
  } catch {
    return false
  }
}

export function Preloader() {
  const [visible, setVisible] = useState(() => !alreadyShown())
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!visible) {
      document.body.style.overflow = ''
      return
    }
    document.body.style.overflow = 'hidden'
    const controls = animate(0, 100, {
      duration: 2.4,
      ease: [0.65, 0, 0.35, 1],
      onUpdate: (value) => setCount(Math.round(value)),
      onComplete: () => {
        window.setTimeout(() => {
          setVisible(false)
          try {
            sessionStorage.setItem(KEY, '1')
          } catch {
            return
          }
        }, 250)
      },
    })
    return () => {
      controls.stop()
      document.body.style.overflow = ''
    }
  }, [visible])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="preloader"
          exit={{ clipPath: 'inset(0 0 100% 0)' }}
          transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }}
          style={{ clipPath: 'inset(0 0 0% 0)' }}
          className="fixed inset-0 z-[90] flex flex-col items-center justify-center bg-forest-dark text-cream"
        >
          <svg viewBox="0 0 400 120" className="h-28 w-[340px] text-moss-light">
            <motion.path
              d="M0 60h110l18-38 30 82 24-62 16 18h202"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2.2, ease: 'easeInOut' }}
            />
          </svg>
          <p className="mt-6 font-display text-5xl tracking-[0.3em]">NOOR</p>
          <p className="mt-2 text-[11px] uppercase tracking-[0.4em] text-cream/50">Medical center</p>
          <p className="mt-6 font-display text-xl tabular-nums text-cream/60">{count}</p>
          <div className="mt-3 h-px w-48 bg-cream/15">
            <div className="h-px bg-clay" style={{ width: `${count}%` }} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
