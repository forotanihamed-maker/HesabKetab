import { useEffect, useMemo, useState } from 'react'
import { normalizeLedger } from '../domain/ledger'
import { loadLedger, saveLedger } from '../services/storage'
import { ledgerService } from '../services/ledgerService'

export function useLedger(notify, navigateToPerson) {
  const [data, setData] = useState(loadLedger)

  useEffect(() => {
    try { saveLedger(data) }
    catch { notify('ذخیره اطلاعات در مرورگر ناموفق بود') }
  }, [data, notify])

  const totals = useMemo(() => ledgerService.totals(data.entries), [data.entries])

  const applyResult = result => {
    if (result.data !== data) setData(result.data)
    if (result.message) notify(result.message)
    return result
  }

  function createPerson(name, phone = '', note = '') {
    const result = ledgerService.createPerson(data, name, phone, note)
    applyResult(result)
    if (result.person) navigateToPerson(result.person.id)
  }
  function createEntry(personId, form) { return applyResult(ledgerService.createEntry(data, personId, form)).success }
  function createQuickEntry(form) { return applyResult(ledgerService.createQuickEntry(data, form)).success }
  function addPayment(entry, form) { return applyResult(ledgerService.addPayment(data, entry, form)).success }
  function updateEntry(entry, form) { return applyResult(ledgerService.updateEntry(data, entry, form)).success }
  function settleEntry(entry) { applyResult(ledgerService.settleEntry(data, entry)) }
  function deleteEntry(entry) { applyResult(ledgerService.deleteEntry(data, entry)) }
  function deletePayment(entry, payment) { applyResult(ledgerService.deletePayment(data, entry, payment)) }
  function updatePerson(person, form) { return applyResult(ledgerService.updatePerson(data, person, form)).success }
  function getPersonTotals(personId) { return ledgerService.personTotals(data.entries, personId) }
  function importData(backup) { setData(normalizeLedger(backup)); notify('اطلاعات از فایل پشتیبان بازیابی شد') }

  return {
    data, totals, createPerson, createEntry, createQuickEntry, addPayment, updateEntry,
    settleEntry, deleteEntry, deletePayment, updatePerson, getPersonTotals, importData,
  }
}
