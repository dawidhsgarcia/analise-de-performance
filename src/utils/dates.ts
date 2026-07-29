import type { WeekDay } from '@/types'

export function pad(n: number): string {
  return String(n).padStart(2, '0')
}

export function isoDate(y: number, m: number, d: number): string {
  return `${y}-${pad(m + 1)}-${pad(d)}`
}

export function buildWeeks(year: number, month: number): WeekDay[][] {
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const weeks: WeekDay[][] = []
  let current: WeekDay[] = []

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day)
    const dow = date.getDay()

    if (dow === 1 && current.length > 0) {
      weeks.push(current)
      current = []
    }

    current.push({ day, dow, iso: isoDate(year, month, day) })
  }

  if (current.length) weeks.push(current)
  return weeks
}

export function toDateObj(d: WeekDay): Date {
  const [y, m, day] = d.iso.split('-').map(Number)
  return new Date(y, m - 1, day)
}

export function periodKey(year: number, month: number): string {
  return `${year}-${pad(month + 1)}`
}

export function isBizDay(dow: number): boolean {
  return dow !== 0 && dow !== 6
}

export function excelSerialToDate(v: unknown): Date | null {
  if (v instanceof Date) return v
  if (typeof v === 'number') {
    const utcDays = Math.floor(v - 25569)
    const utcMs = utcDays * 86400 * 1000
    return new Date(utcMs)
  }
  if (typeof v === 'string') {
    const parsed = new Date(v)
    return isNaN(parsed.getTime()) ? null : parsed
  }
  return null
}
