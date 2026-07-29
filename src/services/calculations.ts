import type { Region, WeekDay, RankingRow, ProjectionResult, TeamGoalsSummary, TeamOverview } from '@/types'
import { isBizDay, toDateObj } from '@/utils/dates'
import { quartilOf, minScoreForDow } from '@/utils/formatters'
import { JUSTIFICATION_CODES } from '@/utils/constants'

export function getEntry(
  region: Region,
  funci: string,
  iso: string,
  periodKey: string
): number | string | null {
  return region.entries?.[periodKey]?.[funci]?.[iso] ?? null
}

export function getEntryScore(
  region: Region,
  funci: string,
  iso: string,
  periodKey: string
): number | null {
  const val = getEntry(region, funci, iso, periodKey)
  return typeof val === 'number' ? val : null
}

export function computeRanking(
  region: Region,
  weeks: WeekDay[][],
  rankingMode: 'business' | 'worked',
  paramsQuartil: { q1: number; q2: number; q3: number },
  dayMeta: number[],
  periodKey: string
): RankingRow[] {
  const allDays: WeekDay[] = []
  weeks.forEach((w) => w.forEach((d) => allDays.push(d)))

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const businessDays = allDays.filter((d) => {
    if (d.dow === 0 || d.dow === 6) return false
    return toDateObj(d) <= today
  })

  const rows = region.technicians.map((tech) => {
    let sum = 0
    let days = 0

    if (rankingMode === 'business') {
      businessDays.forEach((d) => {
        const raw = getEntry(region, tech.funci, d.iso, periodKey)
        if (typeof raw === 'string') return
        if (typeof raw === 'number') sum += raw
        days++
      })
    } else {
      allDays.forEach((d) => {
        const val = getEntryScore(region, tech.funci, d.iso, periodKey)
        if (val !== null && val !== 0) {
          sum += val
          days++
        }
      })
    }

    const avg = days > 0 ? sum / days : null
    return {
      tech,
      sum,
      days,
      avg,
      quartil: quartilOf(avg, paramsQuartil.q1, paramsQuartil.q2, paramsQuartil.q3),
    }
  })

  rows.sort((a, b) => {
    if (a.avg === null && b.avg === null) return 0
    if (a.avg === null) return 1
    if (b.avg === null) return -1
    return b.avg - a.avg
  })

  return rows
}

export function computeProjection(
  region: Region,
  weeks: WeekDay[][],
  trendWindow: number,
  paramsQuartil: { q1: number; q2: number; q3: number },
  periodKey: string
): ProjectionResult {
  const allDays: WeekDay[] = []
  weeks.forEach((w) => w.forEach((d) => allDays.push(d)))

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const pastBusinessDays = allDays.filter((d) => isBizDay(d.dow) && toDateObj(d) <= today)
  const futureBusinessDays = allDays.filter((d) => isBizDay(d.dow) && toDateObj(d) > today)
  const remaining = futureBusinessDays.length

  const rows = region.technicians.map((tech) => {
    let sum = 0
    let days = 0

    pastBusinessDays.forEach((d) => {
      const raw = getEntry(region, tech.funci, d.iso, periodKey)
      if (typeof raw === 'string') return
      if (typeof raw === 'number') sum += raw
      days++
    })

    const currentAvg = days > 0 ? sum / days : null

    const trendValues: number[] = []
    for (let i = pastBusinessDays.length - 1; i >= 0 && trendValues.length < trendWindow; i--) {
      const raw = getEntry(region, tech.funci, pastBusinessDays[i].iso, periodKey)
      if (typeof raw === 'number') trendValues.push(raw)
    }

    const trendAvg =
      trendValues.length > 0
        ? trendValues.reduce((a, b) => a + b, 0) / trendValues.length
        : null

    const fallbackAvg = trendAvg !== null ? trendAvg : currentAvg
    const hasBasis = fallbackAvg !== null
    const projectedSum = sum + (hasBasis ? fallbackAvg * remaining : 0)
    const projectedDays = days + remaining
    const projectedAvg =
      projectedDays > 0 && (hasBasis || days > 0)
        ? projectedSum / projectedDays
        : null

    return {
      tech,
      sum,
      days,
      currentAvg,
      currentQuartil: quartilOf(currentAvg, paramsQuartil.q1, paramsQuartil.q2, paramsQuartil.q3),
      trendAvg,
      trendCount: trendValues.length,
      projectedSum,
      projectedDays,
      projectedAvg,
      projectedQuartil: quartilOf(projectedAvg, paramsQuartil.q1, paramsQuartil.q2, paramsQuartil.q3),
    }
  })

  rows.sort((a, b) => {
    if (a.projectedAvg === null && b.projectedAvg === null) return 0
    if (a.projectedAvg === null) return 1
    if (b.projectedAvg === null) return -1
    return b.projectedAvg - a.projectedAvg
  })

  return { rows, remaining }
}

export function computeTeamGoalsSummary(
  region: Region,
  weeks: WeekDay[][],
  dayMeta: number[],
  periodKey: string
): TeamGoalsSummary {
  const allDays: WeekDay[] = []
  weeks.forEach((w) => w.forEach((d) => allDays.push(d)))

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  let totalExpected = 0
  let totalExpectedPast = 0
  let totalAchieved = 0

  allDays.forEach((d) => {
    let available = 0
    let achieved = 0

    region.technicians.forEach((tech) => {
      const raw = getEntry(region, tech.funci, d.iso, periodKey)
      if (typeof raw === 'string') return
      available++
      if (typeof raw === 'number') achieved += raw
    })

    const expected = available * minScoreForDow(dayMeta, d.dow)
    totalExpected += expected
    if (toDateObj(d) <= today) totalExpectedPast += expected
    if (toDateObj(d) <= today) totalAchieved += achieved
  })

  const pct = totalExpectedPast > 0 ? (totalAchieved / totalExpectedPast) * 100 : null
  const businessDays = allDays.filter((d) => d.dow !== 0 && d.dow !== 6).length

  return { pct, totalAchieved, totalExpected, totalExpectedPast, businessDays }
}

export function computeTeamOverview(
  region: Region,
  weeks: WeekDay[][],
  periodKey: string
): TeamOverview {
  const allDays: WeekDay[] = []
  weeks.forEach((w) => w.forEach((d) => allDays.push(d)))

  const businessDays = allDays.filter((d) => d.dow !== 0 && d.dow !== 6)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const pastBusinessDays = businessDays.filter((d) => toDateObj(d) <= today)

  const techCount = region.technicians.length
  const totalTechDays = techCount * businessDays.length
  const totalTechDaysPast = techCount * pastBusinessDays.length

  const justCounts: Record<string, number> = {}
  JUSTIFICATION_CODES.forEach((c) => (justCounts[c] = 0))
  let totalJustified = 0
  let unproductiveDays = 0
  const unproductiveByTech: TeamOverview['unproductiveByTech'] = []

  region.technicians.forEach((tech) => {
    businessDays.forEach((d) => {
      const raw = getEntry(region, tech.funci, d.iso, periodKey)
      if (typeof raw === 'string') {
        if (Object.prototype.hasOwnProperty.call(justCounts, raw)) justCounts[raw]++
        totalJustified++
      }
    })

    let techUnproductive = 0
    let techNoEntry = 0
    pastBusinessDays.forEach((d) => {
      const raw = getEntry(region, tech.funci, d.iso, periodKey)
      if (raw === null || raw === undefined) {
        techNoEntry++
        techUnproductive++
        unproductiveDays++
      } else if (typeof raw === 'number' && raw === 0) {
        techUnproductive++
        unproductiveDays++
      }
    })

    const techPct =
      pastBusinessDays.length > 0 ? (techUnproductive / pastBusinessDays.length) * 100 : null
    unproductiveByTech.push({ tech, count: techUnproductive, noEntry: techNoEntry, pct: techPct })
  })

  unproductiveByTech.sort((a, b) => b.count - a.count)

  const unavailPct = totalTechDays > 0 ? (totalJustified / totalTechDays) * 100 : null
  const unproductivePct = totalTechDaysPast > 0 ? (unproductiveDays / totalTechDaysPast) * 100 : null

  return {
    techCount,
    businessDaysCount: businessDays.length,
    totalTechDays,
    totalJustified,
    unavailPct,
    justCounts,
    unproductiveDays,
    totalTechDaysPast,
    unproductivePct,
    unproductiveByTech,
    pastBusinessDaysCount: pastBusinessDays.length,
  }
}
