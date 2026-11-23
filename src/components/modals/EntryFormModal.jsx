import { useState } from 'react'
import { DIRECTION } from '../../constants/app'
import { today } from '../../utils'
import ModalShell from './ModalShell'
import FormField from './FormField'
import AmountInput from './AmountInput'
import PersianDateInput from './PersianDateInput'

export default function EntryFormModal({ entry, onClose, onSubmit }) {
  const [form, setForm] = useState(() => ({
    title: entry?.title || '', amount: entry?.amount ?? '', date: entry?.date || today(),
    note: entry?.note || '', direction: entry?.direction || DIRECTION.RECEIVABLE,
  }))
  const update = (key, value) => setForm(current => ({ ...current, [key]: value }))
  function submit(event) { event.preventDefault(); onSubmit(form) }
  return <ModalShell title={entry ? 'ویرایش حساب' : 'ثبت طلب یا بدهی'} onClose={onClose}>
    <form onSubmit={submit}>
      <FormField label="نوع حساب" required><div className="segmented">
        <button type="button" className={form.direction === DIRECTION.RECEIVABLE ? 'selected green' : ''} onClick={() => update('direction', DIRECTION.RECEIVABLE)}>طلب؛ باید دریافت شود</button>
        <button type="button" className={form.direction === DIRECTION.PAYABLE ? 'selected orange' : ''} onClick={() => update('direction', DIRECTION.PAYABLE)}>بدهی؛ باید پرداخت شود</button>
      </div></FormField>
      <FormField label="عنوان / دلیل حساب" required><input value={form.title} onChange={event => update('title', event.target.value)} placeholder="مثلاً بابت خرید قبلی" required /></FormField>
      <FormField label="مبلغ کل (تومان)" required><AmountInput value={form.amount} onChange={value => update('amount', value)} required /></FormField>
      <FormField label="تاریخ ثبت (شمسی)" required><PersianDateInput value={form.date} onChange={value => update('date', value)} required /></FormField>
      <FormField label="توضیحات"><textarea value={form.note} onChange={event => update('note', event.target.value)} placeholder="اختیاری" /></FormField>
      <p className="form-hint">{form.direction === DIRECTION.RECEIVABLE ? 'این مبلغ به مجموع طلب‌ها اضافه می‌شود و پرداخت‌های بعدی از مانده آن کم می‌شوند.' : 'این مبلغ به مجموع بدهی‌ها اضافه می‌شود و با ثبت پرداخت، مانده آن کاهش می‌یابد.'}</p>
      <div className="modal-actions"><button type="button" className="outline-btn" onClick={onClose}>انصراف</button><button className="primary-btn" type="submit">{entry ? 'ذخیره تغییرات' : 'ثبت حساب'}</button></div>
    </form>
  </ModalShell>
}
