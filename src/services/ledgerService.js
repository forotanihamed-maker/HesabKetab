import { DIRECTION, ENTRY_STATUS } from '../constants/app'
import {
  buildEntry, buildPayment, buildPerson, findPersonByName, getEntryBalance, getPaidAmount,
  parseAmount, reopenIfUnpaid, summarizeEntries,
} from '../domain/ledger'
import { toman } from '../utils/number'
import { uid } from '../utils/id'
import { today } from '../utils/date'

const directionLabel = direction => direction === DIRECTION.RECEIVABLE ? 'طلب' : 'بدهی'
const appendEvent = (current, personId, text, amount = null) => ({
  ...current, events: [{ id: uid(), personId, text, amount, date: new Date().toISOString() }, ...current.events],
})
const replaceEntry = (current, entryId, update) => ({
  ...current, entries: current.entries.map(item => item.id === entryId ? update(item) : item),
})

export const ledgerService = {
  personExists(people, name, ignoreId = null) {
    return findPersonByName(people, name, ignoreId)
  },
  createPerson(data, name, phone = '', note = '') {
    if (!name.trim()) return { data, message: 'نام شخص الزامی است', person: null }
    const existing = findPersonByName(data.people, name)
    if (existing) return { data, message: 'این شخص از قبل ثبت شده است', person: existing }
    const person = buildPerson({ name, phone, note })
    return { data: { ...data, people: [...data.people, person] }, message: 'شخص جدید ثبت شد', person }
  },
  createEntry(data, personId, form) {
    const amount = parseAmount(form.amount)
    if (!personId || !form.title.trim() || amount === null) return { data, message: 'عنوان و مبلغ معتبر را وارد کنید', success: false }
    const entry = buildEntry(personId, form, amount)
    const next = appendEvent({ ...data, entries: [entry, ...data.entries] }, personId, `${directionLabel(entry.direction)} جدید ثبت شد: ${entry.title}`, entry.amount)
    return { data: next, message: `${directionLabel(entry.direction)} ثبت شد`, success: true }
  },
  createQuickEntry(data, form) {
    const amount = parseAmount(form.amount)
    const name = (form.name || '').trim()
    if (!form.title.trim() || amount === null || (!form.personId && !name)) return { data, message: 'نام شخص، عنوان و مبلغ معتبر را وارد کنید', success: false }
    let personId = form.personId, newPerson = null
    if (!personId) {
      const existing = findPersonByName(data.people, name)
      if (existing) personId = existing.id
      else { newPerson = buildPerson({ name }); personId = newPerson.id }
    }
    const entry = buildEntry(personId, form, amount)
    const next = appendEvent({
      ...data, people: newPerson ? [...data.people, newPerson] : data.people,
      entries: [entry, ...data.entries],
    }, personId, `${directionLabel(entry.direction)} جدید ثبت شد: ${entry.title}`, entry.amount)
    return { data: next, message: newPerson ? 'شخص و حساب جدید ثبت شدند' : `${directionLabel(entry.direction)} ثبت شد`, success: true }
  },
  addPayment(data, entry, form) {
    const amount = parseAmount(form.amount)
    if (amount === null || amount > getEntryBalance(entry)) return { data, message: 'مبلغ پرداخت باید بیشتر از صفر و حداکثر برابر مانده حساب باشد', success: false }
    const payment = buildPayment(amount, form)
    const next = appendEvent(replaceEntry(data, entry.id, item => ({ ...item, payments: [...item.payments, payment] })), entry.personId, `پرداخت ${toman(amount)} برای «${entry.title}» ثبت شد`, amount)
    return { data: next, message: 'پرداخت ثبت شد', success: true }
  },
  updateEntry(data, entry, form) {
    const amount = parseAmount(form.amount)
    if (!form.title.trim() || amount === null || amount < getPaidAmount(entry)) return { data, message: 'مبلغ کل نمی‌تواند کمتر از مجموع پرداخت‌های ثبت‌شده باشد', success: false }
    const changes = { title: form.title.trim(), amount, date: form.date, note: (form.note || '').trim(), direction: form.direction }
    const reopened = entry.status === ENTRY_STATUS.SETTLED && amount > getPaidAmount(entry)
    const next = appendEvent(replaceEntry(data, entry.id, item => reopenIfUnpaid({ ...item, ...changes })), entry.personId, `اطلاعات حساب «${changes.title}» ویرایش شد${reopened ? ' و دوباره فعال شد' : ''}`)
    return { data: next, message: reopened ? 'تغییرات ذخیره شد و حساب دوباره فعال شد' : 'تغییرات ذخیره شد', success: true }
  },
  settleEntry(data, entry) {
    const remaining = getEntryBalance(entry)
    const payment = remaining > 0 ? buildPayment(remaining, { date: today(), note: 'تسویه کامل' }) : null
    const next = appendEvent(replaceEntry(data, entry.id, item => ({
      ...item, payments: payment ? [...item.payments, payment] : item.payments,
      status: ENTRY_STATUS.SETTLED, settledAt: new Date().toISOString(),
    })), entry.personId, `حساب «${entry.title}» تسویه شد`, remaining || null)
    return { data: next, message: 'حساب تسویه شد و در سوابق باقی ماند' }
  },
  deleteEntry(data, entry) {
    return { data: appendEvent({ ...data, entries: data.entries.filter(item => item.id !== entry.id) }, entry.personId, `حساب «${entry.title}» حذف شد`), message: 'حساب حذف شد' }
  },
  deletePayment(data, entry, payment) {
    const reopened = entry.status === ENTRY_STATUS.SETTLED
    const next = appendEvent(replaceEntry(data, entry.id, item => reopenIfUnpaid({ ...item, payments: item.payments.filter(p => p.id !== payment.id) })), entry.personId, `پرداخت ${toman(payment.amount)} از «${entry.title}» حذف شد${reopened ? ' و حساب دوباره فعال شد' : ''}`)
    return { data: next, message: reopened ? 'پرداخت حذف شد و حساب دوباره فعال شد' : 'پرداخت حذف شد' }
  },
  updatePerson(data, person, form) {
    const name = form.name.trim()
    const duplicate = findPersonByName(data.people, name, person.id)
    if (!name || duplicate) return { data, message: duplicate ? 'شخص دیگری با این نام وجود دارد' : 'نام شخص الزامی است', success: false }
    const next = appendEvent({ ...data, people: data.people.map(item => item.id === person.id ? { ...item, name, phone: form.phone.trim(), note: form.note.trim() } : item) }, person.id, 'اطلاعات شخص ویرایش شد')
    return { data: next, message: 'اطلاعات شخص ویرایش شد', success: true }
  },
  totals(entries) { return summarizeEntries(entries) },
  personTotals(entries, personId) { return summarizeEntries(entries.filter(entry => entry.personId === personId)) },
}
