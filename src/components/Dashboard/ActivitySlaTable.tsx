import type { Region } from '@/types'

interface Props {
  region: Region
}

export default function ActivitySlaTable({ region }: Props) {
  const sla = region.activitySla || {}
  const entries = Object.entries(sla)

  if (entries.length === 0) {
    return (
      <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-mut)', fontSize: 13 }}>
        Nenhuma atividade encontrada. Importe um relatório com dados de OS.
      </div>
    )
  }

  entries.sort((a, b) => b[1].total - a[1].total)

  const totalEval = entries.reduce((s, [, v]) => s + v.evaluated, 0)
  const totalOnt = entries.reduce((s, [, v]) => s + v.onTime, 0)

  return (
    <>
      <div
        className="unavail-summary"
        style={{ padding: '0 4px 12px', fontSize: 12, color: 'var(--text-mut)', display: 'flex', gap: 24 }}
      >
        <span>
          📋 <strong>{entries.length}</strong> tipos de atividade
        </span>
        <span>
          ✅ <strong>{totalOnt}</strong> de <strong>{totalEval}</strong> OS no prazo (
          {totalEval > 0 ? Math.round((totalOnt / totalEval) * 100) : 0}%)
        </span>
      </div>
      <div className="proj-table-wrap" style={{ maxHeight: 'none' }}>
        <table className="proj-table">
          <thead>
            <tr>
              <th>Atividade</th>
              <th style={{ textAlign: 'right' }}>Total OS</th>
              <th style={{ textAlign: 'right' }}>Avaliadas</th>
              <th style={{ textAlign: 'right' }}>No Prazo</th>
              <th style={{ textAlign: 'right' }}>SLA %</th>
            </tr>
          </thead>
          <tbody>
            {entries.map(([atv, d]) => {
              const pct = d.evaluated > 0 ? Math.round((d.onTime / d.evaluated) * 100) : null
              const cls = pct !== null ? (pct >= 90 ? 'ok' : pct >= 70 ? 'warn' : 'urgent') : ''
              return (
                <tr key={atv}>
                  <td style={{ fontWeight: 600, color: 'var(--text)' }}>{atv}</td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--text)' }}>{d.total}</td>
                  <td style={{ textAlign: 'right' }}>{d.evaluated}</td>
                  <td style={{ textAlign: 'right' }}>{d.onTime}</td>
                  <td style={{ textAlign: 'right' }}>
                    <span
                      className={`proj-gap-cell ${cls}`}
                      style={{ display: 'inline-block' }}
                    >
                      {pct !== null ? pct + '%' : '–'}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}
