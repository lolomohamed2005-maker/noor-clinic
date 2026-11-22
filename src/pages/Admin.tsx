import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useIsAdmin } from '../hooks/useIsAdmin'
import { useDoctors } from '../hooks/useDoctors'
import { useSiteSettings } from '../hooks/useSiteSettings'
import { supabase } from '../lib/supabase'
import { formatFee } from '../lib/format'
import { departmentLabel } from '../lib/departments'
import { siteImages, resolveSiteImage } from '../lib/siteImages'
import { ImageUploadField } from '../components/admin/ImageUploadField'
import { AppointmentsPanel } from '../components/admin/AppointmentsPanel'
import { SettingsPanel } from '../components/admin/SettingsPanel'
import { DoctorForm } from '../components/admin/DoctorForm'
import type { DoctorRow } from '../types/database'

type Tab = 'appointments' | 'doctors' | 'homepage' | 'settings'

const tabs: { value: Tab; label: string }[] = [
  { value: 'appointments', label: 'Appointments' },
  { value: 'doctors', label: 'Doctors' },
  { value: 'homepage', label: 'Homepage images' },
  { value: 'settings', label: 'Settings' },
]

export function Admin() {
  const { user, loading: authLoading, signOut } = useAuth()
  const { isAdmin, checked, error } = useIsAdmin()
  const [tab, setTab] = useState<Tab>('appointments')

  if (authLoading || !checked) {
    return <div className="mx-auto max-w-5xl px-6 pb-16 pt-32 text-sm text-ink/50">Loading...</div>
  }

  if (!user) return <Navigate to="/admin/login" replace />

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-md px-6 pb-20 pt-32">
        <h1 className="text-4xl text-forest">No admin access</h1>
        <p className="mt-3 text-sm text-ink/60">
          This account is signed in but is not registered as an admin yet.
        </p>
        {error && <p className="mt-3 text-sm text-clay">{error}</p>}
        <button
          onClick={signOut}
          className="mt-6 border border-forest px-6 py-2 text-sm text-forest hover:bg-forest hover:text-cream"
        >
          Sign out
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-6 pb-16 pt-28">
      <div className="flex items-end justify-between">
        <h1 className="text-4xl text-forest">Admin</h1>
        <button onClick={signOut} className="text-sm text-ink/60 underline underline-offset-4">
          Sign out
        </button>
      </div>

      <div className="mt-6 flex gap-6 border-b border-line">
        {tabs.map((item) => (
          <button
            key={item.value}
            onClick={() => setTab(item.value)}
            className={`pb-3 text-sm ${
              tab === item.value ? 'border-b-2 border-forest text-forest' : 'text-ink/50'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {tab === 'appointments' && <AppointmentsPanel />}
        {tab === 'doctors' && <DoctorsPanel />}
        {tab === 'homepage' && <HomepageImagesPanel />}
        {tab === 'settings' && <SettingsPanel />}
      </div>
    </div>
  )
}

function HomepageImagesPanel() {
  const { settings, loading, updateSetting } = useSiteSettings()

  if (loading) return <p className="text-sm text-ink/50">Loading...</p>

  return (
    <div className="max-w-md space-y-8">
      {siteImages.map((item) => (
        <ImageUploadField
          key={item.key}
          label={item.label}
          value={resolveSiteImage(settings, item.key)}
          onChange={(url) => updateSetting(item.key, url)}
        />
      ))}
    </div>
  )
}

function DoctorsPanel() {
  const [editing, setEditing] = useState<DoctorRow | 'new' | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  function handleSaved() {
    setEditing(null)
    setRefreshKey((key) => key + 1)
  }

  if (editing) {
    return (
      <DoctorForm
        item={editing === 'new' ? undefined : editing}
        onSaved={handleSaved}
        onCancel={() => setEditing(null)}
      />
    )
  }

  return (
    <div>
      <button
        onClick={() => setEditing('new')}
        className="mb-6 bg-forest px-6 py-2.5 text-sm text-cream transition-colors hover:bg-forest-dark"
      >
        Add doctor
      </button>
      <DoctorsList
        key={refreshKey}
        onEdit={setEditing}
        onDeleted={() => setRefreshKey((key) => key + 1)}
      />
    </div>
  )
}

function DoctorsList({
  onEdit,
  onDeleted,
}: {
  onEdit: (item: DoctorRow) => void
  onDeleted: () => void
}) {
  const { doctors, loading, error } = useDoctors({})
  const [actionError, setActionError] = useState<string | null>(null)

  async function handleDelete(item: DoctorRow) {
    if (!confirm(`Delete ${item.name}?`)) return
    const { error: deleteError } = await supabase.from('doctors').delete().eq('id', item.id)
    if (deleteError) {
      setActionError(deleteError.message)
      return
    }
    onDeleted()
  }

  return (
    <div>
      {loading && <p className="text-sm text-ink/50">Loading...</p>}
      {error && <p className="text-sm text-clay">{error}</p>}
      {actionError && <p className="mb-4 text-sm text-clay">{actionError}</p>}

      <div className="divide-y divide-line border-t border-line">
        {doctors.map((item) => (
          <div key={item.id} className="flex items-center gap-4 py-4">
            <img src={item.images[0]} alt={item.name} className="h-14 w-14 rounded-full bg-sand object-cover object-top" />
            <div className="flex-1">
              <p className="text-sm">{item.name}</p>
              <p className="text-xs text-ink/50">
                {departmentLabel[item.department]} · {item.title} · {formatFee(item.fee)}
              </p>
            </div>
            <button onClick={() => onEdit(item)} className="text-xs text-forest underline">
              Edit
            </button>
            <button onClick={() => handleDelete(item)} className="text-xs text-clay underline">
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
