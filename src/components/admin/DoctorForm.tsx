import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { departments } from '../../lib/departments'
import { allWeekdays } from '../../lib/schedule'
import { ImageUploadField } from './ImageUploadField'
import type { Department, DoctorRow } from '../../types/database'

const fieldClass = 'mt-1 w-full border border-line bg-white px-3 py-2 text-sm outline-none focus:border-forest'

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function toList(value: string) {
  return value
    .split(/[\n,]/)
    .map((entry) => entry.trim())
    .filter(Boolean)
}

export function DoctorForm({
  item,
  onSaved,
  onCancel,
}: {
  item?: DoctorRow
  onSaved: () => void
  onCancel: () => void
}) {
  const [name, setName] = useState(item?.name ?? '')
  const [department, setDepartment] = useState<Department>(item?.department ?? 'cardiology')
  const [title, setTitle] = useState(item?.title ?? '')
  const [experience, setExperience] = useState(String(item?.experience_years ?? 5))
  const [fee, setFee] = useState(String(item?.fee ?? ''))
  const [summary, setSummary] = useState(item?.summary ?? '')
  const [bio, setBio] = useState(item?.bio ?? '')
  const [expertise, setExpertise] = useState((item?.expertise ?? []).join(', '))
  const [education, setEducation] = useState((item?.education ?? []).join('\n'))
  const [days, setDays] = useState<string[]>(item?.available_days ?? [])
  const [slots, setSlots] = useState((item?.time_slots ?? ['09:00', '09:30', '10:00', '10:30']).join(', '))
  const [images, setImages] = useState<string[]>(item?.images ?? [])
  const [featured, setFeatured] = useState(item?.is_featured ?? false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function toggleDay(day: string) {
    setDays((current) => (current.includes(day) ? current.filter((entry) => entry !== day) : [...current, day]))
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setSaving(true)
    setError(null)

    const payload = {
      name: name.trim(),
      slug: item?.slug ?? slugify(name),
      department,
      title: title.trim(),
      experience_years: Number(experience),
      fee: Number(fee),
      summary: summary.trim(),
      bio: bio.trim(),
      expertise: toList(expertise),
      education: toList(education),
      available_days: days,
      time_slots: toList(slots),
      images,
      is_featured: featured,
    }

    const result = item
      ? await supabase.from('doctors').update(payload).eq('id', item.id)
      : await supabase.from('doctors').insert(payload)

    setSaving(false)

    if (result.error) {
      setError(result.error.message)
      return
    }

    onSaved()
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-5">
      <div>
        <label className="text-sm text-ink/70">Doctor name</label>
        <input required value={name} onChange={(e) => setName(e.target.value)} className={fieldClass} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-ink/70">Department</label>
          <select value={department} onChange={(e) => setDepartment(e.target.value as Department)} className={fieldClass}>
            {departments.map((entry) => (
              <option key={entry.value} value={entry.value}>
                {entry.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm text-ink/70">Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Consultant Cardiologist" className={fieldClass} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-ink/70">Years of experience</label>
          <input required type="number" min="0" value={experience} onChange={(e) => setExperience(e.target.value)} className={fieldClass} />
        </div>
        <div>
          <label className="text-sm text-ink/70">Consultation fee (EGP)</label>
          <input required type="number" min="0" value={fee} onChange={(e) => setFee(e.target.value)} className={fieldClass} />
        </div>
      </div>

      <div>
        <label className="text-sm text-ink/70">Short summary</label>
        <input value={summary} onChange={(e) => setSummary(e.target.value)} className={fieldClass} />
      </div>

      <div>
        <label className="text-sm text-ink/70">About the doctor</label>
        <textarea rows={4} value={bio} onChange={(e) => setBio(e.target.value)} className={fieldClass} />
      </div>

      <div>
        <label className="text-sm text-ink/70">Areas of expertise (comma separated)</label>
        <input value={expertise} onChange={(e) => setExpertise(e.target.value)} className={fieldClass} />
      </div>

      <div>
        <label className="text-sm text-ink/70">Education (one per line)</label>
        <textarea rows={3} value={education} onChange={(e) => setEducation(e.target.value)} className={fieldClass} />
      </div>

      <div>
        <p className="text-sm text-ink/70">Working days</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {allWeekdays.map((day) => (
            <button
              type="button"
              key={day}
              onClick={() => toggleDay(day)}
              className={`border px-3 py-1.5 text-xs ${days.includes(day) ? 'border-forest bg-forest text-cream' : 'border-line'}`}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm text-ink/70">Appointment times, 24 hour format (comma separated)</label>
        <input value={slots} onChange={(e) => setSlots(e.target.value)} placeholder="09:00, 09:30, 10:00" className={fieldClass} />
      </div>

      <div className="space-y-4">
        <p className="text-sm text-ink/70">Photos (the first one is the main photo)</p>
        {images.map((url, index) => (
          <ImageUploadField
            key={index}
            label={`Photo ${index + 1}`}
            value={url}
            onChange={(next) => setImages((current) => current.map((entry, i) => (i === index ? next : entry)))}
          />
        ))}
        <div className="flex gap-4 text-xs">
          <button type="button" onClick={() => setImages((current) => [...current, ''])} className="text-forest underline">
            Add photo
          </button>
          {images.length > 0 && (
            <button type="button" onClick={() => setImages((current) => current.slice(0, -1))} className="text-clay underline">
              Remove last photo
            </button>
          )}
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
        Show on the homepage
      </label>

      {error && <p className="text-sm text-clay">{error}</p>}

      <div className="flex gap-3">
        <button type="submit" disabled={saving} className="bg-forest px-6 py-2.5 text-sm text-cream hover:bg-forest-dark disabled:opacity-50">
          {saving ? 'Saving...' : 'Save doctor'}
        </button>
        <button type="button" onClick={onCancel} className="border border-line px-6 py-2.5 text-sm">
          Cancel
        </button>
      </div>
    </form>
  )
}
