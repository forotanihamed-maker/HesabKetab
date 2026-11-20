import { STORAGE_KEY } from '../constants/app'
import { normalizeLedger } from '../domain/ledger'

export function loadLedger() {
  try {
    const savedData = localStorage.getItem(STORAGE_KEY)
    return normalizeLedger(savedData ? JSON.parse(savedData) : null)
  } catch {
    return normalizeLedger(null)
  }
}

export function saveLedger(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}
