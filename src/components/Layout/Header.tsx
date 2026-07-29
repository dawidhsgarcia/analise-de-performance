import { useStore } from '@/store/useStore'
import styles from './Header.module.css'

export default function Header() {
  const refreshFromCloud = useStore((s) => s.refreshFromCloud)

  return (
    <header className={styles.header}>
      <div className={styles.titleGroup}>
        <div>
          <h2>Análise de Performance</h2>
          <p>Gestão de Desempenho das Equipes de Campo</p>
        </div>
      </div>
      <div className={styles.actions}>
        <div className={styles.saveIndicator} title="Status de sincronização">
          <span className={styles.saveDot} />
          <span>Salvo</span>
        </div>
        <button
          className={styles.iconBtn}
          onClick={refreshFromCloud}
          type="button"
          title="Atualizar da nuvem"
        >
          <span className="material-symbols-rounded">cloud_sync</span>
        </button>
      </div>
    </header>
  )
}
