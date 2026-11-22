const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export function toIsoDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function upcomingDates(availableDays: string[], count = 12) {
  const result: { iso: string; weekday: string; day: number; month: string }[] = []
  const cursor = new Date()
  cursor.setHours(12, 0, 0, 0)

  for (let offset = 0; offset < 60 && result.length < count; offset += 1) {
    const date = new Date(cursor)
    date.setDate(cursor.getDate() + offset)
    const weekday = dayNames[date.getDay()]
    if (availableDays.includes(weekday)) {
      result.push({
        iso: toIsoDate(date),
        weekday: weekday.slice(0, 3),
        day: date.getDate(),
        month: date.toLocaleString('en-US', { month: 'short' }),
      })
    }
  }

  return result
}

export function formatTime(value: string) {
  const [hourText, minute] = value.split(':')
  const hour = Number(hourText)
  const suffix = hour >= 12 ? 'PM' : 'AM'
  const display = hour % 12 === 0 ? 12 : hour % 12
  return `${display}:${minute} ${suffix}`
}

export function formatLongDate(iso: string) {
  const date = new Date(`${iso}T12:00:00`)
  return date.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })
}

export const allWeekdays = dayNames
