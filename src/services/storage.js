import { INITIAL_DATA, STORAGE_KEY } from '../constants/app'

export function loadLedger() {
  try {
    const savedData = localStorage.getItem(STORAGE_KEY)
    return savedData ? { ...INITIAL_DATA, ...JSON.parse(savedData) } : INITIAL_DATA
  } catch {
    return INITIAL_DATA
  }
}

export function saveLedger(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}
