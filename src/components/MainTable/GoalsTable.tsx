import { useMemo } from 'react'
import type { Region, WeekDay } from '@/types'
import { useStore } from '@/store/useStore'
import { DOW } from '@/utils/constants'
import { getEntry } from '@/services/calculations'
import { minScoreForDow, fmtNum } from '@/utils/formatters'

interface Props {
  region: Region
  weeks: WeekDay[][]
  periodKey: string
}

export default function GoalsTable({ region, weeks, periodKey }: Props) {
  const dayMeta = useStore((s) => s.params.dayMeta)
  const alertTeamBelowPct = useStore((s) => s.params.alertTeam.belowPct)

  const allDays: WeekDay[] = useMemo(() => {
    const days: WeekDay[] = []
    weeks.forEach((w) => w.forEach((d) => days.push(d)))
    return days
  }, [weeks])

  const perDay = useMemo(
    () =>
      allDays.map((d) => {
        const isWeekend = d.dow === 0 || d.dow === 6
        let available = 0
        let achieved = 0
        region.technicians.forEach((tech) => {
          const raw = getEntry(region, tech.funci, d.iso, periodKey)
          if (typeof raw === 'string') return
          available++
          if (typeof raw === 'number') achieved += raw
        })
        const expected = available * minScoreForDow(dayMeta, d.dow)
        const pct = expected > 0 ? (achieved / expected) * 100 : null
        return { d, isWeekend, available, expected, achieved, pct }
      }),
    [allDays, region, periodKey, dayMeta]
  )

  if (!region.technicians.length) return null

  return (
    <div id="goalsTableWrap">
      <h2 className="section-title">Meta diária da equipe</h2>
      <p className="hint goals-hint">
        Meta esperada = técnicos disponíveis × pontos configurados para o dia
        da semana (ver aba Parâmetros). Técnicos com justificativa no dia não
        contam como disponíveis.
      </p>
      <div className="table-wrap goals-table-wrap">
        <table>
          <thead>
            <tr className="week-row">
              <th className="col-nome" colSpan={1} rowSpan={2}></th>
              {weeks.map((w, i) => {
                const first = w[0]
                const last = w[w.length - 1]
                return (
                  <th
                    key={i}
                    className="week-head"
                    colSpan={w.length}
                  >
                    Semana {i + 1} · {first.day}–{last.day}
                  </th>
                )
              })}
            </tr>
            <tr className="day-row">
              {weeks.map((w) =>
                w.map((d) => {
                  const weekend = d.dow === 0 || d.dow === 6 ? ' weekend' : ''
                  return (
                    <th
                      key={d.iso}
                      className={`day-head${weekend}`}
                    >
                      <span className="dow">{DOW[d.dow]}</span>
                      <span className="dnum">
                        {String(d.day).padStart(2, '0')}
                      </span>
                    </th>
                  )
                })
              )}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="col-nome">Técnicos disponíveis</td>
              {perDay.map((p) => {
                const weekend = p.isWeekend ? ' weekend' : ''
                return (
                  <td key={p.d.iso} className={`day-cell${weekend}`}>
                    <span className="goal-value">{p.available}</span>
                  </td>
                )
              })}
            </tr>
            <tr>
              <td className="col-nome">Meta esperada (pontos/dia)</td>
              {perDay.map((p) => {
                const weekend = p.isWeekend ? ' weekend' : ''
                return (
                  <td key={p.d.iso} className={`day-cell${weekend}`}>
                    <span className="goal-value">
                      {fmtNum(p.expected) || '0'}
                    </span>
                  </td>
                )
              })}
            </tr>
            <tr>
              <td className="col-nome">Pontuação realizada</td>
              {perDay.map((p) => {
                const weekend = p.isWeekend ? ' weekend' : ''
                return (
                  <td key={p.d.iso} className={`day-cell${weekend}`}>
                    <span className="goal-value">
                      {fmtNum(p.achieved) || '0'}
                    </span>
                  </td>
                )
              })}
            </tr>
            <tr>
              <td className="col-nome">% Atingimento da meta</td>
              {perDay.map((p) => {
                const weekend = p.isWeekend ? ' weekend' : ''
                if (p.pct === null) {
                  return (
                    <td key={p.d.iso} className={`day-cell${weekend}`}>
                      <span className="goal-value">–</span>
                    </td>
                  )
                }
                const cls =
                  p.pct >= 100
                    ? 'pct-good'
                    : p.pct >= alertTeamBelowPct
                    ? 'pct-warn'
                    : 'pct-bad'
                return (
                  <td key={p.d.iso} className={`day-cell${weekend}`}>
                    <span className={`goal-value ${cls}`}>
                      {Math.round(p.pct)}%
                    </span>
                  </td>
                )
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
