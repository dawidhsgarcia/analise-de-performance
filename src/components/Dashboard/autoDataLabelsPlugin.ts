import { Chart } from 'chart.js'

declare module 'chart.js' {
  interface PluginOptionsByType<TType> {
    autoDataLabels?: {
      display?: boolean
      formatter?: (v: number, idx: number) => string
    }
  }
}

const autoDataLabelsPlugin = {
  id: 'autoDataLabels',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  afterDatasetsDraw(chart: any, _args: any, options: any) {
    if (!options || !options.display) return

    const { ctx } = chart
    const isDoughnut = chart.config.type === 'doughnut' || chart.config.type === 'pie'

    chart.data.datasets.forEach((ds: any, i: number) => {
      if (ds.type === 'line') return
      const meta = chart.getDatasetMeta(i)
      if (meta.hidden) return

      const total = isDoughnut
        ? ds.data.reduce((a: number, b: number) => a + b, 0)
        : 0

      meta.data.forEach((el: any, idx: number) => {
        const v = ds.data[idx]
        if (v === 0 || v === null || v === undefined) return

        ctx.save()
        ctx.font = '600 11px Inter, sans-serif'

        if (isDoughnut) {
          const sum = ds.data.slice(0, idx).reduce((a: number, b: number) => a + b, 0)
          const angle = ((sum + v / 2) / total) * Math.PI * 2 - Math.PI / 2
          const r = (el.innerRadius + el.outerRadius) / 2
          const cx = el.x + Math.cos(angle) * r
          const cy = el.y + Math.sin(angle) * r
          ctx.fillStyle = '#fff'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(String(v), cx, cy)
        } else {
          ctx.fillStyle = '#1B2D52'
          const raw = options.formatter ? options.formatter(v, idx) : String(v)
          const lines = String(raw).split('\n')
          ctx.textAlign = 'center'
          ctx.textBaseline = 'bottom'
          lines.forEach((line: string, li: number) => {
            ctx.fillText(line, el.x, el.y - 4 - (lines.length - 1 - li) * 13)
          })
        }

        ctx.restore()
      })
    })
  },
}

export default autoDataLabelsPlugin
