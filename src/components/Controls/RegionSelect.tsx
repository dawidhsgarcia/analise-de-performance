import { useStore } from '@/store/useStore'
import styles from './Controls.module.css'

export default function RegionSelect() {
  const regions = useStore((s) => s.regions)
  const currentRegion = useStore((s) => s.currentRegion)
  const setCurrentRegion = useStore((s) => s.setCurrentRegion)
  const addRegion = useStore((s) => s.addRegion)
  const removeRegion = useStore((s) => s.removeRegion)

  const handleAdd = () => {
    const name = prompt('Nome da nova região (ex: REGIÃO CENTRO-SUL):')
    if (!name?.trim()) return
    addRegion(name.trim())
  }

  const handleRemove = () => {
    if (Object.keys(regions).length <= 1) return
    const region = regions[currentRegion]
    if (!region) return
    if (
      !confirm(
        `Remover a região "${region.name}" e todos os seus dados? Esta ação não pode ser desfeita.`
      )
    )
      return
    removeRegion(currentRegion)
  }

  return (
    <>
      <div className={styles.field}>
        <label>Região</label>
        <select
          value={currentRegion}
          onChange={(e) => setCurrentRegion(e.target.value)}
        >
          {Object.entries(regions).map(([id, r]) => (
            <option key={id} value={id}>
              {r.name}
            </option>
          ))}
        </select>
      </div>
      <button
        className="btn btn-ghost"
        onClick={handleAdd}
        title="Nova região"
      >
        <span className="material-symbols-rounded" style={{ fontSize: 16 }}>
          add
        </span>{' '}
        Região
      </button>
      <button
        className="btn btn-ghost btn-danger"
        onClick={handleRemove}
        disabled={Object.keys(regions).length <= 1}
        title="Remover região"
      >
        <span className="material-symbols-rounded" style={{ fontSize: 16 }}>
          delete
        </span>{' '}
        Remover
      </button>
    </>
  )
}
