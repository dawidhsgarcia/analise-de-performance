import { useState } from 'react'
import { useStore } from '@/store/useStore'
import { DOW, DEFAULT_PARAMS } from '@/utils/constants'
import styles from './ParamsPage.module.css'

export default function ParamsPage() {
  const params = useStore((s) => s.params)
  const updateParams = useStore((s) => s.updateParams)
  const resetParams = useStore((s) => s.resetParams)

  const [dayMeta, setDayMeta] = useState([...params.dayMeta])
  const [trendWindow, setTrendWindow] = useState(params.trendWindow)
  const [q1, setQ1] = useState(params.quartil.q1)
  const [q2, setQ2] = useState(params.quartil.q2)
  const [q3, setQ3] = useState(params.quartil.q3)
  const [alertTechBelow, setAlertTechBelow] = useState(params.alertTech.below)
  const [alertTechStreak, setAlertTechStreak] = useState(params.alertTech.streak)
  const [alertTeamPct, setAlertTeamPct] = useState(params.alertTeam.belowPct)
  const [alertTeamStreak, setAlertTeamStreak] = useState(params.alertTeam.streak)
  const [alertProjPct, setAlertProjPct] = useState(params.alertProjection.belowPct)

  const [toast, setToast] = useState('')

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  const handleSave = () => {
    updateParams({
      dayMeta,
      trendWindow,
      quartil: { q1, q2, q3 },
      alertTech: { below: alertTechBelow, streak: alertTechStreak },
      alertTeam: { belowPct: alertTeamPct, streak: alertTeamStreak },
      alertProjection: { belowPct: alertProjPct },
    })
    showToast('Parâmetros salvos com sucesso!')
  }

  const handleReset = () => {
    resetParams()
    const d = DEFAULT_PARAMS
    setDayMeta([...d.dayMeta])
    setTrendWindow(d.trendWindow)
    setQ1(d.quartil.q1)
    setQ2(d.quartil.q2)
    setQ3(d.quartil.q3)
    setAlertTechBelow(d.alertTech.below)
    setAlertTechStreak(d.alertTech.streak)
    setAlertTeamPct(d.alertTeam.belowPct)
    setAlertTeamStreak(d.alertTeam.streak)
    setAlertProjPct(d.alertProjection.belowPct)
    showToast('Parâmetros restaurados!')
  }

  return (
    <div className={styles.paramsWrap}>
      <div className={styles.paramGroup}>
        <h3>Meta por dia da semana</h3>
        <div style={{ fontSize: 12, color: 'var(--text-mut)', marginBottom: 4 }}>
          Pontuação esperada por técnico/dia. Usada no cálculo de meta e % de atingimento.
        </div>
        <div className={styles.paramDayGrid}>
          {DOW.map((d, i) => (
            <div key={i} className={styles.paramDayRow}>
              <span className={styles.paramDayLabel}>
                {d.charAt(0).toUpperCase() + d.slice(1)}
              </span>
              <input
                type="number"
                min={0}
                max={20}
                step={0.5}
                value={dayMeta[i]}
                onChange={(e) => {
                  const v = [...dayMeta]
                  v[i] = parseFloat(e.target.value) || 0
                  setDayMeta(v)
                }}
              />
              <span className={styles.paramUnit}>pts</span>
            </div>
          ))}
        </div>
        <div className={styles.paramRow} style={{ marginTop: 8 }}>
          <label>Janela de tendência (projeção)</label>
          <input
            type="number"
            min={2}
            max={30}
            step={1}
            value={trendWindow}
            onChange={(e) => setTrendWindow(parseInt(e.target.value) || DEFAULT_PARAMS.trendWindow)}
          />
          <span className={styles.paramUnit}>dias</span>
        </div>
      </div>

      <div className={styles.paramGroup}>
        <h3>Limites dos Quartis</h3>
        <div className={styles.paramRow}>
          <label>Q1 (melhor) — acima de</label>
          <input
            type="number"
            min={0}
            max={20}
            step={0.1}
            value={q1}
            onChange={(e) => setQ1(parseFloat(e.target.value) || DEFAULT_PARAMS.quartil.q1)}
          />
          <span className={styles.paramUnit}>pts/dia</span>
        </div>
        <div className={styles.paramRow}>
          <label>Q2 (bom) — acima de</label>
          <input
            type="number"
            min={0}
            max={20}
            step={0.1}
            value={q2}
            onChange={(e) => setQ2(parseFloat(e.target.value) || DEFAULT_PARAMS.quartil.q2)}
          />
          <span className={styles.paramUnit}>pts/dia</span>
        </div>
        <div className={styles.paramRow}>
          <label>Q3 (regular) — acima de</label>
          <input
            type="number"
            min={0}
            max={20}
            step={0.1}
            value={q3}
            onChange={(e) => setQ3(parseFloat(e.target.value) || DEFAULT_PARAMS.quartil.q3)}
          />
          <span className={styles.paramUnit}>pts/dia</span>
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-mut)', paddingLeft: 4 }}>
          Q4 (alerta) = abaixo de Q3
        </div>
      </div>

      <div className={styles.paramGroup}>
        <h3>Alertas Automáticos</h3>
        <div className={styles.paramRow}>
          <label>Técnico: abaixo de</label>
          <input
            type="number"
            min={0}
            max={20}
            step={0.1}
            value={alertTechBelow}
            onChange={(e) =>
              setAlertTechBelow(parseFloat(e.target.value) || DEFAULT_PARAMS.alertTech.below)
            }
          />
          <span className={styles.paramUnit}>pts/dia por</span>
          <input
            type="number"
            min={1}
            max={30}
            step={1}
            value={alertTechStreak}
            onChange={(e) =>
              setAlertTechStreak(parseInt(e.target.value) || DEFAULT_PARAMS.alertTech.streak)
            }
            style={{ width: 60 }}
          />
          <span className={styles.paramUnit}>dia(s) consecutivo(s)</span>
        </div>
        <div className={styles.paramRow}>
          <label>Equipe: abaixo de</label>
          <input
            type="number"
            min={0}
            max={100}
            step={1}
            value={alertTeamPct}
            onChange={(e) =>
              setAlertTeamPct(parseFloat(e.target.value) || DEFAULT_PARAMS.alertTeam.belowPct)
            }
          />
          <span className={styles.paramUnit}>% da meta por</span>
          <input
            type="number"
            min={1}
            max={30}
            step={1}
            value={alertTeamStreak}
            onChange={(e) =>
              setAlertTeamStreak(parseInt(e.target.value) || DEFAULT_PARAMS.alertTeam.streak)
            }
            style={{ width: 60 }}
          />
          <span className={styles.paramUnit}>dia(s) consecutivo(s)</span>
        </div>
        <div className={styles.paramRow}>
          <label>Projeção: abaixo de</label>
          <input
            type="number"
            min={0}
            max={100}
            step={1}
            value={alertProjPct}
            onChange={(e) =>
              setAlertProjPct(parseFloat(e.target.value) || DEFAULT_PARAMS.alertProjection.belowPct)
            }
          />
          <span className={styles.paramUnit}>% da meta</span>
        </div>
      </div>

      <div className={styles.paramActions}>
        <button className="btn btn-primary" onClick={handleSave}>
          Salvar parâmetros
        </button>
        <button className="btn btn-ghost" onClick={handleReset}>
          Restaurar padrões
        </button>
      </div>

      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'var(--primary)',
            color: '#fff',
            padding: '10px 20px',
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 600,
            boxShadow: 'var(--shadow)',
            zIndex: 200,
            animation: 'fadeIn .2s var(--ease)',
            pointerEvents: 'none',
          }}
        >
          {toast}
        </div>
      )}
    </div>
  )
}
