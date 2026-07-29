import type { TeamOverview } from '@/types'
import { JUSTIFICATION_CODES, JUSTIFICATION_LABELS, JUSTIFICATION_COLORS } from '@/utils/constants'
import styles from './DashboardPage.module.css'

interface Props {
  overview: TeamOverview
}

export default function Indisponibilidade({ overview }: Props) {
  const justCodes = JUSTIFICATION_CODES.filter((c) => (overview.justCounts[c] || 0) > 0).sort(
    (a, b) => (overview.justCounts[b] || 0) - (overview.justCounts[a] || 0)
  )

  return (
    <div>
      <div className="unavail-summary" style={{ padding: '0 4px 12px', fontSize: 12, color: 'var(--text-mut)', display: 'flex', gap: 24 }}>
        <span>🔴 <strong>{overview.totalJustified}</strong> dias justificados</span>
        <span>📊 <strong>{overview.unavailPct !== null ? Math.round(overview.unavailPct) + '%' : '–'}</strong> de indisponibilidade</span>
      </div>

      {justCodes.length > 0 ? (
        <div className="proj-table-wrap" style={{ maxHeight: 'none' }}>
          <table className="proj-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Justificativa</th>
                <th style={{ textAlign: 'right' }}>Dias</th>
                <th style={{ textAlign: 'right' }}>%</th>
              </tr>
            </thead>
            <tbody>
              {justCodes.map((c) => {
                const count = overview.justCounts[c]
                const pct = Math.round((count / overview.totalJustified) * 100)
                const color = JUSTIFICATION_COLORS[c]
                const pctCls = pct >= 20 ? 'urgent' : pct >= 10 ? 'warn' : 'ok'
                return (
                  <tr key={c}>
                    <td style={{ fontWeight: 600, color: 'var(--text)' }}>
                      <span
                        className="swatch"
                        style={{
                          display: 'inline-block',
                          width: 10,
                          height: 10,
                          borderRadius: 3,
                          background: color.bg,
                          border: `1px solid ${color.text}55`,
                          marginRight: 6,
                          verticalAlign: 'middle',
                        }}
                      />
                      {c}
                    </td>
                    <td>{JUSTIFICATION_LABELS[c] || ''}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--text)' }}>{count}</td>
                    <td style={{ textAlign: 'right' }}>
                      <span className={`proj-gap-cell ${pctCls}`} style={{ display: 'inline-block' }}>
                        {pct}%
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-mut)', fontSize: 13 }}>
          Nenhuma justificativa registrada.
        </div>
      )}
    </div>
  )
}
