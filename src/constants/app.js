export const STORAGE_KEY = 'hesabketab-v1'

// Bump this when the shape of the saved data changes, and handle the old shape in normalizeLedger.
export const SCHEMA_VERSION = 1

export const INITIAL_DATA = { schemaVersion: SCHEMA_VERSION, people: [], entries: [], events: [] }

export const PAGE = {
  HOME: 'home',
  PEOPLE: 'people',
  PERSON: 'person',
  ACTIVITY: 'activity',
  BACKUP: 'backup',
}

export const DIRECTION = {
  RECEIVABLE: 'receivable',
  PAYABLE: 'payable',
}

export const ENTRY_STATUS = {
  ACTIVE: 'active',
  SETTLED: 'settled',
}
