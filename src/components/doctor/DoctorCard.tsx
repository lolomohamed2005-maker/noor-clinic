import { Link } from 'react-router-dom'
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react'
import { ArrowUpRight, Award } from 'lucide-react'
import { formatFee } from '../../lib/format'
import { departmentLabel } from '../../lib/departments'
import type { DoctorRow } from '../../types/database'

export function DoctorCard({ doctor, index = 0 }: { doctor: DoctorRow; index?: number }) {
  const px = useMotionValue(0.5)
  const py = useMotionValue(0.5)
  const rx = useSpring(useTransform(py, [0, 1], [6, -6]), { stiffness: 220, damping: 20 })
  const ry = useSpring(useTransform(px, [0, 1], [-6, 6]), { stiffness: 220, damping: 20 })

  function handleMove(event: React.PointerEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect()
    px.set((event.clientX - rect.left) / rect.width)
    py.set((event.clientY - rect.top) / rect.height)
  }

  function handleLeave() {
    px.set(0.5)
    py.set(0.5)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.8, delay: (index % 3) * 0.1, ease: [0.22, 1, 0.36, 1] }}
      style={{ perspective: 900 }}
    >
      <Link to={`/doctor/${doctor.slug}`} className="group block">
        <motion.div
          onPointerMove={handleMove}
          onPointerLeave={handleLeave}
          style={{ rotateX: rx, rotateY: ry, transformStyle: 'preserve-3d' }}
          className="overflow-hidden rounded-3xl bg-white ring-1 ring-line transition-shadow duration-500 group-hover:shadow-[0_40px_70px_-35px_rgba(6,50,59,0.5)]"
        >
          <div className="relative aspect-[4/5] overflow-hidden bg-sand">
            <img
              src={doctor.images[0]}
              alt={doctor.name}
              loading="lazy"
              className="h-full w-full object-cover object-top transition-transform duration-[1200ms] ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-forest-dark/70 via-transparent to-transparent" />
            <span className="absolute left-3 top-3 rounded-full bg-cream/95 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-forest">
              {departmentLabel[doctor.department]}
            </span>
            <span className="absolute bottom-3 right-3 flex h-11 w-11 translate-y-3 items-center justify-center rounded-full bg-clay text-cream opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
              <ArrowUpRight size={18} />
            </span>
            <div className="absolute bottom-4 left-4 right-16 text-cream">
              <p className="font-display text-2xl leading-tight">{doctor.name}</p>
              <p className="mt-0.5 text-xs text-cream/80">{doctor.title}</p>
            </div>
          </div>
          <div className="flex items-center justify-between px-5 py-4 text-sm">
            <span className="flex items-center gap-1.5 text-ink/60">
              <Award size={15} strokeWidth={1.6} />
              {doctor.experience_years} years
            </span>
            <span className="font-medium text-forest">{formatFee(doctor.fee)}</span>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  )
}
