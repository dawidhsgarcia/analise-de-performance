import { useState } from 'react'
import type { Region, WeekDay } from '@/types'
import { useStore } from '@/store/useStore'
import { DOW } from '@/utils/constants'
import { getEntry } from '@/services/calculations'
import DayCell from './DayCell'
import styles from './MainTable.module.css'

interface Props {
  region: Region
  weeks: WeekDay[][]
  periodKey: string
}

export default function MainTable({ region, weeks, periodKey }: Props) {
  const removeTechnician = useStore((s) => s.removeTechnician)
  const [techs] = useState(() =>
    [...region.technicians].sort((a, b) => a.nome.localeCompare(b.nome))
  )

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return (
    <div className={styles.tableWrap}>
      <table>
        <thead>
          <tr className={styles.weekRow}>
            <th className={styles.colNome} rowSpan={2}></th>
            {weeks.map((w, i) => {
              const first = w[0]
              const last = w[w.length - 1]
              return (
                <th
                  key={i}
                  className={styles.weekHead}
                  colSpan={w.length}
                >
                  Semana {i + 1} · {first.day}–{last.day}
                </th>
              )
            })}
          </tr>
          <tr className={styles.dayRow}>
            {weeks.map((w) =>
              w.map((d) => {
                const weekend = d.dow === 0 || d.dow === 6
                return (
                  <th
                    key={d.iso}
                    className={`${styles.dayHead} ${weekend ? styles.weekend : ''}`}
                  >
                    <span className="dow">{DOW[d.dow]}</span>
                    <span className="dnum">{String(d.day).padStart(2, '0')}</span>
                  </th>
                )
              })
            )}
          </tr>
        </thead>
        <tbody>
          {techs.map((tech) => (
            <tr key={tech.funci} data-funci={tech.funci}>
              <td className={styles.colNome}>
                <span className={styles.techName}>{tech.nome}</span>
                <span className={styles.techFunci}>{tech.funci}</span>
                <button
                  className={styles.techRemove}
                  data-remove={tech.funci}
                  title="Remover técnico"
                  onClick={() => {
                    if (
                      !confirm(
                        `Remover ${tech.nome} (${tech.funci}) desta região? Os apontamentos deste técnico serão mantidos no histórico.`
                      )
                    )
                      return
                    removeTechnician(tech.funci)
                  }}
                >
                  ✕
                </button>
              </td>
              {weeks.map((w) =>
                w.map((d) => {
                  const val = getEntry(region, tech.funci, d.iso, periodKey)
                  const weekend = d.dow === 0 || d.dow === 6
                  return (
                    <DayCell
                      key={d.iso}
                      funci={tech.funci}
                      iso={d.iso}
                      value={val}
                      weekend={weekend}
                      locked={region.locked}
                    />
                  )
                })
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
