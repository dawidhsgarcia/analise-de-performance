import { useMemo } from 'react'
import type { Region, WeekDay } from '@/types'
import { useStore } from '@/store/useStore'
import { toDateObj } from '@/utils/dates'
import { fmtNum, minScoreForDow } from '@/utils/formatters'
import { getEntry } from '@/services/calculations'
import { Chart, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js'
import { Bar } from 'react-chartjs-2'
import autoDataLabelsPlugin from './autoDataLabelsPlugin'

Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, autoDataLabelsPlugin)

interface Props {
  region: Region
  weeks: WeekDay[][]
  periodKey: string
}

export default function EvolucaoChart({ region, weeks, periodKey }: Props) {
  const dayMeta = useStore((s) => s.params.dayMeta)

  const allDays: WeekDay[] = []
  weeks.forEach((w) => w.forEach((d) => allDays.push(d)))

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const pastBizDays = allDays.filter((d) => d.dow !== 0 && d.dow !== 6 && toDateObj(d) <= today)

  const { labels, data, colors, dailyGoals } = useMemo(() => {
    const lbls: string[] = []
    const vals: number[] = []
    const cols: string[] = []
    const goals: number[] = []

    pastBizDays.forEach((d) => {
      let achieved = 0
      let available = 0
      region.technicians.forEach((tech) => {
        const raw = getEntry(region, tech.funci, d.iso, periodKey)
        if (typeof raw === 'string') return
        available++
        if (typeof raw === 'number') achieved += raw
      })
      const dailyAvg = available > 0 ? Math.round((achieved / available) * 100) / 100 : 0
      lbls.push(d.day + '/' + (d.iso.split('-')[1]))
      vals.push(dailyAvg)
      cols.push(dailyAvg < minScoreForDow(dayMeta, d.dow) ? '#EF4444' : '#10B981')
      goals.push(minScoreForDow(dayMeta, d.dow))
    })

    return { labels: lbls, data: vals, colors: cols, dailyGoals: goals }
  }, [pastBizDays, region, dayMeta, periodKey])

  if (data.length === 0) return <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-mut)', fontSize: 13 }}>Sem dados de dias úteis.</div>

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Média diária (equipe)',
        data,
        backgroundColor: colors,
        borderRadius: 4,
        borderSkipped: false,
        barPercentage: 0.7,
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
          tooltip: {
            callbacks: {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              label: (ctx: any) =>
                (ctx.dataset as { label?: string }).label + ': ' + fmtNum(ctx.parsed.y) + ' pts',
            },
          },
          autoDataLabels: {
            display: true,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter: (v: any, idx: any) => {
              const goal = idx < dailyGoals.length ? dailyGoals[idx] : 0
              const pct = goal > 0 ? Math.round((Number(v) / goal) * 100) : 0
              return fmtNum(Number(v)) + '\n' + pct + '%'
            },
          },
        },
        scales: {
          x: { grid: { display: false }, ticks: { color: '#7A8BAA', maxRotation: 0, autoSkip: false } },
          y: { grid: { display: false }, border: { display: false }, ticks: { display: false }, beginAtZero: true, max: 8 },
        },
      }}
    />
  )
}
