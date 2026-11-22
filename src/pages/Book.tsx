import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useDoctors } from '../hooks/useDoctors'
import { departments, departmentLabel } from '../lib/departments'
import { formatFee } from '../lib/format'
import { formatLongDate, formatTime, upcomingDates } from '../lib/schedule'
import { useSiteSettings } from '../hooks/useSiteSettings'
import { whatsappLink } from '../components/layout/WhatsAppButton'
import type { Department, DoctorRow } from '../types/database'

const ease = [0.22, 1, 0.36, 1] as const
const steps = ['Doctor', 'Date and time', 'Your details']
const fieldClass =
  'mt-1 w-full rounded-xl border border-line bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-forest'

export function Book() {
  const [params] = useSearchParams()
  const { doctors, loading } = useDoctors({})
  const { settings } = useSiteSettings()

  const [step, setStep] = useState(0)
  const [department, setDepartment] = useState<Department | 'all'>(() => {
    const value = params.get('department')
    return departments.some((item) => item.value === value) ? (value as Department) : 'all'
  })
  const [doctorId, setDoctorId] = useState<string | null>(null)
  const [date, setDate] = useState<string | null>(null)
  const [time, setTime] = useState<string | null>(null)
  const [taken, setTaken] = useState<string[]>([])
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [age, setAge] = useState('')
  const [reason, setReason] = useState('')
  const [trap, setTrap] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const preselected = params.get('doctor')

  useEffect(() => {
    if (!preselected || doctorId || doctors.length === 0) return
    const match = doctors.find((doctor) => doctor.slug === preselected)
    if (match) {
      setDoctorId(match.id)
      setDepartment(match.department)
      setStep(1)
    }
  }, [preselected, doctors, doctorId])

  const doctor: DoctorRow | undefined = doctors.find((entry) => entry.id === doctorId)
  const visibleDoctors = department === 'all' ? doctors : doctors.filter((entry) => entry.department === department)
  const dates = useMemo(() => (doctor ? upcomingDates(doctor.available_days) : []), [doctor])

  useEffect(() => {
    if (!doctor || !date) {
      setTaken([])
      return
    }
    let cancelled = false
    supabase.rpc('taken_slots', { p_doctor: doctor.id, p_date: date }).then(({ data }) => {
      if (!cancelled) setTaken(data ?? [])
    })
    return () => {
      cancelled = true
    }
  }, [doctor, date])

  function chooseDoctor(entry: DoctorRow) {
    setDoctorId(entry.id)
    setDate(null)
    setTime(null)
    setStep(1)
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!doctor || !date || !time || trap) return

    setSubmitting(true)
    setError(null)

    const { error: insertError } = await supabase.from('appointments').insert({
      doctor_id: doctor.id,
      doctor_name: doctor.name,
      department: departmentLabel[doctor.department],
      full_name: fullName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      age: age ? Number(age) : null,
      visit_date: date,
      visit_time: time,
      reason: reason.trim(),
    })

    setSubmitting(false)

    if (insertError) {
      if (insertError.code === '23505') {
        setError('Sorry, that time was just booked by someone else. Please choose another time.')
        setTime(null)
        setStep(1)
        const { data } = await supabase.rpc('taken_slots', { p_doctor: doctor.id, p_date: date })
        setTaken(data ?? [])
      } else {
        setError('Something went wrong. Please try again or call us.')
      }
      return
    }

    setDone(true)
  }

  if (done && doctor && date && time) {
    const whatsapp = settings.whatsapp_number
    return (
      <div className="mx-auto max-w-xl px-6 pb-24 pt-40 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 14 }}
          className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-moss text-white"
        >
          <svg viewBox="0 0 24 24" className="h-12 w-12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <motion.path d="M5 12.5l4.5 4.5L19 7.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.3, duration: 0.6 }} />
          </svg>
        </motion.div>
        <h1 className="mt-8 text-5xl text-forest">You are booked</h1>
        <p className="mt-4 text-ink/70">
          {doctor.name}
          <br />
          {formatLongDate(date)} at {formatTime(time)}
        </p>
        <p className="mt-4 text-sm text-ink/50">
          Our team will confirm your appointment shortly. Please arrive 10 minutes early.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {whatsapp && (
            <a
              href={whatsappLink(whatsapp, `Hello, I booked an appointment with ${doctor.name} on ${date} at ${formatTime(time)}. My name is ${fullName}.`)}
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-clay px-8 py-3 text-sm font-medium text-white"
            >
              Message us on WhatsApp
            </a>
          )}
          <Link to="/" className="rounded-full border border-forest px-8 py-3 text-sm text-forest">
            Back to home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-6 pb-24 pt-32">
      <p className="text-[11px] uppercase tracking-[0.4em] text-clay">Online booking</p>
      <h1 className="mt-3 text-5xl text-forest md:text-6xl">Book your appointment</h1>

      <div className="mt-10 flex items-center gap-3">
        {steps.map((label, index) => (
          <div key={label} className="flex flex-1 items-center gap-3">
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm transition-colors duration-500 ${
                index < step ? 'bg-moss text-white' : index === step ? 'bg-forest text-cream' : 'bg-sand text-ink/40'
              }`}
            >
              {index < step ? <Check size={16} /> : index + 1}
            </div>
            <span className={`hidden text-sm sm:block ${index === step ? 'text-forest' : 'text-ink/40'}`}>{label}</span>
            {index < steps.length - 1 && (
              <div className="h-px flex-1 bg-line">
                <motion.div
                  className="h-px origin-left bg-moss"
                  animate={{ scaleX: index < step ? 1 : 0 }}
                  transition={{ duration: 0.6, ease }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {error && <p className="mt-6 rounded-xl bg-clay/10 px-4 py-3 text-sm text-clay">{error}</p>}

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.4, ease }}
          className="mt-10"
        >
          {step === 0 && (
            <div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setDepartment('all')}
                  className={`rounded-full border px-4 py-1.5 text-sm ${department === 'all' ? 'border-forest bg-forest text-cream' : 'border-line'}`}
                >
                  All
                </button>
                {departments.map((item) => (
                  <button
                    key={item.value}
                    onClick={() => setDepartment(item.value)}
                    className={`rounded-full border px-4 py-1.5 text-sm ${department === item.value ? 'border-forest bg-forest text-cream' : 'border-line'}`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              {loading && <p className="mt-8 text-sm text-ink/50">Loading doctors...</p>}
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {visibleDoctors.map((entry) => (
                  <button
                    key={entry.id}
                    onClick={() => chooseDoctor(entry)}
                    className={`flex items-center gap-4 rounded-2xl border bg-white p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-lg ${
                      entry.id === doctorId ? 'border-forest' : 'border-line'
                    }`}
                  >
                    <img src={entry.images[0]} alt="" className="h-16 w-16 rounded-full bg-sand object-cover object-top" />
                    <div className="flex-1">
                      <p className="font-display text-xl text-forest">{entry.name}</p>
                      <p className="text-xs text-ink/60">{entry.title}</p>
                      <p className="mt-1 text-xs text-moss">{formatFee(entry.fee)}</p>
                    </div>
                    <ArrowRight size={16} className="text-ink/30" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 1 && doctor && (
            <div>
              <div className="flex items-center gap-4 rounded-2xl bg-sand p-4">
                <img src={doctor.images[0]} alt="" className="h-14 w-14 rounded-full object-cover object-top" />
                <div>
                  <p className="font-display text-xl text-forest">{doctor.name}</p>
                  <p className="text-xs text-ink/60">{doctor.title}</p>
                </div>
              </div>

              <h2 className="mt-8 text-2xl text-forest">Choose a day</h2>
              {dates.length === 0 && <p className="mt-3 text-sm text-ink/50">No working days set for this doctor yet.</p>}
              <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
                {dates.map((entry) => (
                  <button
                    key={entry.iso}
                    onClick={() => {
                      setDate(entry.iso)
                      setTime(null)
                    }}
                    className={`flex w-20 shrink-0 flex-col items-center rounded-2xl border py-3 transition-all ${
                      date === entry.iso ? 'border-forest bg-forest text-cream' : 'border-line bg-white hover:border-forest'
                    }`}
                  >
                    <span className="text-xs uppercase tracking-widest opacity-70">{entry.weekday}</span>
                    <span className="font-display text-3xl">{entry.day}</span>
                    <span className="text-xs opacity-70">{entry.month}</span>
                  </button>
                ))}
              </div>

              {date && (
                <>
                  <h2 className="mt-8 text-2xl text-forest">Choose a time</h2>
                  <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
                    {doctor.time_slots.map((slot) => {
                      const isTaken = taken.includes(slot)
                      return (
                        <button
                          key={slot}
                          disabled={isTaken}
                          onClick={() => setTime(slot)}
                          className={`rounded-xl border py-3 text-sm transition-colors ${
                            time === slot
                              ? 'border-clay bg-clay text-white'
                              : isTaken
                                ? 'border-line bg-sand/50 text-ink/30 line-through'
                                : 'border-line bg-white hover:border-forest'
                          }`}
                        >
                          {formatTime(slot)}
                        </button>
                      )
                    })}
                  </div>
                </>
              )}

              <div className="mt-10 flex justify-between">
                <button onClick={() => setStep(0)} className="flex items-center gap-2 text-sm text-ink/60">
                  <ArrowLeft size={16} /> Change doctor
                </button>
                <button
                  disabled={!date || !time}
                  onClick={() => setStep(2)}
                  className="rounded-full bg-forest px-8 py-3 text-sm text-cream transition-opacity disabled:opacity-30"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {step === 2 && doctor && date && time && (
            <form onSubmit={handleSubmit}>
              <div className="rounded-2xl bg-sand p-5 text-sm">
                <p className="font-display text-xl text-forest">{doctor.name}</p>
                <p className="mt-1 text-ink/70">
                  {formatLongDate(date)} at {formatTime(time)}
                </p>
                <p className="mt-1 text-ink/70">Consultation fee {formatFee(doctor.fee)}, paid at the clinic.</p>
              </div>

              <div className="mt-8 grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="text-sm text-ink/70">Full name</label>
                  <input required minLength={2} maxLength={120} value={fullName} onChange={(e) => setFullName(e.target.value)} className={fieldClass} />
                </div>
                <div>
                  <label className="text-sm text-ink/70">Phone number</label>
                  <input required minLength={6} maxLength={30} inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={fieldClass} />
                </div>
                <div>
                  <label className="text-sm text-ink/70">Email (optional)</label>
                  <input type="email" maxLength={160} value={email} onChange={(e) => setEmail(e.target.value)} className={fieldClass} />
                </div>
                <div>
                  <label className="text-sm text-ink/70">Age (optional)</label>
                  <input type="number" min="0" max="120" value={age} onChange={(e) => setAge(e.target.value)} className={fieldClass} />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-sm text-ink/70">Reason for visit (optional)</label>
                  <textarea rows={3} maxLength={1000} value={reason} onChange={(e) => setReason(e.target.value)} className={fieldClass} />
                </div>
                <input
                  tabIndex={-1}
                  autoComplete="off"
                  value={trap}
                  onChange={(e) => setTrap(e.target.value)}
                  className="absolute -left-[9999px] h-0 w-0 opacity-0"
                  aria-hidden="true"
                />
              </div>

              <div className="mt-10 flex justify-between">
                <button type="button" onClick={() => setStep(1)} className="flex items-center gap-2 text-sm text-ink/60">
                  <ArrowLeft size={16} /> Back
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-full bg-clay px-10 py-3 text-sm font-medium text-white transition-opacity disabled:opacity-50"
                >
                  {submitting ? 'Booking...' : 'Confirm appointment'}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
