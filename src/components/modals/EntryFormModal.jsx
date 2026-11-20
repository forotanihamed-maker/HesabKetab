import { useState } from 'react'
import { today } from '../../utils'
import ModalShell from './ModalShell'
import FormField from './FormField'

export default function EntryFormModal({ entry, onClose, onSubmit }) {
  const [form, setForm] = useState(() => ({
    title: entry?.title || '', amount: entry?.amount ?? '', date: entry?.date || today(),
    note: entry?.note || '', direction: entry?.direction || 'receivable',
  }))
  const update = (key, value) => setForm(current => ({ ...current, [key]: value }))
  function submit(event) { event.preventDefault(); onSubmit(form) }
  return <ModalShell title={entry ? 'ویرایش حساب' : 'ثبت طلب یا بدهی'} onClose={onClose}>
    <form onSubmit={submit}>
      <FormField label="نوع حساب" required><div className="segmented">
        <button type="button" className={form.direction === 'receivable' ? 'selected green' : ''} onClick={() => update('direction', 'receivable')}>طلب؛ باید دریافت شود</button>
        <button type="button" className={form.direction === 'payable' ? 'selected orange' : ''} onClick={() => update('direction', 'payable')}>بدهی؛ باید پرداخت شود</button>
      </div></FormField>
      <FormField label="عنوان / دلیل حساب" required><input value={form.title} onChange={event => update('title', event.target.value)} placeholder="مثلاً بابت خرید قبلی" required /></FormField>
      <FormField label="مبلغ کل (تومان)" required><input type="number" min="1" step="1" value={form.amount} onChange={event => update('amount', event.target.value)} placeholder="مبلغ به تومان" required /></FormField>
      <FormField label="تاریخ ثبت" required><input type="date" value={form.date} onChange={event => update('date', event.target.value)} required /></FormField>
      <FormField label="توضیحات"><textarea value={form.note} onChange={event => update('note', event.target.value)} placeholder="اختیاری" /></FormField>
      <p className="form-hint">{form.direction === 'receivable' ? 'این مبلغ به مجموع طلب‌ها اضافه می‌شود و پرداخت‌های بعدی از مانده آن کم می‌شوند.' : 'این مبلغ به مجموع بدهی‌ها اضافه می‌شود و با ثبت پرداخت، مانده آن کاهش می‌یابد.'}</p>
      <div className="modal-actions"><button type="button" className="outline-btn" onClick={onClose}>انصراف</button><button className="primary-btn" type="submit">{entry ? 'ذخیره تغییرات' : 'ثبت حساب'}</button></div>
    </form>
  </ModalShell>
}
