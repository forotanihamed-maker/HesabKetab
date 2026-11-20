import { useEffect, useMemo, useState } from 'react'
import { loadLedger, saveLedger } from '../services/storage'
import { sum, toman, uid, today } from '../utils'

export function getEntryBalance(entry) {
  const paid = sum(entry.payments || [], payment => Number(payment.amount))
  return Math.max(0, Number(entry.amount) - paid)
}

export function useLedger(notify, navigateToPerson) {
  const [data, setData] = useState(loadLedger)

  useEffect(() => {
    try { saveLedger(data) }
    catch { notify('ذخیره اطلاعات در مرورگر ناموفق بود') }
  }, [data, notify])

  const activeEntries = useMemo(() => data.entries.filter(entry => entry.status === 'active'), [data.entries])
  const totals = useMemo(() => ({
    receivables: sum(activeEntries.filter(entry => entry.direction === 'receivable'), getEntryBalance),
    payables: sum(activeEntries.filter(entry => entry.direction === 'payable'), getEntryBalance),
    activeCount: activeEntries.length,
  }), [activeEntries])

  const withEvent = (current, personId, text, amount = null) => ({
    ...current,
    events: [{ id: uid(), personId, text, amount, date: new Date().toISOString() }, ...current.events],
  })

  function createPerson(name, phone = '', note = '') {
    const cleanName = name.trim()
    if (!cleanName) return
    const existing = data.people.find(person => person.name.trim().toLocaleLowerCase() === cleanName.toLocaleLowerCase())
    if (existing) {
      navigateToPerson(existing.id)
      notify('این شخص از قبل ثبت شده است')
      return
    }
    const person = { id: uid(), name: cleanName, phone: phone.trim(), note: note.trim(), createdAt: new Date().toISOString() }
    setData(current => ({ ...current, people: [...current.people, person] }))
    navigateToPerson(person.id)
    notify('شخص جدید ثبت شد')
  }

  function createEntry(personId, form) {
    const amount = Number(form.amount)
    if (!personId || !form.title.trim() || !Number.isFinite(amount) || amount <= 0) {
      notify('عنوان و مبلغ معتبر را وارد کنید')
      return false
    }
    const entry = {
      id: uid(), personId, title: form.title.trim(), direction: form.direction,
      amount, date: form.date, note: (form.note || '').trim(), status: 'active',
      payments: [], createdAt: new Date().toISOString(), kind: 'direct',
    }
    setData(current => {
      const updated = { ...current, entries: [entry, ...current.entries] }
      return withEvent(updated, personId, `${entry.direction === 'receivable' ? 'طلب' : 'بدهی'} جدید ثبت شد: ${entry.title}`, amount)
    })
    notify(entry.direction === 'receivable' ? 'طلب ثبت شد' : 'بدهی ثبت شد')
    return true
  }

  function createQuickEntry(form) {
    const amount = Number(form.amount)
    if (!form.title.trim() || !Number.isFinite(amount) || amount <= 0 || (!form.personId && !form.name.trim())) {
      notify('نام شخص، عنوان و مبلغ معتبر را وارد کنید')
      return false
    }
    let personId = form.personId
    let personToCreate = null
    if (!personId) {
      const existing = data.people.find(person => person.name.trim().toLocaleLowerCase() === form.name.trim().toLocaleLowerCase())
      if (existing) personId = existing.id
      else personToCreate = { id: uid(), name: form.name.trim(), phone: '', note: '', createdAt: new Date().toISOString() }, personId = personToCreate.id
    }
    const entry = { id: uid(), personId, title: form.title.trim(), direction: form.direction, amount, date: form.date, note: (form.note || '').trim(), status: 'active', payments: [], createdAt: new Date().toISOString(), kind: 'direct' }
    setData(current => {
      const updated = { ...current, people: personToCreate ? [...current.people, personToCreate] : current.people, entries: [entry, ...current.entries] }
      return withEvent(updated, personId, `${entry.direction === 'receivable' ? 'طلب' : 'بدهی'} جدید ثبت شد: ${entry.title}`, amount)
    })
    notify(personToCreate ? 'شخص و حساب جدید ثبت شدند' : entry.direction === 'receivable' ? 'طلب ثبت شد' : 'بدهی ثبت شد')
    return true
  }

  function addPayment(entry, form) {
    const amount = Number(form.amount)
    if (!Number.isFinite(amount) || amount <= 0 || amount > getEntryBalance(entry)) {
      notify('مبلغ پرداخت باید بیشتر از صفر و حداکثر برابر مانده حساب باشد')
      return false
    }
    const payment = { id: uid(), amount, date: form.date, note: (form.note || '').trim(), createdAt: new Date().toISOString() }
    setData(current => {
      const updated = { ...current, entries: current.entries.map(item => item.id === entry.id ? { ...item, payments: [...(item.payments || []), payment] } : item) }
      return withEvent(updated, entry.personId, `پرداخت ${toman(amount)} برای «${entry.title}» ثبت شد`, amount)
    })
    notify('پرداخت ثبت شد')
    return true
  }

  function updateEntry(entry, form) {
    const amount = Number(form.amount)
    const paid = sum(entry.payments || [], payment => Number(payment.amount))
    if (!form.title.trim() || !Number.isFinite(amount) || amount <= 0 || amount < paid) {
      notify('مبلغ کل نمی‌تواند کمتر از مجموع پرداخت‌های ثبت‌شده باشد')
      return false
    }
    setData(current => {
      const updated = { ...current, entries: current.entries.map(item => item.id === entry.id ? { ...item, title: form.title.trim(), amount, date: form.date, note: (form.note || '').trim(), direction: form.direction } : item) }
      return withEvent(updated, entry.personId, `اطلاعات حساب «${form.title.trim()}» ویرایش شد`)
    })
    notify('تغییرات ذخیره شد')
    return true
  }

  function settleEntry(entry) {
    const remaining = getEntryBalance(entry)
    if (!window.confirm(remaining > 0 ? `مانده ${toman(remaining)} به‌عنوان پرداخت نهایی ثبت و حساب تسویه شود؟` : 'این حساب تسویه و از فهرست فعال خارج شود؟')) return
    const settlementPayment = remaining > 0 ? { id: uid(), amount: remaining, date: today(), note: 'تسویه کامل', createdAt: new Date().toISOString() } : null
    setData(current => {
      const updated = { ...current, entries: current.entries.map(item => item.id === entry.id ? { ...item, payments: settlementPayment ? [...(item.payments || []), settlementPayment] : (item.payments || []), status: 'settled', settledAt: new Date().toISOString() } : item) }
      return withEvent(updated, entry.personId, `حساب «${entry.title}» تسویه شد`, remaining || null)
    })
    notify('حساب تسویه شد و در سوابق باقی ماند')
  }

  function deleteEntry(entry) {
    if (!window.confirm('این حساب و پرداخت‌های مرتبط با آن حذف شوند؟')) return
    setData(current => {
      const updated = { ...current, entries: current.entries.filter(item => item.id !== entry.id) }
      return withEvent(updated, entry.personId, `حساب «${entry.title}» حذف شد`)
    })
    notify('حساب حذف شد')
  }

  function deletePayment(entry, payment) {
    if (!window.confirm('این پرداخت حذف شود؟')) return
    setData(current => {
      const updated = { ...current, entries: current.entries.map(item => item.id === entry.id ? { ...item, payments: item.payments.filter(currentPayment => currentPayment.id !== payment.id) } : item) }
      return withEvent(updated, entry.personId, `پرداخت ${toman(payment.amount)} از «${entry.title}» حذف شد`)
    })
    notify('پرداخت حذف شد')
  }

  function updatePerson(person, form) {
    const cleanName = form.name.trim()
    const duplicate = data.people.find(item => item.id !== person.id && item.name.trim().toLocaleLowerCase() === cleanName.toLocaleLowerCase())
    if (!cleanName || duplicate) {
      notify(duplicate ? 'شخص دیگری با این نام وجود دارد' : 'نام شخص الزامی است')
      return false
    }
    setData(current => {
      const updated = { ...current, people: current.people.map(item => item.id === person.id ? { ...item, name: cleanName, phone: form.phone.trim(), note: form.note.trim() } : item) }
      return withEvent(updated, person.id, 'اطلاعات شخص ویرایش شد')
    })
    notify('اطلاعات شخص ویرایش شد')
    return true
  }

  function getPersonTotals(personId) {
    const entries = data.entries.filter(entry => entry.personId === personId && entry.status === 'active')
    return {
      receivables: sum(entries.filter(entry => entry.direction === 'receivable'), getEntryBalance),
      payables: sum(entries.filter(entry => entry.direction === 'payable'), getEntryBalance),
    }
  }

  return { data, totals, createPerson, createEntry, createQuickEntry, addPayment, updateEntry, settleEntry, deleteEntry, deletePayment, updatePerson, getPersonTotals }
}
