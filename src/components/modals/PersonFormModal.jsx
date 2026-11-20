import { useState } from 'react'
import ModalShell from './ModalShell'
import FormField from './FormField'

export default function PersonFormModal({ person, onClose, onSubmit }) {
  const [form, setForm] = useState({ name: person?.name || '', phone: person?.phone || '', note: person?.note || '' })
  const update = (key, value) => setForm(current => ({ ...current, [key]: value }))
  function submit(event) { event.preventDefault(); onSubmit(form) }
  return <ModalShell title={person ? 'ویرایش اطلاعات شخص' : 'افزودن شخص'} onClose={onClose}>
    <form onSubmit={submit}>
      <FormField label="نام و نام خانوادگی" required><input autoFocus value={form.name} onChange={event => update('name', event.target.value)} placeholder="مثلاً ندا احمدی" required /></FormField>
      <FormField label="شماره تماس"><input inputMode="tel" value={form.phone} onChange={event => update('phone', event.target.value)} placeholder="اختیاری" /></FormField>
      <FormField label="توضیحات"><textarea value={form.note} onChange={event => update('note', event.target.value)} placeholder="توضیحات اختیاری" /></FormField>
      <div className="modal-actions"><button type="button" className="outline-btn" onClick={onClose}>انصراف</button><button className="primary-btn" type="submit">ذخیره اطلاعات</button></div>
    </form>
  </ModalShell>
}
