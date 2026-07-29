import { useState, useCallback, useRef, useEffect } from 'react'
import { useStore } from '@/store/useStore'
import { JUSTIFICATION_CODES, JUSTIFICATION_COLORS, JUSTIFICATION_LABELS } from '@/utils/constants'

interface Props {
  funci: string
  iso: string
  value: number | string | null
  weekend: boolean
  locked: boolean
}

export default function DayCell({ funci, iso, value, weekend, locked }: Props) {
  const setEntry = useStore((s) => s.setEntry)
  const [mode, setMode] = useState<'select' | 'input'>(() =>
    typeof value === 'number' ? 'input' : 'select'
  )
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (mode === 'input' && inputRef.current) {
      inputRef.current.focus()
    }
  }, [mode])

  const handleSelectChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const val = e.target.value
      if (val === '__SCORE__') {
        setMode('input')
        return
      }
      setEntry(funci, iso, val === '' ? null : val)
    },
    [funci, iso, setEntry]
  )

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.trim()
      if (raw === '') {
        setEntry(funci, iso, null)
        return
      }

      const code = raw.toUpperCase()
      if (JUSTIFICATION_CODES.includes(code)) {
        setEntry(funci, iso, code)
        setMode('select')
        return
      }

      const num = parseFloat(raw.replace(',', '.'))
      if (isNaN(num)) {
        alert(
          `Valor inválido. Digite uma pontuação (número) ou uma justificativa: ${JUSTIFICATION_CODES.join(', ')}.`
        )
        return
      }
      if (locked) {
        alert(
          'Esta região está com a pontuação bloqueada. Você ainda pode digitar uma justificativa (BH, DSR, FE, FR, AT, TR, LI, MV, IN) em dias sem produção.'
        )
        return
      }
      setEntry(funci, iso, num)
    },
    [funci, iso, locked, setEntry]
  )

  const isCode = typeof value === 'string'
  const isScore = typeof value === 'number'
  const codeColor = isCode && JUSTIFICATION_COLORS[value]
    ? JUSTIFICATION_COLORS[value]
    : null

  const weekendClass = weekend ? ' weekend' : ''

  if (isScore) {
    return (
      <td className={`day-cell${weekendClass}`}>
        <input
          ref={inputRef}
          type="text"
          maxLength={6}
          defaultValue={value}
          placeholder="–"
          disabled={locked}
          onChange={handleInputChange}
          style={{
            width: '100%',
            minWidth: 26,
            border: 'none',
            background: 'transparent',
            textAlign: 'center',
            fontSize: 12,
            padding: '8px 2px',
            color: 'var(--text)',
            fontVariantNumeric: 'tabular-nums',
            fontFamily: 'inherit',
            fontWeight: 600,
            borderRadius: 6,
          }}
        />
      </td>
    )
  }

  return (
    <td className={`day-cell${weekendClass}`}>
      <select
        className="day-select"
        value={isCode ? value : ''}
        onChange={handleSelectChange}
        style={{
          ...(codeColor
            ? { background: codeColor.bg, color: codeColor.text }
            : {}),
        }}
        title={
          isCode && JUSTIFICATION_LABELS[value as string]
            ? JUSTIFICATION_LABELS[value as string]
            : 'Escolha uma justificativa'
        }
      >
        <option value="">–</option>
        <option value="__SCORE__" disabled={locked}>
          ✏️ Pontuação
        </option>
        {JUSTIFICATION_CODES.map((c) => {
          const col = JUSTIFICATION_COLORS[c]
          return (
            <option
              key={c}
              value={c}
              style={{ background: col.bg, color: col.text }}
            >
              {c}
            </option>
          )
        })}
      </select>
    </td>
  )
}
