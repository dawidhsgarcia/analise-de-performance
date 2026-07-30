import { create } from 'zustand'
import type { AppState, Region, Technician } from '@/types'
import { DEFAULT_PARAMS, STORAGE_KEY } from '@/utils/constants'
import { loadState, saveToLocal } from '@/services/persistence'
import { saveToFirestore } from '@/services/firebase'
import { periodKey } from '@/utils/dates'
import { parseWorkbook, applyActivityReport } from '@/services/xlsxParser'

interface Actions {
  setCurrentRegion: (id: string) => void
  setCurrentMonth: (year: number, month: number) => void
  navigateMonth: (delta: number) => void
  setRankingMode: (mode: 'business' | 'worked') => void
  addRegion: (name: string) => string
  removeRegion: (id: string) => void
  addTechnician: (funci: string, nome: string) => void
  removeTechnician: (funci: string) => void
  setEntry: (funci: string, iso: string, value: number | string | null) => void
  updateParams: (params: Partial<AppState['params']>) => void
  resetParams: () => void
  toggleLock: () => void
  importReport: (data: ArrayBuffer) => ImportReportResult
  importBackup: (state: AppState) => void
  scheduleSave: () => void
  loadInitialState: () => Promise<void>
  refreshFromCloud: () => Promise<void>
  toastMessage: string | null
  showToast: (msg: string) => void
}

export interface ImportReportResult {
  updatedTechs: number
  newTechs: number
  updatedDays: number
  validRows: number
  skippedRows: number
  bestPeriod: string | null
  regionName: string
}

function seedState(): AppState {
  const now = new Date()
  return {
    currentRegion: '',
    currentYear: now.getFullYear(),
    currentMonth: now.getMonth(),
    rankingMode: 'business',
    params: JSON.parse(JSON.stringify(DEFAULT_PARAMS)),
    regions: {},
  }
}

export const useStore = create<AppState & Actions>((set, get) => {
  let saveTimer: ReturnType<typeof setTimeout> | null = null

  return {
    ...seedState(),
    toastMessage: null as string | null,

    showToast: (msg: string) => {
      set({ toastMessage: msg })
      setTimeout(() => set({ toastMessage: null }), 3000)
    },

    setCurrentRegion: (id: string) => set({ currentRegion: id }),

    setCurrentMonth: (year: number, month: number) =>
      set({ currentYear: year, currentMonth: month }),

    navigateMonth: (delta: number) => {
      const state = get()
      let newMonth = state.currentMonth + delta
      let newYear = state.currentYear
      if (newMonth < 0) {
        newMonth = 11
        newYear--
      } else if (newMonth > 11) {
        newMonth = 0
        newYear++
      }
      set({ currentMonth: newMonth, currentYear: newYear })
    },

    setRankingMode: (mode: 'business' | 'worked') => set({ rankingMode: mode }),

    addRegion: (name: string): string => {
      const id = 'r_' + Date.now()
      set((state) => ({
        regions: {
          ...state.regions,
          [id]: {
            name: name.trim().toUpperCase(),
            technicians: [],
            entries: {},
            locked: false,
          },
        },
        currentRegion: id,
      }))
      return id
    },

    removeRegion: (id: string) => {
      const state = get()
      if (Object.keys(state.regions).length <= 1) return
      const newRegions = { ...state.regions }
      delete newRegions[id]
      const newCurrent = Object.keys(newRegions)[0]
      set({ regions: newRegions, currentRegion: newCurrent })
    },

    addTechnician: (funci: string, nome: string) => {
      set((state) => {
        if (!state.regions[state.currentRegion]) return state
        const region = { ...state.regions[state.currentRegion] }
        region.technicians = [...region.technicians, { funci, nome: nome.toUpperCase() }]
        return { regions: { ...state.regions, [state.currentRegion]: region } }
      })
      get().scheduleSave()
    },

    removeTechnician: (funci: string) => {
      set((state) => {
        if (!state.regions[state.currentRegion]) return state
        const region = { ...state.regions[state.currentRegion] }
        region.technicians = region.technicians.filter((t) => t.funci !== funci)
        return { regions: { ...state.regions, [state.currentRegion]: region } }
      })
      get().scheduleSave()
    },

    setEntry: (funci: string, iso: string, value: number | string | null) => {
      set((state) => {
        if (!state.regions[state.currentRegion]) return state
        const region = { ...state.regions[state.currentRegion] }
        const pk = periodKey(state.currentYear, state.currentMonth)

        const entries = { ...region.entries }
        if (!entries[pk]) entries[pk] = {}
        if (!entries[pk][funci]) entries[pk][funci] = {}

        const techEntries = { ...entries[pk][funci] }
        if (value === null) {
          delete techEntries[iso]
        } else {
          techEntries[iso] = value
        }
        entries[pk][funci] = techEntries
        region.entries = entries

        return { regions: { ...state.regions, [state.currentRegion]: region } }
      })
      get().scheduleSave()
    },

    updateParams: (partial: Partial<AppState['params']>) => {
      set((state) => ({
        params: { ...state.params, ...partial },
      }))
      get().scheduleSave()
    },

    resetParams: () => {
      set({ params: JSON.parse(JSON.stringify(DEFAULT_PARAMS)) })
      get().scheduleSave()
    },

    toggleLock: () => {
      set((state) => {
        if (!state.regions[state.currentRegion]) return state
        const region = { ...state.regions[state.currentRegion] }
        region.locked = !region.locked
        return { regions: { ...state.regions, [state.currentRegion]: region } }
      })
      get().scheduleSave()
    },

    importReport: (data: ArrayBuffer): ImportReportResult => {
      const state = get()
      if (!state.regions[state.currentRegion]) {
        return { updatedTechs: 0, newTechs: 0, updatedDays: 0, validRows: 0, skippedRows: 0, bestPeriod: null, regionName: '' }
      }
      const rawRows = parseWorkbook(data)
      const region = JSON.parse(JSON.stringify(state.regions[state.currentRegion])) as Region
      const result = applyActivityReport(rawRows, region)

      set((s) => ({
        regions: { ...s.regions, [s.currentRegion]: region },
        currentYear: result.bestPeriod
          ? parseInt(result.bestPeriod.split('-')[0])
          : s.currentYear,
        currentMonth: result.bestPeriod
          ? parseInt(result.bestPeriod.split('-')[1]) - 1
          : s.currentMonth,
      }))

      get().scheduleSave()
      return {
        updatedTechs: result.updatedTechs,
        newTechs: result.newTechs,
        updatedDays: result.updatedDays,
        validRows: result.validRows,
        skippedRows: result.skippedRows,
        bestPeriod: result.bestPeriod,
        regionName: region.name,
      }
    },

    importBackup: (importedState: AppState) => {
      set(importedState)
      saveToLocal(importedState)
      get().scheduleSave()
    },

    scheduleSave: () => {
      if (saveTimer) clearTimeout(saveTimer)
      saveTimer = setTimeout(async () => {
        const state = get()
        const stateObj: AppState = {
          currentRegion: state.currentRegion,
          currentYear: state.currentYear,
          currentMonth: state.currentMonth,
          rankingMode: state.rankingMode,
          params: state.params,
          regions: state.regions,
        }

        saveToLocal(stateObj)
        await saveToFirestore(stateObj)
      }, 400)
    },

    loadInitialState: async () => {
      const persisted = await loadState()
      if (persisted && Object.keys(persisted.regions).length > 0) {
        if (!persisted.regions[persisted.currentRegion]) {
          persisted.currentRegion = Object.keys(persisted.regions)[0]
        }
        set(persisted)
      }
    },

    refreshFromCloud: async () => {
      const fresh = await loadState()
      if (fresh) {
        if (!fresh.regions[fresh.currentRegion]) {
          fresh.currentRegion = Object.keys(fresh.regions)[0] || ''
        }
        set(fresh)
        get().showToast('Dados atualizados da nuvem.')
      } else {
        get().showToast('Nenhum dado encontrado na nuvem.')
      }
    },
  }
})

export function useCurrentRegion(): Region | undefined {
  return useStore((s) => s.regions[s.currentRegion])
}

export function usePeriodKey(): string {
  const year = useStore((s) => s.currentYear)
  const month = useStore((s) => s.currentMonth)
  return periodKey(year, month)
}
