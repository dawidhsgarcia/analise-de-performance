import type { Region, WeekDay, RankingRow, TeamGoalsSummary } from '@/types'
import { useStore } from '@/store/useStore'
import { toDateObj } from '@/utils/dates'
import { fmtNum, minScoreForDow } from '@/utils/formatters'
import { getEntry, computeProjection } from '@/services/calculations'
import styles from './DashboardPage.module.css'

interface Props {
  region: Region
  weeks: WeekDay[][]
  rankingRows: RankingRow[]
  goals: TeamGoalsSummary
  periodKey: string
}

export default function AlertCards({ region, weeks, rankingRows, goals, periodKey }: Props) {
  const params = useStore((s) => s.params)
  const dayMeta = params.dayMeta
  const atb = params.alertTech
  const atm = params.alertTeam
  const apj = params.alertProjection

  const allDays: WeekDay[] = []
  weeks.forEach((w) => w.forEach((d) => allDays.push(d)))

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const businessDaysPast = allDays.filter((d) => d.dow !== 0 && d.dow !== 6 && toDateObj(d) <= today)

  const alerts: Array<{ type: string; icon: string; title: string; desc: string }> = []

  // Regra 1: Técnico abaixo da meta
  region.technicians.forEach((tech) => {
    let consecutiveLow = 0
    let maxConsecutive = 0
    for (let i = businessDaysPast.length - 1; i >= 0; i--) {
      const raw = getEntry(region, tech.funci, businessDaysPast[i].iso, periodKey)
      if (typeof raw === 'number' && raw < atb.below) {
        consecutiveLow++
        if (consecutiveLow > maxConsecutive) maxConsecutive = consecutiveLow
      } else {
        consecutiveLow = 0
      }
    }
    if (maxConsecutive >= atb.streak) {
      alerts.push({
        type: 'critical',
        icon: 'error',
        title: 'Técnico abaixo da meta',
        desc: `${tech.nome}: ${fmtNum(maxConsecutive)} dia(s) consecutivo(s) abaixo de ${fmtNum(atb.below)} pts`,
      })
    }
  })

  // Regra 2: Equipe abaixo da meta
  let teamLowStreak = 0
  let teamMaxLowStreak = 0
  businessDaysPast.forEach((d) => {
    let dayAvail = 0
    let dayAch = 0
    region.technicians.forEach((tech) => {
      const raw = getEntry(region, tech.funci, d.iso, periodKey)
      if (typeof raw !== 'string') {
        dayAvail++
        if (typeof raw === 'number') dayAch += raw
      }
    })
    const dayPct = dayAvail > 0 ? (dayAch / (dayAvail * minScoreForDow(dayMeta, d.dow))) * 100 : null
    if (dayPct !== null && dayPct < atm.belowPct) {
      teamLowStreak++
      if (teamLowStreak > teamMaxLowStreak) teamMaxLowStreak = teamLowStreak
    } else {
      teamLowStreak = 0
    }
  })
  if (teamMaxLowStreak >= atm.streak) {
    alerts.push({
      type: 'warning',
      icon: 'warning',
      title: 'Equipe abaixo da meta',
      desc: `${teamMaxLowStreak} dia(s) consecutivo(s) com < ${atm.belowPct}% da meta`,
    })
  }

  // Regra 3: Quartil 4
  rankingRows.filter((r) => r.quartil === 4).forEach((r) => {
    alerts.push({
      type: 'info',
      icon: 'person_alert',
      title: '4º Quartil',
      desc: `${r.tech.nome}: ${r.avg !== null ? fmtNum(r.avg) : '–'} pts/dia`,
    })
  })

  // Regra 4: Projeção
  const { remaining } = computeProjection(region, weeks, params.trendWindow, params.quartil, periodKey)
  if (goals.totalExpected > 0 && remaining > 0) {
    const { rows } = computeProjection(region, weeks, params.trendWindow, params.quartil, periodKey)
    const teamProjectedSum = rows.reduce((s, r) => s + (r.projectedSum || 0), 0)
    const projectedPct = (teamProjectedSum / goals.totalExpected) * 100
    if (projectedPct < apj.belowPct) {
      alerts.push({
        type: 'warning',
        icon: 'trending_down',
        title: 'Projeção abaixo da meta',
        desc: `Se a tendência continuar, equipe fecha com ${Math.round(projectedPct)}% da meta`,
      })
    }
  }

  // Regra 5: Tudo OK
  if (alerts.length === 0) {
    alerts.push({
      type: 'empty',
      icon: 'check_circle',
      title: 'Tudo certo!',
      desc: 'Nenhum alerta no momento',
    })
  }

  const typeMap: Record<string, string> = {
    critical: styles.alertCritical,
    warning: styles.alertWarning,
    info: styles.alertInfo,
    empty: styles.alertEmpty,
  }

  return (
    <div className={styles.alertSection}>
      <h3>Alertas</h3>
      <div className={styles.alertGrid}>
        {alerts.map((a, i) => (
          <div key={i} className={`${styles.alertCard} ${typeMap[a.type] || ''}`}>
            <span className="material-symbols-rounded">{a.icon}</span>
            <div className={styles.alertContent}>
              <div className={styles.alertTitle}>{a.title}</div>
              <div className={styles.alertDesc}>{a.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
