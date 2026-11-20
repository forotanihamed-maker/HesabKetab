import { useMemo, useState } from 'react'
import { today } from '../../utils'
import ModalShell from './ModalShell'
import FormField from './FormField'
import AmountInput from './AmountInput'
import PersianDateInput from './PersianDateInput'

export default function HomeEntryModal({ people, onClose, onSubmit }) {
  const [query, setQuery] = useState('')
  const [personId, setPersonId] = useState('')
  const [newPerson, setNewPerson] = useState(false)
  const [name, setName] = useState('')
  const [form, setForm] = useState({ direction: 'receivable', title: '', amount: '', date: today(), note: '' })
  const matches = useMemo(() => people.filter(p => p.name.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())), [people, query])
  const update = (key, value) => setForm(current => ({ ...current, [key]: value }))
  function submit(e) { e.preventDefault(); onSubmit({ ...form, personId, newPerson, name }) }
  return <ModalShell title="ثبت سریع طلب یا بدهی" onClose={onClose}><form onSubmit={submit}>
    <FormField label="شخص" required>
      {!newPerson ? <>
        <input value={query} onChange={e => {setQuery(e.target.value);setPersonId('')}} placeholder="نام شخص را جست‌وجو کنید..." />
        <div className="quick-person-results">{matches.slice(0,5).map(p => <button type="button" key={p.id} className={personId===p.id?'selected':''} onClick={()=>{setPersonId(p.id);setQuery(p.name)}}>{p.name}</button>)}
        {query.trim() && !people.some(p=>p.name.trim().toLocaleLowerCase()===query.trim().toLocaleLowerCase()) && <button type="button" className="quick-new-person" onClick={()=>{setNewPerson(true);setName(query.trim())}}>+ ثبت «{query.trim()}» به‌عنوان شخص جدید</button>}</div>
      </> : <><input value={name} onChange={e=>setName(e.target.value)} placeholder="نام شخص جدید" required/><button className="text-btn" type="button" onClick={()=>{setNewPerson(false);setQuery(name);setName('')}}>انتخاب از اشخاص ثبت‌شده</button></>}
    </FormField>
    <FormField label="نوع حساب"><div className="segmented"><button type="button" className={form.direction==='receivable'?'selected green':''} onClick={()=>update('direction','receivable')}>طلب (دریافت)</button><button type="button" className={form.direction==='payable'?'selected orange':''} onClick={()=>update('direction','payable')}>بدهی (پرداخت)</button></div></FormField>
    <FormField label="عنوان / دلیل" required><input value={form.title} onChange={e=>update('title',e.target.value)} placeholder="مثلاً خرید دمنوش" required/></FormField>
    <FormField label="مبلغ (تومان)" required><AmountInput value={form.amount} onChange={value=>update('amount',value)} required /></FormField>
    <FormField label="تاریخ (شمسی)" required><PersianDateInput value={form.date} onChange={value=>update('date',value)} required /></FormField>
    <FormField label="توضیحات"><textarea value={form.note} onChange={e=>update('note',e.target.value)} /></FormField>
    <div className="modal-actions"><button type="button" className="outline-btn" onClick={onClose}>انصراف</button><button type="submit" className="primary-btn" disabled={!newPerson&&!personId}>ثبت حساب</button></div>
  </form></ModalShell>
}
