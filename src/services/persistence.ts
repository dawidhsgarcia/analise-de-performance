import type { AppState } from '@/types'
import { DEFAULT_PARAMS, STORAGE_KEY } from '@/utils/constants'
import { loadFromFirestore } from './firebase'

function migrateLoadedState(parsed: AppState): AppState | null {
  if (!parsed || !parsed.regions) return null

  if (parsed.currentRegion && !parsed.regions[parsed.currentRegion]) {
    const keys = Object.keys(parsed.regions)
    parsed.currentRegion = keys.length > 0 ? keys[0] : ''
  }

  Object.values(parsed.regions).forEach((r) => {
    if (typeof r.locked !== 'boolean') r.locked = false
    if (!r.slaCounts) r.slaCounts = { evaluated: 0, onTime: 0 }
    if (typeof r.totalOS !== 'number') r.totalOS = 0
    if (!r.techSla) r.techSla = {}
    if (!r.activitySla) r.activitySla = {}
  })

  if (parsed.rankingMode !== 'business' && parsed.rankingMode !== 'worked') {
    parsed.rankingMode = 'business'
  }
  if (!parsed.params) parsed.params = JSON.parse(JSON.stringify(DEFAULT_PARAMS))
  if (parsed.params && !parsed.params.dayMeta) {
    const oldMin = (parsed.params as unknown as Record<string, unknown>).minScore as number || 4
    parsed.params.dayMeta = [0, oldMin, oldMin, oldMin, oldMin, oldMin, 0]
    delete (parsed.params as unknown as Record<string, unknown>).minScore
  }

  return parsed
}

export async function loadState(): Promise<AppState | null> {
  try {
    const fromFirestore = await loadFromFirestore()
    if (fromFirestore) {
      const migrated = migrateLoadedState(fromFirestore)
      if (migrated) return migrated
    }
  } catch {
    /* Firestore unavailable — fall through to localStorage */
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as AppState
      const migrated = migrateLoadedState(parsed)
      if (migrated) return migrated
    }
  } catch {
    /* localStorage unavailable */
  }

  return null
}

export function saveToLocal(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    /* localStorage unavailable */
  }
}

export function exportState(state: AppState): string {
  return JSON.stringify(state, null, 2)
}
