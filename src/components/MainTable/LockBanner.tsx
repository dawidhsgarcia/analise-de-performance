import type { Region } from '@/types'
import { useStore } from '@/store/useStore'

interface Props {
  region: Region
}

export default function LockBanner({ region }: Props) {
  const toggleLock = useStore((s) => s.toggleLock)

  if (!region.locked) return null

  return (
    <div className="lock-banner-inner">
      🔒 Os dados desta região vêm do relatório importado — a digitação manual
      está desativada para evitar divergência com a fonte oficial.
      <button
        className="btn btn-ghost"
        onClick={() => {
          if (
            !confirm(
              'Isso permite digitar valores manualmente nesta região. Se você importar o relatório de novo depois, a tabela volta a ficar bloqueada. Continuar?'
            )
          )
            return
          toggleLock()
        }}
      >
        Habilitar edição manual
      </button>
    </div>
  )
}
