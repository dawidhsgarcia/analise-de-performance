import type { Region, WeekDay, RankingRow, TeamGoalsSummary } from '@/types'
import { useStore } from '@/store/useStore'
import { toDateObj } from '@/utils/dates'
import { fmtNum } from '@/utils/formatters'
import { getEntry } from '@/services/calculations'
import styles from './DashboardPage.module.css'

interface Props {
  region: Region
  weeks: WeekDay[][]
  rankingRows: RankingRow[]
  goals: TeamGoalsSummary
  periodKey: string
}

export default function KpiCards({ region, weeks, rankingRows, goals, periodKey }: Props) {
  const alertTeamBelowPct = useStore((s) => s.params.alertTeam.belowPct)
  const quartilQ1 = useStore((s) => s.params.quartil.q1)
  const alertTechBelow = useStore((s) => s.params.alertTech.below)

  const allDays: WeekDay[] = []
  weeks.forEach((w) => w.forEach((d) => allDays.push(d)))

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const businessDaysAll = allDays.filter((d) => d.dow !== 0 && d.dow !== 6)
  const businessDaysPast = businessDaysAll.filter((d) => toDateObj(d) <= today)

  const totalSum = rankingRows.reduce((s, r) => s + (r.sum || 0), 0)
  const totalDays = rankingRows.reduce((s, r) => s + (r.days || 0), 0)
  const teamAvg = totalDays > 0 ? totalSum / totalDays : null
  const totalPts = goals.totalAchieved
  const alertCount = rankingRows.filter((r) => r.quartil === 4).length

  const totalOS = region.totalOS || 0
  const ticketMedio = totalOS > 0 ? totalPts / totalOS : null

  let diasProdutivos = 0
  businessDaysPast.forEach((d) => {
    let dayScore = 0
    region.technicians.forEach((tech) => {
      const raw = getEntry(region, tech.funci, d.iso, periodKey)
      if (typeof raw === 'number') dayScore += raw
    })
    if (dayScore > 0) diasProdutivos++
  })

  const slaCounts = region.slaCounts || { evaluated: 0, onTime: 0 }
  const slaPct =
    slaCounts.evaluated > 0
      ? Math.round((slaCounts.onTime / slaCounts.evaluated) * 100)
      : null

  const kpis = [
    {
      icon: 'schedule',
      label: 'SLA — % no Prazo',
      value: slaPct !== null ? slaPct + '%' : '–',
      sub: slaCounts.evaluated > 0
        ? slaCounts.onTime + '/' + slaCounts.evaluated + ' OS'
        : 'sem dados de prazo',
      cls: slaPct !== null && slaPct >= 90 ? 'kpiSuccess' : slaPct !== null && slaPct < 70 ? 'kpiDanger' : 'kpiWarning',
    },
    {
      icon: 'flag',
      label: 'Meta da Equipe',
      value: goals.pct !== null ? Math.round(goals.pct) + '%' : '–',
      sub: (fmtNum(goals.totalAchieved) || '0') + ' / ' + (fmtNum(goals.totalExpectedPast) || '0') + ' pts',
      cls: goals.pct !== null && goals.pct >= 100 ? 'kpiSuccess' : goals.pct !== null && goals.pct < alertTeamBelowPct ? 'kpiDanger' : 'kpiWarning',
    },
    {
      icon: 'speed',
      label: 'Média da Equipe',
      value: teamAvg !== null ? fmtNum(teamAvg) : '–',
      sub: 'pts/dia em média',
      cls: teamAvg !== null && teamAvg >= quartilQ1 ? 'kpiSuccess' : teamAvg !== null && teamAvg < alertTechBelow ? 'kpiDanger' : '',
    },
    {
      icon: 'assignment',
      label: 'Total de OS',
      value: fmtNum(totalOS) || '0',
      sub: 'ordens de serviço no mês',
      cls: '',
    },
    {
      icon: 'summarize',
      label: 'Total de Pontos',
      value: fmtNum(totalPts) || '0',
      sub: 'acumulado no mês',
      cls: '',
    },
    {
      icon: 'receipt_long',
      label: 'Ticket Médio',
      value: ticketMedio !== null ? fmtNum(ticketMedio) : '–',
      sub: 'pontos por OS',
      cls: '',
    },
    {
      icon: 'calendar_month',
      label: 'Dias Úteis',
      value: businessDaysPast.length + ' / ' + businessDaysAll.length,
      sub: 'transcorridos / total do mês',
      cls: '',
    },
    {
      icon: 'event_available',
      label: 'Dias Produtivos',
      value: diasProdutivos + ' / ' + businessDaysPast.length,
      sub: 'com produção / dias úteis',
      cls: '',
    },
    {
      icon: 'warning',
      label: 'Em Alerta',
      value: String(alertCount),
      sub: 'técnico(s) em 4º quartil',
      cls: alertCount > 0 ? 'kpiDanger' : 'kpiSuccess',
    },
  ]

  return (
    <div className={styles.kpiGrid}>
      {kpis.map((k) => (
        <div key={k.label} className={`${styles.kpiCard} ${k.cls ? styles[k.cls] : ''}`}>
          <span className={`material-symbols-rounded ${styles.kpiIcon}`}>{k.icon}</span>
          <div className={styles.kpiLabel}>{k.label}</div>
          <div className={styles.kpiValue}>{k.value}</div>
          <div className={styles.kpiSub}>{k.sub}</div>
        </div>
      ))}
    </div>
  )
}
