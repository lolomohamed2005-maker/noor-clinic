const photo = (id: string, width = 1400) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${width}&q=80`

export const siteImages = [
  { key: 'hero_image', label: 'Homepage hero (doctor and patient)', fallback: photo('1631217868264-e5b90bb7e133', 1600) },
  { key: 'hero_card_image', label: 'Hero small photo', fallback: photo('1632053002928-1919605ee6f7', 800) },
  { key: 'about_image', label: 'About section (clinic interior)', fallback: photo('1682130157004-057c137d96d5', 1400) },
  { key: 'cta_image', label: 'Bottom banner', fallback: photo('1764691400654-cde59d1d6294', 2000) },
  { key: 'dept_cardiology_image', label: 'Department: Cardiology', fallback: photo('1460672985063-6764ac8b9c74') },
  { key: 'dept_pediatrics_image', label: 'Department: Pediatrics', fallback: photo('1632052999447-e542d08d4f7d') },
  { key: 'dept_dentistry_image', label: 'Department: Dentistry', fallback: photo('1606811971618-4486d14f3f99') },
  { key: 'dept_dermatology_image', label: 'Department: Dermatology', fallback: photo('1761718209708-9ab9ba1c7252') },
  { key: 'dept_orthopedics_image', label: 'Department: Orthopedics', fallback: photo('1649751361457-01d3a696c7e6') },
  { key: 'dept_ophthalmology_image', label: 'Department: Ophthalmology', fallback: photo('1758656321452-0d3b91acb371') },
]

export function resolveSiteImage(settings: Record<string, string>, key: string) {
  const custom = settings[key]
  if (custom) return custom
  return siteImages.find((item) => item.key === key)?.fallback ?? ''
}
