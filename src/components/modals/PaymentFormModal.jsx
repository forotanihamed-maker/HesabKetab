import { useState } from 'react'
import { today, toman } from '../../utils'
import { getEntryBalance } from '../../domain/ledger'
import ModalShell from './ModalShell'
import FormField from './FormField'
import AmountInput from './AmountInput'
import PersianDateInput from './PersianDateInput'

export default function PaymentFormModal({ entry, onClose, onSubmit }) {
  const remaining = getEntryBalance(entry)
  const [form, setForm] = useState({ amount: '', date: today(), note: '' })
  const update = (key, value) => setForm(current => ({ ...current, [key]: value }))
  function submit(event) { event.preventDefault(); onSubmit(form) }
  return <ModalShell title="ثبت پرداخت" onClose={onClose}>
    <form onSubmit={submit}>
      <p className="form-hint">حساب: «{entry.title}» · مانده فعلی: {toman(remaining)}</p>
      <FormField label="مبلغ پرداخت (تومان)" required><AmountInput value={form.amount} onChange={value => update('amount', value)} max={remaining} required /></FormField>
      <FormField label="تاریخ پرداخت (شمسی)" required><PersianDateInput value={form.date} onChange={value => update('date', value)} required /></FormField>
      <FormField label="توضیحات"><textarea value={form.note} onChange={event => update('note', event.target.value)} placeholder="اختیاری" /></FormField>
      <div className="modal-actions"><button type="button" className="outline-btn" onClick={onClose}>انصراف</button><button className="primary-btn" type="submit">ثبت پرداخت</button></div>
    </form>
  </ModalShell>
}
