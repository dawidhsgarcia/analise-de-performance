import { useMemo } from 'react'
import { useStore, useCurrentRegion, usePeriodKey } from '@/store/useStore'
import { buildWeeks } from '@/utils/dates'
import MainTable from './MainTable'
import GoalsTable from './GoalsTable'
import LegendCodes from './LegendCodes'
import LockBanner from './LockBanner'

export default function MainTablePage() {
  const region = useCurrentRegion()
  const year = useStore((s) => s.currentYear)
  const month = useStore((s) => s.currentMonth)
  const periodKey = usePeriodKey()

  const weeks = useMemo(() => buildWeeks(year, month), [year, month])

  if (!region || !region.technicians.length) {
    return (
      <div className="empty-state">
        {!region
          ? 'Nenhuma região cadastrada. Adicione uma região para começar.'
          : 'Nenhum técnico cadastrado nesta região ainda.'}
      </div>
    )
  }

  return (
    <>
      <div className="hint">
        Clique numa célula em branco para escolher uma justificativa na lista,
        ou selecione &quot;✏️ Pontuação&quot; para digitar a nota do dia.
        Justificativas não entram na soma dos totais.
      </div>
      <LegendCodes />
      <LockBanner region={region} />
      <MainTable region={region} weeks={weeks} periodKey={periodKey} />
      <GoalsTable region={region} weeks={weeks} periodKey={periodKey} />
    </>
  )
}
