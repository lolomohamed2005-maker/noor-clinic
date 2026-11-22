import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { formatLongDate, formatTime } from '../../lib/schedule'
import type { AppointmentRow, AppointmentStatus } from '../../types/database'

const statuses: { value: AppointmentStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'new', label: 'New' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
]

const badge: Record<AppointmentStatus, string> = {
  new: 'bg-clay/15 text-clay',
  confirmed: 'bg-moss/20 text-forest',
  completed: 'bg-ink/10 text-ink/70',
  cancelled: 'bg-ink/5 text-ink/40 line-through',
}

export function AppointmentsPanel() {
  const [rows, setRows] = useState<AppointmentRow[]>([])
  const [filter, setFilter] = useState<AppointmentStatus | 'all'>('new')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    const { data, error: queryError } = await supabase
      .from('appointments')
      .select('*')
      .order('visit_date', { ascending: true })
      .order('visit_time', { ascending: true })
    if (queryError) setError(queryError.message)
    else setRows(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  async function setStatus(row: AppointmentRow, status: AppointmentStatus) {
    const { error: updateError } = await supabase.from('appointments').update({ status }).eq('id', row.id)
    if (updateError) {
      setError(updateError.message)
      return
    }
    setRows((current) => current.map((entry) => (entry.id === row.id ? { ...entry, status } : entry)))
  }

  async function remove(row: AppointmentRow) {
    if (!confirm(`Delete the appointment of ${row.full_name}?`)) return
    const { error: deleteError } = await supabase.from('appointments').delete().eq('id', row.id)
    if (deleteError) {
      setError(deleteError.message)
      return
    }
    setRows((current) => current.filter((entry) => entry.id !== row.id))
  }

  const visible = filter === 'all' ? rows : rows.filter((row) => row.status === filter)

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {statuses.map((item) => (
          <button
            key={item.value}
            onClick={() => setFilter(item.value)}
            className={`border px-4 py-1.5 text-xs ${filter === item.value ? 'border-forest bg-forest text-cream' : 'border-line'}`}
          >
            {item.label}
            {item.value !== 'all' && ` (${rows.filter((row) => row.status === item.value).length})`}
          </button>
        ))}
      </div>

      {loading && <p className="mt-6 text-sm text-ink/50">Loading...</p>}
      {error && <p className="mt-6 text-sm text-clay">{error}</p>}
      {!loading && visible.length === 0 && <p className="mt-6 text-sm text-ink/50">No appointments here.</p>}

      <div className="mt-6 space-y-4">
        {visible.map((row) => (
          <div key={row.id} className="border border-line bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-base">{row.full_name}</p>
                <p className="mt-1 text-sm text-ink/60">
                  {row.doctor_name} · {row.department}
                </p>
              </div>
              <span className={`px-3 py-1 text-xs ${badge[row.status]}`}>{row.status}</span>
            </div>

            <p className="mt-3 text-sm">
              {formatLongDate(row.visit_date)} at {formatTime(row.visit_time)}
            </p>
            <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm text-ink/60">
              <a href={`tel:${row.phone}`} className="underline">
                {row.phone}
              </a>
              {row.email && <a href={`mailto:${row.email}`} className="underline">{row.email}</a>}
              {row.age !== null && <span>Age {row.age}</span>}
            </div>
            {row.reason && <p className="mt-3 text-sm text-ink/70">{row.reason}</p>}

            <div className="mt-4 flex flex-wrap gap-4 text-xs">
              {row.status !== 'confirmed' && row.status !== 'completed' && (
                <button onClick={() => setStatus(row, 'confirmed')} className="text-forest underline">
                  Confirm
                </button>
              )}
              {row.status === 'confirmed' && (
                <button onClick={() => setStatus(row, 'completed')} className="text-forest underline">
                  Mark completed
                </button>
              )}
              {row.status !== 'cancelled' && (
                <button onClick={() => setStatus(row, 'cancelled')} className="text-clay underline">
                  Cancel
                </button>
              )}
              <button onClick={() => remove(row)} className="text-ink/40 underline">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
