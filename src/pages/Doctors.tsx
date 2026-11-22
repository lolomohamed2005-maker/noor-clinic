import { Link, useParams, useSearchParams } from 'react-router-dom'
import { motion } from 'motion/react'
import { Search } from 'lucide-react'
import { useDoctors } from '../hooks/useDoctors'
import { DoctorCard } from '../components/doctor/DoctorCard'
import { departments } from '../lib/departments'
import type { Department } from '../types/database'

export function Doctors() {
  const { department } = useParams<{ department: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const search = searchParams.get('q') ?? ''
  const active = departments.find((item) => item.value === department)
  const { doctors, loading, error } = useDoctors({
    department: active?.value as Department | undefined,
    search: search || undefined,
  })

  return (
    <div className="mx-auto max-w-7xl px-6 pb-24 pt-32">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <p className="text-[11px] uppercase tracking-[0.4em] text-clay">Our doctors</p>
        <h1 className="mt-3 text-5xl text-forest md:text-7xl">{active ? active.label : 'Meet the team'}</h1>
        <p className="mt-4 max-w-xl text-ink/60">{active ? active.note : 'Specialist doctors across six departments. Pick a doctor and book a time that suits you.'}</p>
      </motion.div>

      <div className="mt-10 flex flex-wrap items-center gap-2">
        <Link
          to="/doctors"
          className={`rounded-full border px-5 py-2 text-sm transition-colors ${
            !active ? 'border-forest bg-forest text-cream' : 'border-line hover:border-forest'
          }`}
        >
          All
        </Link>
        {departments.map((item) => (
          <Link
            key={item.value}
            to={`/doctors/${item.value}`}
            className={`flex items-center gap-2 rounded-full border px-5 py-2 text-sm transition-colors ${
              active?.value === item.value ? 'border-forest bg-forest text-cream' : 'border-line hover:border-forest'
            }`}
          >
            <item.icon size={15} strokeWidth={1.6} />
            {item.label}
          </Link>
        ))}
        <label className="relative ml-auto w-full md:w-64">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/40" />
          <input
            value={search}
            onChange={(event) => {
              const value = event.target.value
              setSearchParams(value ? { q: value } : {}, { replace: true })
            }}
            placeholder="Search by name"
            className="w-full rounded-full border border-line bg-white py-2.5 pl-11 pr-4 text-sm outline-none focus:border-forest"
          />
        </label>
      </div>

      {loading && <p className="mt-16 text-sm text-ink/50">Loading...</p>}
      {error && <p className="mt-16 text-sm text-clay">{error}</p>}
      {!loading && !error && doctors.length === 0 && (
        <p className="mt-16 text-sm text-ink/50">No doctors match your search.</p>
      )}

      <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {doctors.map((doctor, index) => (
          <DoctorCard key={doctor.id} doctor={doctor} index={index} />
        ))}
      </div>
    </div>
  )
}
