export type Department = 'cardiology' | 'pediatrics' | 'dentistry' | 'dermatology' | 'orthopedics' | 'ophthalmology'

export type DoctorRow = {
  id: string
  created_at: string
  name: string
  slug: string
  department: Department
  title: string
  experience_years: number
  fee: number
  summary: string
  bio: string
  expertise: string[]
  education: string[]
  available_days: string[]
  time_slots: string[]
  images: string[]
  is_featured: boolean
}

export type AppointmentStatus = 'new' | 'confirmed' | 'completed' | 'cancelled'

export type AppointmentRow = {
  id: string
  created_at: string
  doctor_id: string | null
  doctor_name: string
  department: string
  full_name: string
  phone: string
  email: string
  age: number | null
  visit_date: string
  visit_time: string
  reason: string
  status: AppointmentStatus
}

export type AdminRow = {
  user_id: string
  created_at: string
}

export type SiteSettingRow = {
  key: string
  value: string
  updated_at: string
}

type TableDefinition<Row, InsertOmit extends keyof Row> = {
  Row: Row
  Insert: Omit<Row, InsertOmit>
  Update: Partial<Omit<Row, InsertOmit>>
  Relationships: []
}

export type Database = {
  public: {
    Tables: {
      doctors: TableDefinition<DoctorRow, 'id' | 'created_at'>
      appointments: {
        Row: AppointmentRow
        Insert: Omit<AppointmentRow, 'id' | 'created_at' | 'status'>
        Update: Partial<Omit<AppointmentRow, 'id' | 'created_at'>>
        Relationships: []
      }
      admins: TableDefinition<AdminRow, 'created_at'>
      site_settings: TableDefinition<SiteSettingRow, 'updated_at'>
    }
    Views: {}
    Functions: {
      taken_slots: {
        Args: { p_doctor: string; p_date: string }
        Returns: string[]
      }
    }
    Enums: {}
    CompositeTypes: {}
  }
}
