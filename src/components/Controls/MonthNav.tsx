import { useStore } from '@/store/useStore'
import { MONTHS } from '@/utils/constants'

export default function MonthNav() {
  const year = useStore((s) => s.currentYear)
  const month = useStore((s) => s.currentMonth)
  const navigateMonth = useStore((s) => s.navigateMonth)

  return (
    <div className="field">
      <label>Período</label>
      <div className="month-nav">
        <button
          className="btn-icon"
          onClick={() => navigateMonth(-1)}
          aria-label="Mês anterior"
        >
          ‹
        </button>
        <div className="month-label">
          {MONTHS[month]} de {year}
        </div>
        <button
          className="btn-icon"
          onClick={() => navigateMonth(1)}
          aria-label="Próximo mês"
        >
          ›
        </button>
      </div>
    </div>
  )
}
