import * as XLSX from 'xlsx'
import type { Region, ActivitySla, TechSla } from '@/types'
import { excelSerialToDate, isoDate, pad } from '@/utils/dates'

interface RawRow {
  [key: string]: unknown
}

interface AggData {
  [period: string]: {
    [funci: string]: {
      [iso: string]: number
    }
  }
}

function normalizeRowKeys(row: RawRow): RawRow {
  const out: RawRow = {}
  Object.keys(row).forEach((k) => {
    out[String(k).trim().toLowerCase()] = row[k]
  })
  return out
}

export interface ImportResult {
  region: Region
  updatedTechs: number
  newTechs: number
  updatedDays: number
  validRows: number
  skippedRows: number
  bestPeriod: string | null
}

export function applyActivityReport(rawRows: RawRow[], region: Region): ImportResult {
  const agg: AggData = {}
  const nomes: Record<string, string> = {}
  const activitySla: Record<string, ActivitySla> = {}
  const techSla: Record<string, TechSla> = {}
  let validRows = 0
  let skippedRows = 0
  let slaEvaluated = 0
  let slaOnTime = 0
  let totalOSCount = 0

  rawRows.forEach((raw) => {
    const row = normalizeRowKeys(raw)
    const funci = row['funcid'] ? String(row['funcid']).trim() : ''
    const baremo = parseFloat(row['baremo'] as string)
    const expurgado = Number(row['expurgo_dupla']) === 1
    const dataFechamento =
      excelSerialToDate(row['data_fechamento']) || excelSerialToDate(row['data_abertura'])

    if (!funci || isNaN(baremo) || !dataFechamento || expurgado) {
      skippedRows++
      return
    }
    validRows++
    totalOSCount++
    if (Number(row['avalia_prazo']) === 1) slaEvaluated++
    if (Number(row['realizado_no_prazo']) === 1) slaOnTime++

    if (!techSla[funci]) techSla[funci] = { evaluated: 0, onTime: 0 }
    if (Number(row['avalia_prazo']) === 1) techSla[funci].evaluated++
    if (Number(row['realizado_no_prazo']) === 1) techSla[funci].onTime++

    const y = dataFechamento.getUTCFullYear()
    const m = dataFechamento.getUTCMonth()
    const d = dataFechamento.getUTCDate()
    const period = `${y}-${pad(m + 1)}`
    const iso = isoDate(y, m, d)

    if (row['tecnico']) nomes[funci] = String(row['tecnico']).trim().toUpperCase()

    const atividade = row['atividade'] ? String(row['atividade']).trim() : null
    if (atividade && !atividade.toUpperCase().includes('APOIO')) {
      if (!activitySla[atividade]) activitySla[atividade] = { total: 0, evaluated: 0, onTime: 0 }
      activitySla[atividade].total++
      if (Number(row['avalia_prazo']) === 1) activitySla[atividade].evaluated++
      if (Number(row['realizado_no_prazo']) === 1) activitySla[atividade].onTime++
    }

    if (!agg[period]) agg[period] = {}
    if (!agg[period][funci]) agg[period][funci] = {}
    if (!agg[period][funci][iso]) agg[period][funci][iso] = 0
    agg[period][funci][iso] += baremo
  })

  region.activitySla = activitySla
  region.slaCounts = { evaluated: slaEvaluated, onTime: slaOnTime }
  region.totalOS = totalOSCount
  region.techSla = techSla

  let newTechs = 0
  let updatedDays = 0
  const updatedTechsSet = new Set<string>()
  let bestPeriod: string | null = null
  let bestPeriodCount = -1

  Object.keys(agg).forEach((period) => {
    let periodCount = 0
    Object.keys(agg[period]).forEach((funci) => {
      let tech = region.technicians.find((t) => t.funci === funci)
      if (!tech) {
        tech = { funci, nome: nomes[funci] || funci }
        region.technicians.push(tech)
        newTechs++
      }
      if (!region.entries[period]) region.entries[period] = {}
      if (!region.entries[period][funci]) region.entries[period][funci] = {}
      Object.keys(agg[period][funci]).forEach((iso) => {
        region.entries[period][funci][iso] = Math.round(agg[period][funci][iso] * 100) / 100
        updatedDays++
        periodCount++
      })
      updatedTechsSet.add(funci)
    })
    if (periodCount > bestPeriodCount) {
      bestPeriodCount = periodCount
      bestPeriod = period
    }
  })

  region.locked = true

  return {
    region,
    updatedTechs: updatedTechsSet.size,
    newTechs,
    updatedDays,
    validRows,
    skippedRows,
    bestPeriod,
  }
}

export function parseWorkbook(data: ArrayBuffer): RawRow[] {
  const wb = XLSX.read(data, { type: 'array', cellDates: true })
  const sheetName = wb.SheetNames.includes('Export') ? 'Export' : wb.SheetNames[0]
  const ws = wb.Sheets[sheetName]
  return XLSX.utils.sheet_to_json(ws, { defval: null })
}
