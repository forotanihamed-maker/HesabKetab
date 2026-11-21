import { DIRECTION, ENTRY_STATUS, SCHEMA_VERSION } from '../constants/app'
import { sum } from '../utils/array'
import { today } from '../utils/date'
import { uid } from '../utils/id'

// Pure ledger rules. No React and no browser APIs here, so everything can be tested on its own.

const isObject = value => value !== null && typeof value === 'object' && !Array.isArray(value)
const asArray = value => (Array.isArray(value) ? value : [])
const toNumber = value => (Number.isFinite(Number(value)) ? Number(value) : 0)
const nowIso = () => new Date().toISOString()

export function getPaidAmount(entry) {
  return sum(entry.payments || [], payment => toNumber(payment.amount))
}

export function getEntryBalance(entry) {
  return Math.max(0, toNumber(entry.amount) - getPaidAmount(entry))
}

export function summarizeEntries(entries) {
  const active = entries.filter(entry => entry.status === ENTRY_STATUS.ACTIVE)
  const totalOf = direction => sum(active.filter(entry => entry.direction === direction), getEntryBalance)
  return {
    receivables: totalOf(DIRECTION.RECEIVABLE),
    payables: totalOf(DIRECTION.PAYABLE),
    activeCount: active.length,
  }
}

// Returns a positive number, or null when the value is not a valid amount.
export function parseAmount(value) {
  const amount = Number(value)
  return Number.isFinite(amount) && amount > 0 ? amount : null
}

export const normalizeName = name => String(name ?? '').trim().toLocaleLowerCase()

export function findPersonByName(people, name, ignoreId = null) {
  const target = normalizeName(name)
  return people.find(person => person.id !== ignoreId && normalizeName(person.name) === target)
}

export function buildPerson({ name, phone = '', note = '' }) {
  return { id: uid(), name: name.trim(), phone: phone.trim(), note: note.trim(), createdAt: nowIso() }
}

export function buildEntry(personId, form, amount) {
  return {
    id: uid(), personId, title: form.title.trim(), direction: form.direction,
    amount, date: form.date, note: (form.note || '').trim(), status: ENTRY_STATUS.ACTIVE,
    payments: [], createdAt: nowIso(), kind: 'direct',
  }
}

export function buildPayment(amount, form) {
  return { id: uid(), amount, date: form.date, note: (form.note || '').trim(), createdAt: nowIso() }
}

// A settled account that owes money again (a payment was deleted or the total was raised)
// goes back to the active list; otherwise its balance would silently vanish from the totals.
export function reopenIfUnpaid(entry) {
  if (entry.status !== ENTRY_STATUS.SETTLED || getEntryBalance(entry) <= 0) return entry
  const { settledAt, ...rest } = entry
  return { ...rest, status: ENTRY_STATUS.ACTIVE }
}

function normalizePayment(payment) {
  return {
    ...payment,
    id: payment.id ? String(payment.id) : uid(),
    amount: toNumber(payment.amount),
    date: payment.date || today(),
    note: String(payment.note ?? ''),
  }
}

function normalizeEntry(entry) {
  const normalized = {
    ...entry,
    id: String(entry.id),
    personId: String(entry.personId),
    title: String(entry.title ?? ''),
    direction: Object.values(DIRECTION).includes(entry.direction) ? entry.direction : DIRECTION.RECEIVABLE,
    amount: toNumber(entry.amount),
    date: entry.date || today(),
    note: String(entry.note ?? ''),
    status: Object.values(ENTRY_STATUS).includes(entry.status) ? entry.status : ENTRY_STATUS.ACTIVE,
    payments: asArray(entry.payments).filter(isObject).map(normalizePayment),
  }
  return reopenIfUnpaid(normalized)
}

// Turns anything read from storage or from a backup file into a safe, complete ledger object.
export function normalizeLedger(raw) {
  const source = isObject(raw) ? raw : {}
  return {
    schemaVersion: SCHEMA_VERSION,
    people: asArray(source.people)
      .filter(person => isObject(person) && person.id && String(person.name ?? '').trim())
      .map(person => ({
        ...person,
        id: String(person.id),
        name: String(person.name).trim(),
        phone: String(person.phone ?? ''),
        note: String(person.note ?? ''),
      })),
    entries: asArray(source.entries)
      .filter(entry => isObject(entry) && entry.id && entry.personId)
      .map(normalizeEntry),
    events: asArray(source.events).filter(event => isObject(event) && event.id && event.text),
  }
}
