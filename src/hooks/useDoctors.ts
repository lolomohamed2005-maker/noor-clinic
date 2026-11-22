import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Department, DoctorRow } from '../types/database'

export interface DoctorFilters {
  department?: Department
  search?: string
  featured?: boolean
  limit?: number
}

export function useDoctors(filters: DoctorFilters = {}) {
  const [doctors, setDoctors] = useState<DoctorRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      let query = supabase.from('doctors').select('*').order('is_featured', { ascending: false }).order('created_at')

      if (filters.department) query = query.eq('department', filters.department)
      if (filters.featured) query = query.eq('is_featured', true)
      if (filters.search) query = query.ilike('name', `%${filters.search}%`)
      if (filters.limit) query = query.limit(filters.limit)

      const { data, error: queryError } = await query
      if (cancelled) return

      if (queryError) {
        setError(queryError.message)
        setDoctors([])
      } else {
        setError(null)
        setDoctors(data ?? [])
      }
      setLoading(false)
    }

    load()

    return () => {
      cancelled = true
    }
  }, [filters.department, filters.featured, filters.search, filters.limit])

  return { doctors, loading, error }
}
