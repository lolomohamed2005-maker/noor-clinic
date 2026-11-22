import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { Award, CalendarDays, Clock, GraduationCap } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { departmentLabel } from '../lib/departments'
import { formatFee } from '../lib/format'
import { formatTime } from '../lib/schedule'
import { Reveal } from '../components/ui/Reveal'
import { Magnetic } from '../components/ui/Magnetic'
import type { DoctorRow } from '../types/database'

export function DoctorDetail() {
  const { slug } = useParams<{ slug: string }>()
  const [doctor, setDoctor] = useState<DoctorRow | null>(null)
  const [missing, setMissing] = useState(false)
  const [active, setActive] = useState(0)

  useEffect(() => {
    if (!slug) return
    setDoctor(null)
    setMissing(false)
    setActive(0)
    supabase
      .from('doctors')
      .select('*')
      .eq('slug', slug)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setDoctor(data)
        else setMissing(true)
      })
  }, [slug])

  if (missing) {
    return (
      <div className="mx-auto max-w-md px-6 pb-24 pt-40 text-center">
        <h1 className="text-4xl text-forest">Doctor not found</h1>
        <Link to="/doctors" className="mt-6 inline-block text-sm text-clay underline">
          Back to all doctors
        </Link>
      </div>
    )
  }

  if (!doctor) {
    return <div className="mx-auto max-w-7xl px-6 pb-24 pt-40 text-sm text-ink/50">Loading...</div>
  }

  return (
    <div className="mx-auto max-w-7xl px-6 pb-24 pt-32">
      <div className="grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <div className="relative aspect-[4/5] overflow-hidden rounded-t-[999px] bg-sand">
            <AnimatePresence mode="wait">
              <motion.img
                key={doctor.images[active]}
                src={doctor.images[active]}
                alt={doctor.name}
                initial={{ opacity: 0, scale: 1.08 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="absolute inset-0 h-full w-full object-cover object-top"
              />
            </AnimatePresence>
          </div>
          {doctor.images.length > 1 && (
            <div className="mt-4 flex justify-center gap-3">
              {doctor.images.map((image, index) => (
                <button
                  key={image}
                  onClick={() => setActive(index)}
                  className={`h-16 w-16 overflow-hidden rounded-full ring-2 transition-all ${
                    active === index ? 'ring-clay' : 'ring-transparent opacity-60'
                  }`}
                >
                  <img src={image} alt="" className="h-full w-full object-cover object-top" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-7">
          <Reveal>
            <p className="text-[11px] uppercase tracking-[0.4em] text-clay">{departmentLabel[doctor.department]}</p>
            <h1 className="mt-3 text-5xl text-forest md:text-6xl">{doctor.name}</h1>
            <p className="mt-2 text-lg text-ink/60">{doctor.title}</p>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-sand p-5">
                <Award size={20} className="text-moss" />
                <p className="mt-3 font-display text-3xl text-forest">{doctor.experience_years} years</p>
                <p className="text-xs uppercase tracking-[0.2em] text-ink/50">Experience</p>
              </div>
              <div className="rounded-2xl bg-sand p-5">
                <Clock size={20} className="text-moss" />
                <p className="mt-3 font-display text-3xl text-forest">{formatFee(doctor.fee)}</p>
                <p className="text-xs uppercase tracking-[0.2em] text-ink/50">Consultation</p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <p className="mt-8 leading-relaxed text-ink/70">{doctor.bio || doctor.summary}</p>
          </Reveal>

          {doctor.expertise.length > 0 && (
            <Reveal delay={0.2}>
              <h2 className="mt-10 text-2xl text-forest">Areas of expertise</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {doctor.expertise.map((entry) => (
                  <span key={entry} className="rounded-full border border-line bg-white px-4 py-1.5 text-sm">
                    {entry}
                  </span>
                ))}
              </div>
            </Reveal>
          )}

          {doctor.education.length > 0 && (
            <Reveal delay={0.25}>
              <h2 className="mt-10 text-2xl text-forest">Education</h2>
              <ul className="mt-4 space-y-2 text-sm text-ink/70">
                {doctor.education.map((entry) => (
                  <li key={entry} className="flex items-center gap-3">
                    <GraduationCap size={16} className="shrink-0 text-moss" />
                    {entry}
                  </li>
                ))}
              </ul>
            </Reveal>
          )}

          <Reveal delay={0.3}>
            <h2 className="mt-10 text-2xl text-forest">Availability</h2>
            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
              <CalendarDays size={16} className="text-moss" />
              {doctor.available_days.length > 0 ? doctor.available_days.join(', ') : 'Contact us for availability'}
            </div>
            {doctor.time_slots.length > 0 && (
              <p className="mt-2 text-sm text-ink/60">
                {formatTime(doctor.time_slots[0])} to {formatTime(doctor.time_slots[doctor.time_slots.length - 1])}
              </p>
            )}
          </Reveal>

          <Reveal delay={0.35}>
            <Magnetic className="mt-10 inline-block">
              <Link
                to={`/book?doctor=${doctor.slug}`}
                className="inline-block rounded-full bg-clay px-10 py-4 text-sm font-medium text-white"
              >
                Book with {doctor.name}
              </Link>
            </Magnetic>
          </Reveal>
        </div>
      </div>
    </div>
  )
}
