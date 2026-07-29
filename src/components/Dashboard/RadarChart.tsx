import { useMemo } from 'react'
import type { RankingRow, TeamGoalsSummary, TeamOverview } from '@/types'
import { fmtNum } from '@/utils/formatters'
import { Chart, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js'
import { Radar } from 'react-chartjs-2'

Chart.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend)

interface Props {
  rankingRows: RankingRow[]
  teamAvg: number
  goals: TeamGoalsSummary
  overview: TeamOverview
}

export default function RadarChart({ rankingRows, teamAvg, goals, overview }: Props) {
  const textColor = getComputedStyle(document.documentElement).getPropertyValue('--text').trim() || '#1B2D52'
  const borderColor = getComputedStyle(document.documentElement).getPropertyValue('--border').trim() || '#BFCFE8'

  const chartData = useMemo(() => {
    const avgPct = Math.min((teamAvg / 8) * 100, 100)

    const allAvgs = rankingRows.filter((r) => r.avg !== null).map((r) => r.avg as number)
    const stdDev =
      allAvgs.length > 1
        ? Math.sqrt(allAvgs.reduce((s, v) => s + Math.pow(v - teamAvg, 2), 0) / allAvgs.length)
        : 0
    const consistencia = teamAvg > 0 ? Math.max(0, Math.min(100, (1 - stdDev / teamAvg) * 100)) : 0

    const totalProdDays = rankingRows.reduce((s, r) => s + r.days, 0)
    const totalBusDays = rankingRows.length * (overview.pastBusinessDaysCount || 1)
    const diasProdPct = totalBusDays > 0 ? (totalProdDays / totalBusDays) * 100 : 0

    const metaPct = goals.pct !== null ? Math.min(goals.pct, 150) : 0
    const dispPct = overview.unavailPct !== null ? 100 - overview.unavailPct : 100

    return {
      labels: ['Média', 'Consistência', 'Dias Produtivos', 'Meta Atingida', 'Disponibilidade'],
      datasets: [
        {
          label: 'Equipe',
          data: [avgPct, consistencia, diasProdPct, metaPct, dispPct],
          backgroundColor: 'rgba(59,125,216,0.18)',
          borderColor: '#3B7DD8',
          borderWidth: 2,
          pointBackgroundColor: '#3B7DD8',
          pointBorderColor: '#fff',
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    }
  }, [rankingRows, teamAvg, goals, overview])

  return (
    <Radar
      data={chartData}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          tooltip: {
            callbacks: {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              label: (ctx: any) => {
                const labels = [
                  fmtNum(teamAvg) + ' pts/dia',
                  Math.round(chartData.datasets[0].data[1] as number) + '%',
                  Math.round(chartData.datasets[0].data[2] as number) + '%',
                  Math.round(chartData.datasets[0].data[3] as number) + '%',
                  Math.round(chartData.datasets[0].data[4] as number) + '%',
                ]
                return ctx.label + ': ' + labels[ctx.dataIndex]
              },
            },
          },
        },
        scales: {
          r: {
            beginAtZero: true,
            max: 100,
            grid: { color: borderColor },
            angleLines: { color: borderColor },
            pointLabels: {
              color: textColor,
              font: { size: 11 },
            },
            ticks: { display: false },
          },
        },
      }}
    />
  )
}
