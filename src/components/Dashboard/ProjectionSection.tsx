import { useMemo } from 'react'
import type { Region, WeekDay } from '@/types'
import { useStore } from '@/store/useStore'
import { fmtNum } from '@/utils/formatters'
import { computeTeamGoalsSummary, computeProjection } from '@/services/calculations'

interface Props {
  region: Region
  weeks: WeekDay[][]
  periodKey: string
}

export default function ProjectionSection({ region, weeks, periodKey }: Props) {
  const params = useStore((s) => s.params)

  const goals = useMemo(
    () => computeTeamGoalsSummary(region, weeks, params.dayMeta, periodKey),
    [region, weeks, params.dayMeta, periodKey]
  )

  const { rows, remaining } = useMemo(
    () => computeProjection(region, weeks, params.trendWindow, params.quartil, periodKey),
    [region, weeks, params.trendWindow, params.quartil, periodKey]
  )

  if (!region || region.technicians.length === 0 || goals.totalExpected === 0) {
    return null
  }

  if (remaining === 0) {
    const pct =
      goals.totalExpectedPast > 0
        ? Math.round((goals.totalAchieved / goals.totalExpectedPast) * 100)
        : null
    return (
      <div className="proj-card">
        <h3>Projeção de Fechamento</h3>
        <div style={{ color: 'var(--text-mut)', fontSize: 13 }}>
          Mês encerrado. Total realizado: {fmtNum(goals.totalAchieved)} pts de{' '}
          {fmtNum(goals.totalExpectedPast)} esperados
          {pct !== null ? ` (${pct}%)` : ''}.
        </div>
      </div>
    )
  }

  const teamProjectedSum = rows.reduce((s, r) => s + (r.projectedSum || 0), 0)
  const projectedPct = goals.totalExpected > 0 ? (teamProjectedSum / goals.totalExpected) * 100 : null
  const remainingForGoal = goals.totalExpected - teamProjectedSum
  const ptsPerDayNeeded = remaining > 0 ? Math.ceil(remainingForGoal / remaining) : null

  const barPct = projectedPct !== null ? Math.min(projectedPct, 100) : 0
  const barCls = projectedPct !== null && projectedPct >= 100 ? 'green' : projectedPct !== null && projectedPct >= 70 ? 'orange' : 'red'

  return (
    <div className="proj-card">
      <h3>Projeção de Fechamento</h3>
      <div className="proj-resumo">
        <div className="proj-stat">
          <span className="label">Realizado</span>
          <span className="value">
            {fmtNum(goals.totalAchieved)}{' '}
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-mut)' }}>pts</span>
          </span>
        </div>
        <div className="proj-stat">
          <span className="label">Projetado</span>
          <span
            className={`value ${
              projectedPct !== null && projectedPct >= 100 ? 'green' : 'orange'
            }`}
          >
            {fmtNum(teamProjectedSum)}{' '}
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-mut)' }}>pts</span>
          </span>
        </div>
        <div className="proj-stat">
          <span className="label">Meta total</span>
          <span className="value">
            {fmtNum(goals.totalExpected)}{' '}
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-mut)' }}>pts</span>
          </span>
        </div>
        <div className="proj-stat">
          <span className="label">Dias úteis restantes</span>
          <span className="value">{remaining}</span>
        </div>
      </div>

      <div className="proj-bar">
        <div className={`proj-bar-fill ${barCls}`} style={{ width: `${barPct}%` }} />
      </div>

      <div
        style={{
          fontSize: 12,
          color: 'var(--text-mut)',
          marginBottom: 16,
        }}
      >
        Projeção:{' '}
        <strong
          style={{
            color:
              barCls === 'green'
                ? '#065F46'
                : barCls === 'orange'
                ? '#92400E'
                : '#991B1B',
          }}
        >
          {projectedPct !== null ? Math.round(projectedPct) + '%' : '–'}
        </strong>{' '}
        da meta baseada na tendência recente de cada técnico
      </div>

      {projectedPct !== null && projectedPct < 100 ? (
        <div className="proj-gap alert">
          {remainingForGoal > 0
            ? `⚠️ Faltam <strong>${fmtNum(remainingForGoal)} pts</strong> em <strong>${remaining} dias úteis</strong> = <strong>${ptsPerDayNeeded} pts/dia</strong> extras pela equipe para atingir a meta`
            : `⚠️ Projeção indica ${Math.round(projectedPct)}% da meta — abaixo do esperado`}
        </div>
      ) : projectedPct !== null && projectedPct >= 100 ? (
        <div className="proj-gap ok">✅ Projeção indica atingimento da meta ✓</div>
      ) : null}

      <div className="proj-table-wrap">
        <table className="proj-table">
          <thead>
            <tr>
              <th>Técnico</th>
              <th>Média Atual</th>
              <th>Tendência</th>
              <th>Média Proj.</th>
              <th>Quartil Proj.</th>
              <th>Gap</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const gapPerDay =
                ptsPerDayNeeded !== null && r.projectedAvg !== null
                  ? Math.ceil(ptsPerDayNeeded - r.projectedAvg)
                  : null
              const gapCls =
                gapPerDay !== null && gapPerDay > 0
                  ? 'urgent'
                  : gapPerDay !== null && gapPerDay < 0
                  ? 'ok'
                  : 'warn'
              const gapLabel =
                gapPerDay !== null && gapPerDay > 0
                  ? `+${gapPerDay} 🚨`
                  : gapPerDay !== null && gapPerDay < 0
                  ? `${gapPerDay} ✓`
                  : '—'
              return (
                <tr key={r.tech.funci}>
                  <td style={{ fontWeight: 600, color: 'var(--text)' }}>{r.tech.nome}</td>
                  <td>{r.currentAvg !== null ? fmtNum(r.currentAvg) : '–'}</td>
                  <td
                    style={{
                      color:
                        r.trendAvg !== null && r.trendAvg > (r.currentAvg || 0)
                          ? '#065F46'
                          : r.trendAvg !== null && r.trendAvg < (r.currentAvg || 0)
                          ? '#991B1B'
                          : 'var(--text-mut)',
                    }}
                  >
                    {r.trendAvg !== null ? fmtNum(r.trendAvg) : '–'}
                  </td>
                  <td>{r.projectedAvg !== null ? fmtNum(r.projectedAvg) : '–'}</td>
                  <td>
                    <span
                      className={`tech-card-badge ${
                        r.projectedQuartil ? 'q' + r.projectedQuartil : 'q0'
                      }`}
                    >
                      {r.projectedQuartil ? r.projectedQuartil + 'º' : '—'}
                    </span>
                  </td>
                  <td>
                    <span className={`proj-gap-cell ${gapCls}`}>{gapLabel}</span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
