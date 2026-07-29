import type { Params, JustificationColor } from '@/types'

export const DOW = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb']
export const MONTHS = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
]

export const JUSTIFICATION_CODES = ['BH', 'DSR', 'FE', 'FR', 'AT', 'TR', 'LI', 'MV', 'IN']

export const JUSTIFICATION_LABELS: Record<string, string> = {
  BH: 'Banco de Horas',
  DSR: 'Descanso Semanal',
  FE: 'Férias',
  FR: 'Feriado',
  AT: 'Atestado',
  TR: 'Treinamento',
  LI: 'Licença',
  MV: 'Manutenção Veicular',
  IN: 'Interjornadas',
}

export const JUSTIFICATION_COLORS: Record<string, JustificationColor> = {
  BH: { bg: '#f1cfcf', text: '#762222' },
  DSR: { bg: '#f1eccf', text: '#766a22' },
  FE: { bg: '#d9f1cf', text: '#3a7622' },
  FR: { bg: '#f1e0cf', text: '#764c22' },
  AT: { bg: '#cff1e2', text: '#227652' },
  TR: { bg: '#cfe2f1', text: '#225276' },
  LI: { bg: '#d9cff1', text: '#3a2276' },
  MV: { bg: '#f1cfec', text: '#76226a' },
  IN: { bg: '#cfeef1', text: '#226a76' },
}

export const DEFAULT_PARAMS: Params = {
  dayMeta: [0, 4, 4, 4, 4, 4, 0],
  trendWindow: 7,
  quartil: { q1: 3.5, q2: 2.5, q3: 1.0 },
  alertTech: { below: 2.0, streak: 3 },
  alertTeam: { belowPct: 70, streak: 2 },
  alertProjection: { belowPct: 80 },
}

export const STORAGE_KEY = 'produtividade-alpha-solucoes-v3'
