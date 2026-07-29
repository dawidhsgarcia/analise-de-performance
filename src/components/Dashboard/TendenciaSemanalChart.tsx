import { useMemo } from 'react'
import type { Region, WeekDay } from '@/types'
import { useStore } from '@/store/useStore'
import { toDateObj } from '@/utils/dates'
import { fmtNum, MIN_SCORE } from '@/utils/formatters'
import { getEntry } from '@/services/calculations'
import { Chart, BarElement, CategoryScale, LinearScale, Tooltip } from 'chart.js'
import { Bar } from 'react-chartjs-2'
import autoDataLabelsPlugin from './autoDataLabelsPlugin'

Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, autoDataLabelsPlugin)

interface Props {
  region: Region
  weeks: WeekDay[][]
}

export default function TendenciaSemanalChart({ region, weeks }: Props) {
  const dayMeta = useStore((s) => s.params.dayMeta)
  const year = useStore((s) => s.currentYear)
  const month = useStore((s) => s.currentMonth)
  const periodKey = `${year}-${String(month + 1).padStart(2, '0')}`

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const { labels, values, colors } = useMemo(() => {
    const lbls: string[] = []
    const vals: number[] = []
    const cols: string[] = []

    weeks.forEach((w, i) => {
      const bizDays = w.filter((d) => d.dow !== 0 && d.dow !== 6 && toDateObj(d) <= today)
      let totalPts = 0
      let totalAvail = 0
      bizDays.forEach((d) => {
        region.technicians.forEach((tech) => {
          const raw = getEntry(region, tech.funci, d.iso, periodKey)
          if (typeof raw !== 'string') {
            totalAvail++
            if (typeof raw === 'number') totalPts += raw
          }
        })
      })
      const avg = totalAvail > 0 ? Math.round((totalPts / totalAvail) * 100) / 100 : 0
      lbls.push('Sem ' + (i + 1))
      vals.push(avg)
      cols.push(avg >= MIN_SCORE(dayMeta) ? '#10B981' : '#EF4444')
    })

    return { labels: lbls, values: vals, colors: cols }
  }, [weeks, region, periodKey, dayMeta, today])

  if (values.length === 0) return null

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Média semanal',
        data: values,
        backgroundColor: colors,
        borderRadius: 6,
        borderSkipped: false,
        barPercentage: 0.6,
      },
    ],
  }

  return (
    <Bar
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
              label: (ctx: any) => 'Média: ' + fmtNum(ctx.parsed.y) + '/dia',
            },
          },
          autoDataLabels: {
            display: true,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter: (v: any) => fmtNum(Number(v)),
          },
        },
        scales: {
          x: { grid: { display: false }, ticks: { color: '#7A8BAA' } },
          y: { grid: { display: false }, border: { display: false }, ticks: { display: false }, beginAtZero: true, max: 8 },
        },
      }}
    />
  )
}
