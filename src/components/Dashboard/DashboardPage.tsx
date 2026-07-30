import { useMemo } from 'react'
import { useStore, useCurrentRegion, usePeriodKey } from '@/store/useStore'
import { buildWeeks } from '@/utils/dates'
import { computeRanking, computeTeamGoalsSummary, computeTeamOverview } from '@/services/calculations'
import KpiCards from './KpiCards'
import AlertCards from './AlertCards'
import TechCards from './TechCards'
import EvolucaoChart from './EvolucaoChart'
import TendenciaSemanalChart from './TendenciaSemanalChart'
import RadarChart from './RadarChart'
import Indisponibilidade from './Indisponibilidade'
import ActivitySlaTable from './ActivitySlaTable'
import ProjectionSection from './ProjectionSection'
import styles from './DashboardPage.module.css'

export default function DashboardPage() {
  const region = useCurrentRegion()
  const year = useStore((s) => s.currentYear)
  const month = useStore((s) => s.currentMonth)
  const periodKey = usePeriodKey()
  const params = useStore((s) => s.params)
  const rankingMode = useStore((s) => s.rankingMode)

  const weeks = useMemo(() => buildWeeks(year, month), [year, month])

  const rankingRows = useMemo(
    () => region ? computeRanking(region, weeks, rankingMode, params.quartil, params.dayMeta, periodKey) : [],
    [region, weeks, rankingMode, params.quartil, params.dayMeta, periodKey]
  )

  const goals = useMemo(
    () => region ? computeTeamGoalsSummary(region, weeks, params.dayMeta, periodKey)
      : { pct: null, totalAchieved: 0, totalExpected: 0, totalExpectedPast: 0, businessDays: 0 },
    [region, weeks, params.dayMeta, periodKey]
  )

  const overview = useMemo(
    () => region ? computeTeamOverview(region, weeks, periodKey)
      : { techCount: 0, businessDaysCount: 0, totalTechDays: 0, totalJustified: 0, unavailPct: null, justCounts: {}, unproductiveDays: 0, totalTechDaysPast: 0, unproductivePct: null, unproductiveByTech: [], pastBusinessDaysCount: 0 },
    [region, weeks, periodKey]
  )

  if (!region || !region.technicians.length) {
    return (
      <div className="empty-state">
        {!region
          ? 'Nenhuma região cadastrada. Adicione uma região para começar.'
          : 'Nenhum técnico cadastrado nesta região ainda.'}
      </div>
    )
  }

  return (
    <div className={styles.dashboardCharts}>
      <KpiCards region={region} weeks={weeks} rankingRows={rankingRows} goals={goals} periodKey={periodKey} />
      <AlertCards region={region} weeks={weeks} rankingRows={rankingRows} goals={goals} periodKey={periodKey} />

      <div className={styles.chartCard} style={{ height: 'auto', minHeight: 320 }}>
        <h3>Evolução individual</h3>
        <TechCards region={region} weeks={weeks} rankingRows={rankingRows} periodKey={periodKey} />
      </div>

      <ProjectionSection region={region} weeks={weeks} periodKey={periodKey} />

      <div className={styles.chartRowWideEvo}>
        <div className={styles.chartCard}>
          <h3>Evolução diária da equipe</h3>
          <EvolucaoChart region={region} weeks={weeks} periodKey={periodKey} />
        </div>
        <div className={styles.chartCard}>
          <h3>Tendência semanal</h3>
          <TendenciaSemanalChart region={region} weeks={weeks} />
        </div>
      </div>

      <div className={styles.chartRow}>
        <div className={styles.chartCard}>
          <h3>Perfil da equipe (Radar)</h3>
          <RadarChart rankingRows={rankingRows} teamAvg={goals.totalAchieved / (rankingRows.reduce((s, r) => s + r.days, 0) || 1)} goals={goals} overview={overview} />
        </div>
        <div className={styles.chartCard}>
          <h3>Indisponibilidade Técnica</h3>
          <Indisponibilidade overview={overview} />
        </div>
      </div>

      <div className={`${styles.chartCard} ${styles.chartCardAuto} chart-wide`}>
        <h3>OS no Prazo por Atividade</h3>
        <ActivitySlaTable region={region} />
      </div>
    </div>
  )
}
