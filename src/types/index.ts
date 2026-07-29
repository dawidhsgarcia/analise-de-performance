export interface Technician {
  funci: string
  nome: string
}

export interface TechSla {
  evaluated: number
  onTime: number
}

export interface SlaCounts {
  evaluated: number
  onTime: number
}

export interface ActivitySla {
  total: number
  evaluated: number
  onTime: number
}

export interface QuartilLimits {
  q1: number
  q2: number
  q3: number
}

export interface AlertTech {
  below: number
  streak: number
}

export interface AlertTeam {
  belowPct: number
  streak: number
}

export interface AlertProjection {
  belowPct: number
}

export interface Params {
  dayMeta: number[]
  trendWindow: number
  quartil: QuartilLimits
  alertTech: AlertTech
  alertTeam: AlertTeam
  alertProjection: AlertProjection
}

export interface Region {
  name: string
  technicians: Technician[]
  entries: Record<string, Record<string, Record<string, number | string | null>>>
  locked: boolean
  slaCounts?: SlaCounts
  totalOS?: number
  techSla?: Record<string, TechSla>
  activitySla?: Record<string, ActivitySla>
}

export interface Regions {
  [id: string]: Region
}

export interface AppState {
  currentRegion: string
  currentYear: number
  currentMonth: number
  rankingMode: 'business' | 'worked'
  params: Params
  regions: Regions
}

export interface WeekDay {
  day: number
  dow: number
  iso: string
}

export interface RankingRow {
  tech: Technician
  sum: number
  days: number
  avg: number | null
  quartil: number | null
}

export interface ProjectionRow {
  tech: Technician
  sum: number
  days: number
  currentAvg: number | null
  currentQuartil: number | null
  trendAvg: number | null
  trendCount: number
  projectedSum: number
  projectedDays: number
  projectedAvg: number | null
  projectedQuartil: number | null
}

export interface ProjectionResult {
  rows: ProjectionRow[]
  remaining: number
}

export interface TeamGoalsSummary {
  pct: number | null
  totalAchieved: number
  totalExpected: number
  totalExpectedPast: number
  businessDays: number
}

export interface AlertItem {
  type: 'critical' | 'warning' | 'info' | 'empty'
  icon: string
  title: string
  desc: string
}

export interface UnproductiveByTech {
  tech: Technician
  count: number
  noEntry: number
  pct: number | null
}

export interface TeamOverview {
  techCount: number
  businessDaysCount: number
  totalTechDays: number
  totalJustified: number
  unavailPct: number | null
  justCounts: Record<string, number>
  unproductiveDays: number
  totalTechDaysPast: number
  unproductivePct: number | null
  unproductiveByTech: UnproductiveByTech[]
  pastBusinessDaysCount: number
}

export interface JustificationColor {
  bg: string
  text: string
}
