import { useEffect, useMemo, useState } from 'react'
import { DIRECTION, ENTRY_STATUS } from '../constants/app'
import {
  buildEntry, buildPayment, buildPerson, findPersonByName, getEntryBalance, getPaidAmount,
  normalizeLedger, parseAmount, reopenIfUnpaid, summarizeEntries,
} from '../domain/ledger'
import { loadLedger, saveLedger } from '../services/storage'
import { toman, uid, today } from '../utils'

const directionLabel = direction => (direction === DIRECTION.RECEIVABLE ? 'طلب' : 'بدهی')

function appendEvent(current, personId, text, amount = null) {
  return {
    ...current,
    events: [{ id: uid(), personId, text, amount, date: new Date().toISOString() }, ...current.events],
  }
}

function replaceEntry(current, entryId, update) {
  return { ...current, entries: current.entries.map(item => (item.id === entryId ? update(item) : item)) }
}

export function useLedger(notify, navigateToPerson) {
  const [data, setData] = useState(loadLedger)

  useEffect(() => {
    try { saveLedger(data) }
    catch { notify('ذخیره اطلاعات در مرورگر ناموفق بود') }
  }, [data, notify])

  const totals = useMemo(() => summarizeEntries(data.entries), [data.entries])

  function createPerson(name, phone = '', note = '') {
    if (!name.trim()) return
    const existing = findPersonByName(data.people, name)
    if (existing) {
      navigateToPerson(existing.id)
      notify('این شخص از قبل ثبت شده است')
      return
    }
    const person = buildPerson({ name, phone, note })
    setData(current => ({ ...current, people: [...current.people, person] }))
    navigateToPerson(person.id)
    notify('شخص جدید ثبت شد')
  }

  // Shared by createEntry and createQuickEntry: saves the entry (and a new person, if any) plus its history event.
  function commitEntry(entry, newPerson = null) {
    setData(current => appendEvent(
      {
        ...current,
        people: newPerson ? [...current.people, newPerson] : current.people,
        entries: [entry, ...current.entries],
      },
      entry.personId,
      `${directionLabel(entry.direction)} جدید ثبت شد: ${entry.title}`,
      entry.amount,
    ))
  }

  function createEntry(personId, form) {
    const amount = parseAmount(form.amount)
    if (!personId || !form.title.trim() || amount === null) {
      notify('عنوان و مبلغ معتبر را وارد کنید')
      return false
    }
    const entry = buildEntry(personId, form, amount)
    commitEntry(entry)
    notify(`${directionLabel(entry.direction)} ثبت شد`)
    return true
  }

  function createQuickEntry(form) {
    const amount = parseAmount(form.amount)
    const name = (form.name || '').trim()
    if (!form.title.trim() || amount === null || (!form.personId && !name)) {
      notify('نام شخص، عنوان و مبلغ معتبر را وارد کنید')
      return false
    }

    let personId = form.personId
    let newPerson = null
    if (!personId) {
      const existing = findPersonByName(data.people, name)
      if (existing) {
        personId = existing.id
      } else {
        newPerson = buildPerson({ name })
        personId = newPerson.id
      }
    }

    const entry = buildEntry(personId, form, amount)
    commitEntry(entry, newPerson)
    notify(newPerson ? 'شخص و حساب جدید ثبت شدند' : `${directionLabel(entry.direction)} ثبت شد`)
    return true
  }

  function addPayment(entry, form) {
    const amount = parseAmount(form.amount)
    if (amount === null || amount > getEntryBalance(entry)) {
      notify('مبلغ پرداخت باید بیشتر از صفر و حداکثر برابر مانده حساب باشد')
      return false
    }
    const payment = buildPayment(amount, form)
    setData(current => appendEvent(
      replaceEntry(current, entry.id, item => ({ ...item, payments: [...item.payments, payment] })),
      entry.personId,
      `پرداخت ${toman(amount)} برای «${entry.title}» ثبت شد`,
      amount,
    ))
    notify('پرداخت ثبت شد')
    return true
  }

  function updateEntry(entry, form) {
    const amount = parseAmount(form.amount)
    if (!form.title.trim() || amount === null || amount < getPaidAmount(entry)) {
      notify('مبلغ کل نمی‌تواند کمتر از مجموع پرداخت‌های ثبت‌شده باشد')
      return false
    }
    const changes = { title: form.title.trim(), amount, date: form.date, note: (form.note || '').trim(), direction: form.direction }
    const reopened = entry.status === ENTRY_STATUS.SETTLED && amount > getPaidAmount(entry)
    setData(current => appendEvent(
      replaceEntry(current, entry.id, item => reopenIfUnpaid({ ...item, ...changes })),
      entry.personId,
      `اطلاعات حساب «${changes.title}» ویرایش شد${reopened ? ' و دوباره فعال شد' : ''}`,
    ))
    notify(reopened ? 'تغییرات ذخیره شد و حساب دوباره فعال شد' : 'تغییرات ذخیره شد')
    return true
  }

  function settleEntry(entry) {
    const remaining = getEntryBalance(entry)
    const question = remaining > 0
      ? `مانده ${toman(remaining)} به‌عنوان پرداخت نهایی ثبت و حساب تسویه شود؟`
      : 'این حساب تسویه و از فهرست فعال خارج شود؟'
    if (!window.confirm(question)) return
    const settlementPayment = remaining > 0 ? buildPayment(remaining, { date: today(), note: 'تسویه کامل' }) : null
    setData(current => appendEvent(
      replaceEntry(current, entry.id, item => ({
        ...item,
        payments: settlementPayment ? [...item.payments, settlementPayment] : item.payments,
        status: ENTRY_STATUS.SETTLED,
        settledAt: new Date().toISOString(),
      })),
      entry.personId,
      `حساب «${entry.title}» تسویه شد`,
      remaining || null,
    ))
    notify('حساب تسویه شد و در سوابق باقی ماند')
  }

  function deleteEntry(entry) {
    if (!window.confirm('این حساب و پرداخت‌های مرتبط با آن حذف شوند؟')) return
    setData(current => appendEvent(
      { ...current, entries: current.entries.filter(item => item.id !== entry.id) },
      entry.personId,
      `حساب «${entry.title}» حذف شد`,
    ))
    notify('حساب حذف شد')
  }

  function deletePayment(entry, payment) {
    if (!window.confirm('این پرداخت حذف شود؟')) return
    const reopened = entry.status === ENTRY_STATUS.SETTLED
    setData(current => appendEvent(
      replaceEntry(current, entry.id, item => reopenIfUnpaid({
        ...item,
        payments: item.payments.filter(currentPayment => currentPayment.id !== payment.id),
      })),
      entry.personId,
      `پرداخت ${toman(payment.amount)} از «${entry.title}» حذف شد${reopened ? ' و حساب دوباره فعال شد' : ''}`,
    ))
    notify(reopened ? 'پرداخت حذف شد و حساب دوباره فعال شد' : 'پرداخت حذف شد')
  }

  function updatePerson(person, form) {
    const cleanName = form.name.trim()
    const duplicate = findPersonByName(data.people, cleanName, person.id)
    if (!cleanName || duplicate) {
      notify(duplicate ? 'شخص دیگری با این نام وجود دارد' : 'نام شخص الزامی است')
      return false
    }
    setData(current => appendEvent(
      {
        ...current,
        people: current.people.map(item => (
          item.id === person.id ? { ...item, name: cleanName, phone: form.phone.trim(), note: form.note.trim() } : item
        )),
      },
      person.id,
      'اطلاعات شخص ویرایش شد',
    ))
    notify('اطلاعات شخص ویرایش شد')
    return true
  }

  function getPersonTotals(personId) {
    return summarizeEntries(data.entries.filter(entry => entry.personId === personId))
  }

  // Replaces everything with a backup file's content (the page has already asked the user to confirm).
  function importData(backup) {
    setData(normalizeLedger(backup))
    notify('اطلاعات از فایل پشتیبان بازیابی شد')
  }

  return {
    data, totals, createPerson, createEntry, createQuickEntry, addPayment, updateEntry,
    settleEntry, deleteEntry, deletePayment, updatePerson, getPersonTotals, importData,
  }
}
