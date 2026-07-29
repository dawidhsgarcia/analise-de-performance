export function fmtNum(n: number | null | undefined): string {
  if (n === null || n === undefined) return ''
  return (Math.round(n * 100) / 100).toLocaleString('pt-BR')
}

export function quartilOf(
  avg: number | null,
  q1: number,
  q2: number,
  q3: number
): number | null {
  if (avg === null) return null
  if (avg > q1) return 1
  if (avg > q2) return 2
  if (avg >= q3) return 3
  return 4
}

export function minScoreForDow(dayMeta: number[], dow: number): number {
  return dayMeta[dow] ?? 0
}

export function MIN_SCORE(dayMeta: number[]): number {
  return Math.max(...dayMeta)
}
