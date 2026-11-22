import { Baby, Bone, Eye, HeartPulse, Smile, Sparkles, type LucideIcon } from 'lucide-react'
import type { Department } from '../types/database'

export const departments: {
  value: Department
  label: string
  short: string
  note: string
  imageKey: string
  icon: LucideIcon
}[] = [
  { value: 'cardiology', label: 'Cardiology', short: 'Heart', note: 'Heart health, blood pressure and ECG', imageKey: 'dept_cardiology_image', icon: HeartPulse },
  { value: 'pediatrics', label: 'Pediatrics', short: 'Children', note: 'Babies, children and teenagers', imageKey: 'dept_pediatrics_image', icon: Baby },
  { value: 'dentistry', label: 'Dentistry', short: 'Teeth', note: 'Cosmetic and general dental care', imageKey: 'dept_dentistry_image', icon: Smile },
  { value: 'dermatology', label: 'Dermatology', short: 'Skin', note: 'Skin, hair and laser treatments', imageKey: 'dept_dermatology_image', icon: Sparkles },
  { value: 'orthopedics', label: 'Orthopedics', short: 'Bones', note: 'Bones, joints and sports injuries', imageKey: 'dept_orthopedics_image', icon: Bone },
  { value: 'ophthalmology', label: 'Ophthalmology', short: 'Eyes', note: 'Vision tests and eye care', imageKey: 'dept_ophthalmology_image', icon: Eye },
]

export const departmentLabel = Object.fromEntries(departments.map((item) => [item.value, item.label])) as Record<
  Department,
  string
>
