import { SCHEMA_VERSION } from '../constants/app'
import { normalizeLedger } from '../domain/ledger'

const pad = value => String(value).padStart(2, '0')

export function backupFileName(date = new Date()) {
  return `hesabketab-backup-${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}.json`
}

export function downloadBackup(data) {
  const content = JSON.stringify({ app: 'hesabketab', exportedAt: new Date().toISOString(), ...data }, null, 2)
  const url = URL.createObjectURL(new Blob([content], { type: 'application/json' }))
  const link = document.createElement('a')
  link.href = url
  link.download = backupFileName()
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

// Reads the text of a backup file. Throws an Error with a Persian message when the file is not usable.
export function parseBackup(text) {
  let raw
  try {
    raw = JSON.parse(text)
  } catch {
    throw new Error('این فایل پشتیبان معتبر نیست.')
  }
  if (!raw || !Array.isArray(raw.people) || !Array.isArray(raw.entries)) {
    throw new Error('ساختار فایل با پشتیبان حساب‌کتاب مطابقت ندارد.')
  }
  if (raw.schemaVersion > SCHEMA_VERSION) {
    throw new Error('این پشتیبان با نسخه‌ی جدیدتری از برنامه ساخته شده است.')
  }
  return normalizeLedger(raw)
}
