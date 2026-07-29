import { useRef } from 'react'
import { useStore } from '@/store/useStore'
import RegionSelect from './RegionSelect'
import MonthNav from './MonthNav'
import styles from './Controls.module.css'

export default function Controls() {
  const fileImportRef = useRef<HTMLInputElement>(null)
  const fileImportReportRef = useRef<HTMLInputElement>(null)
  const importBackup = useStore((s) => s.importBackup)
  const importReport = useStore((s) => s.importReport)

  const handleBackup = () => {
    const state = useStore.getState()
    const blob = new Blob(
      [
        JSON.stringify(
          {
            currentRegion: state.currentRegion,
            currentYear: state.currentYear,
            currentMonth: state.currentMonth,
            rankingMode: state.rankingMode,
            params: state.params,
            regions: state.regions,
          },
          null,
          2
        ),
      ],
      { type: 'application/json' }
    )
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `backup_produtividade_${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string)
        if (!parsed || !parsed.regions) throw new Error('formato inválido')
        if (!confirm('Importar este backup vai substituir os dados atuais em tela. Continuar?')) return
        importBackup(parsed)
      } catch {
        alert('Não foi possível ler este arquivo de backup.')
      }
      e.target.value = ''
    }
    reader.readAsText(file)
  }

  const handleImportReport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const result = importReport(reader.result as ArrayBuffer)
        alert(
          `Relatório importado para "${result.regionName}":\n` +
            `• ${result.updatedTechs} técnico(s) atualizado(s) (${result.newTechs} novo(s) cadastrado(s) automaticamente)\n` +
            `• ${result.updatedDays} dia(s) de produção preenchidos\n` +
            `• ${result.validRows} linha(s) consideradas, ${result.skippedRows} ignorada(s)\n` +
            `A digitação manual nesta região foi bloqueada (os dados agora vêm do relatório oficial).`
        )
      } catch (err) {
        alert(
          'Não foi possível ler este relatório. Verifique se é um .xlsx no formato esperado.'
        )
        console.error(err)
      }
      e.target.value = ''
    }
    reader.readAsArrayBuffer(file)
  }

  return (
    <div className={styles.controls}>
      <RegionSelect />

      <div className={styles.dividerV} />

      <MonthNav />

      <div className={styles.dividerV} />

      <button
        className="btn"
        onClick={() => fileImportReportRef.current?.click()}
        title="Importar relatório .xlsx com o detalhamento de atividades por técnico"
      >
        <span className="material-symbols-rounded" style={{ fontSize: 16 }}>
          upload_file
        </span>{' '}
        Importar relatório
      </button>
      <input
        ref={fileImportReportRef}
        type="file"
        accept=".xlsx,.xls"
        style={{ display: 'none' }}
        onChange={handleImportReport}
      />

      <div className={styles.spacer} />

      <button className="btn btn-ghost" onClick={handleBackup}>
        <span className="material-symbols-rounded" style={{ fontSize: 16 }}>
          save
        </span>{' '}
        Backup
      </button>
      <button
        className="btn btn-ghost"
        onClick={() => fileImportRef.current?.click()}
      >
        <span className="material-symbols-rounded" style={{ fontSize: 16 }}>
          restore
        </span>{' '}
        Importar backup
      </button>
      <input
        ref={fileImportRef}
        type="file"
        accept="application/json"
        style={{ display: 'none' }}
        onChange={handleImportJson}
      />
    </div>
  )
}
