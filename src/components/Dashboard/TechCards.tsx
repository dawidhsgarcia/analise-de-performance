import type { Region, WeekDay, RankingRow } from '@/types'
import { useStore } from '@/store/useStore'
import { toDateObj } from '@/utils/dates'
import { fmtNum, MIN_SCORE } from '@/utils/formatters'
import { getEntry } from '@/services/calculations'
import styles from './DashboardPage.module.css'

interface Props {
  region: Region
  weeks: WeekDay[][]
  rankingRows: RankingRow[]
  periodKey: string
}

export default function TechCards({ region, weeks, rankingRows, periodKey }: Props) {
  const dayMeta = useStore((s) => s.params.dayMeta)

  const allDays: WeekDay[] = []
  weeks.forEach((w) => w.forEach((d) => allDays.push(d)))

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const businessDaysPast = allDays.filter((d) => d.dow !== 0 && d.dow !== 6 && toDateObj(d) <= today)

  if (businessDaysPast.length === 0) {
    return <div style={{ padding: 16, color: 'var(--text-mut)', fontSize: 12 }}>Sem dados de dias úteis para exibir.</div>
  }

  const sparkW = 100
  const sparkH = 28

  return (
    <div className={styles.techCardsGrid}>
      {rankingRows.map((r) => {
        const q = r.quartil || 0
        const avgLabel = r.avg !== null ? fmtNum(r.avg) : '–'
        const avgCls = 'q' + q
        const badgeLabel = r.quartil ? r.quartil + 'º Quartil' : 'Sem dados'
        const progressPct = r.days > 0 ? Math.round((r.days / businessDaysPast.length) * 100) : 0

        const techSlaData = region.techSla?.[r.tech.funci] || { evaluated: 0, onTime: 0 }
        const slaPctTech =
          techSlaData.evaluated > 0
            ? Math.round((techSlaData.onTime / techSlaData.evaluated) * 100)
            : null

        const trendVals: number[] = []
        for (let i = businessDaysPast.length - 1; i >= 0 && trendVals.length < 10; i--) {
          const raw = getEntry(region, r.tech.funci, businessDaysPast[i].iso, periodKey)
          if (typeof raw === 'number') trendVals.unshift(raw)
        }

        let sparkSvg = ''
        if (trendVals.length >= 2) {
          const maxVal = Math.max(...trendVals, MIN_SCORE(dayMeta))
          const minVal = 0
          const range = maxVal - minVal || 1
          const points = trendVals
            .map((v, i) => {
              const x = (i / (trendVals.length - 1)) * sparkW
              const y = sparkH - ((v - minVal) / range) * (sparkH - 4) - 2
              return `${Math.round(x)},${Math.round(y)}`
            })
            .join(' ')
          const lineColor =
            q === 1 ? '#10B981' : q === 2 ? '#3B82F6' : q === 3 ? '#F59E0B' : q === 4 ? '#EF4444' : '#9CA3AF'
          const fillColor =
            q === 1
              ? '#10B98118'
              : q === 2
              ? '#3B82F618'
              : q === 3
              ? '#F59E0B18'
              : q === 4
              ? '#EF444418'
              : '#9CA3AF18'
          const fillPoints = `0,${sparkH} ${points} ${sparkW},${sparkH}`
          sparkSvg = `<svg viewBox="0 0 ${sparkW} ${sparkH}" preserveAspectRatio="none">
            <polygon points="${fillPoints}" fill="${fillColor}"/>
            <polyline points="${points}" fill="none" stroke="${lineColor}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>`
        } else if (trendVals.length === 1) {
          const y = sparkH / 2
          const lineColor =
            q === 1 ? '#10B981' : q === 2 ? '#3B82F6' : q === 3 ? '#F59E0B' : q === 4 ? '#EF4444' : '#9CA3AF'
          sparkSvg = `<svg viewBox="0 0 ${sparkW} ${sparkH}" preserveAspectRatio="none">
            <circle cx="${sparkW / 2}" cy="${y}" r="3" fill="${lineColor}"/>
          </svg>`
        }

        return (
          <div key={r.tech.funci} className={styles.techCard}>
            <div className={styles.techCardHeader}>
              <div>
                <div className={styles.techCardName} title={r.tech.nome}>
                  {r.tech.nome}
                </div>
                <div className={styles.techCardFunci}>{r.tech.funci}</div>
              </div>
              <div className={`${styles.techCardAvg} ${styles[avgCls]}`}>
                {avgLabel}
              </div>
            </div>
            <div className={styles.techCardMeta}>
              <span>{r.days} dia(s) com produção</span>
              <span className={`${styles.techCardBadge} ${styles[avgCls]}`}>
                {badgeLabel}
              </span>
            </div>
            <div className={styles.techCardProgress}>
              <div
                className={`${styles.techCardProgressBar} ${styles[avgCls]}`}
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <div className={styles.techCardMeta}>
              <span>
                {r.days}/{businessDaysPast.length} dias úteis ({progressPct}%)
              </span>
              <span>{fmtNum(r.sum || 0)} pts total</span>
            </div>
            <div className={styles.techCardMeta}>
              <span
                style={{
                  fontSize: 10,
                  color:
                    slaPctTech !== null && slaPctTech >= 90
                      ? '#065F46'
                      : slaPctTech !== null && slaPctTech < 70
                      ? '#991B1B'
                      : 'var(--text-2)',
                }}
              >
                SLA:{' '}
                {slaPctTech !== null ? slaPctTech + '%' : '–'}
                {techSlaData.evaluated > 0
                  ? ' (' + techSlaData.onTime + '/' + techSlaData.evaluated + ' OS)'
                  : ''}
              </span>
            </div>
            <div
              className={styles.techCardSparkline}
              dangerouslySetInnerHTML={{
                __html:
                  sparkSvg ||
                  '<div style="text-align:center;color:var(--text-mut);font-size:9px;line-height:28px;">sem dados</div>',
              }}
            />
          </div>
        )
      })}
    </div>
  )
}
