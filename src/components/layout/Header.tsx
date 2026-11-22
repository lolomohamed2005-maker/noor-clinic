import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react'
import { ChevronDown, Menu, Phone, X } from 'lucide-react'
import { departments } from '../../lib/departments'
import { useSiteSettings } from '../../hooks/useSiteSettings'

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [hidden, setHidden] = useState(false)
  const { scrollY } = useScroll()
  const { settings } = useSiteSettings()
  const phone = settings.phone_number

  useMotionValueEvent(scrollY, 'change', (latest) => {
    const previous = scrollY.getPrevious() ?? 0
    setHidden(latest > previous && latest > 200)
  })

  return (
    <motion.header
      animate={{ y: hidden ? '-100%' : 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-x-0 top-0 z-40 border-b border-line bg-cream/85 text-ink backdrop-blur-xl"
    >
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-6">
        <Link to="/" className="group flex items-center gap-2.5">
          <svg viewBox="0 0 64 64" className="h-9 w-9 transition-transform duration-700 group-hover:rotate-90" aria-hidden="true">
            <rect width="64" height="64" rx="18" className="fill-forest" />
            <rect x="27" y="14" width="10" height="36" rx="4" className="fill-cream" />
            <rect x="14" y="27" width="36" height="10" rx="4" className="fill-cream" />
            <circle cx="48" cy="16" r="4" className="fill-clay" />
          </svg>
          <span className="font-display text-3xl tracking-[0.16em] text-forest">NOOR</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <NavLink to="/doctors" end className="text-sm tracking-wide opacity-80 hover:opacity-100">
            All doctors
          </NavLink>
          <div className="group relative">
            <button className="flex items-center gap-1 text-sm tracking-wide opacity-80 hover:opacity-100">
              Departments <ChevronDown size={14} />
            </button>
            <div className="invisible absolute left-1/2 top-full w-64 -translate-x-1/2 pt-4 opacity-0 transition-all duration-300 group-hover:visible group-hover:opacity-100">
              <div className="rounded-2xl bg-white p-2 shadow-2xl ring-1 ring-line">
                {departments.map((item) => (
                  <Link
                    key={item.value}
                    to={`/doctors/${item.value}`}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm hover:bg-sand"
                  >
                    <item.icon size={18} strokeWidth={1.6} className="text-moss" />
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          {phone && (
            <a href={`tel:${phone}`} className="flex items-center gap-2 text-sm text-forest">
              <Phone size={15} strokeWidth={1.8} />
              {phone}
            </a>
          )}
          <Link
            to="/book"
            className="rounded-full bg-clay px-6 py-2.5 text-sm font-medium text-white transition-transform duration-300 hover:scale-105"
          >
            Book appointment
          </Link>
        </nav>

        <button className="p-2 md:hidden" onClick={() => setMenuOpen(true)} aria-label="Open menu">
          <Menu size={24} strokeWidth={1.5} />
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-ink/60 text-cream md:hidden"
            onClick={() => setMenuOpen(false)}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 260, damping: 30 }}
              className="ml-auto flex h-full w-80 flex-col gap-5 overflow-y-auto bg-forest p-6"
              onClick={(event) => event.stopPropagation()}
            >
              <button className="self-end p-2" onClick={() => setMenuOpen(false)} aria-label="Close menu">
                <X size={24} strokeWidth={1.5} />
              </button>
              <NavLink to="/doctors" onClick={() => setMenuOpen(false)} className="font-display text-3xl">
                All doctors
              </NavLink>
              {departments.map((item, index) => (
                <motion.div
                  key={item.value}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.08 + index * 0.05 }}
                >
                  <NavLink
                    to={`/doctors/${item.value}`}
                    onClick={() => setMenuOpen(false)}
                    className="text-lg text-cream/80"
                  >
                    {item.label}
                  </NavLink>
                </motion.div>
              ))}
              <NavLink
                to="/book"
                onClick={() => setMenuOpen(false)}
                className="mt-2 rounded-full bg-clay px-6 py-3 text-center text-sm font-medium text-white"
              >
                Book appointment
              </NavLink>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
