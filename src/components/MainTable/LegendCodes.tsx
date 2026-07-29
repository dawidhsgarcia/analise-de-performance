import { JUSTIFICATION_CODES, JUSTIFICATION_LABELS, JUSTIFICATION_COLORS } from '@/utils/constants'

export default function LegendCodes() {
  return (
    <div className="legend-codes">
      {JUSTIFICATION_CODES.map((c) => (
        <span key={c}>
          <span
            className="swatch"
            style={{
              background: JUSTIFICATION_COLORS[c].bg,
              border: `1px solid ${JUSTIFICATION_COLORS[c].text}55`,
            }}
          />
          <strong>{c}</strong> {JUSTIFICATION_LABELS[c]}
        </span>
      ))}
    </div>
  )
}
