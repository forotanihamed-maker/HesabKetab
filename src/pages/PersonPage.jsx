import { useState } from 'react'
import { Activity, ArrowDownLeft, ArrowUpRight, CheckCircle2, ChevronLeft, CreditCard, Pencil, Plus } from 'lucide-react'
import SummaryCard from '../components/common/SummaryCard'
import EmptyState from '../components/common/EmptyState'
import EntryCard from '../components/entries/EntryCard'
import EventList from '../components/activity/EventList'
import { toman } from '../utils'

export default function PersonPage({ person, entries, events, receivable, payable, onBack, onAddEntry, onAddPayment, onEditEntry, onSettle, onDeleteEntry, onDeletePayment, onEditPerson }) {
  const [activeTab, setActiveTab] = useState('active')
  const activeEntries = entries.filter(entry => entry.status === 'active')
  const settledEntries = entries.filter(entry => entry.status === 'settled')
  const visibleEntries = activeTab === 'active' ? activeEntries : activeTab === 'settled' ? settledEntries : entries

  return (
    <>
      <button className="back-link" onClick={onBack}><ChevronLeft size={17} /> بازگشت به اشخاص</button>
      <div className="person-heading">
        <div className="avatar large">{person.name.slice(0, 1)}</div>
        <div className="person-title"><span className="eyebrow">جزئیات شخص</span><h1>{person.name}</h1><p>{person.phone || 'شماره تماس ثبت نشده'}{person.note ? ` · ${person.note}` : ''}</p></div>
        <button className="outline-btn" onClick={onEditPerson}><Pencil size={16} /> ویرایش شخص</button>
      </div>

      <div className="person-stats">
        <SummaryCard title="طلب فعال از این شخص" value={toman(receivable)} icon={<ArrowDownLeft />} tone="green" />
        <SummaryCard title="بدهی فعال به این شخص" value={toman(payable)} icon={<ArrowUpRight />} tone="orange" />
      </div>

      <div className="section-toolbar">
        <div><h2>حساب‌ها</h2><p>صفر شدن مانده، حساب را خودکار تسویه نمی‌کند.</p></div>
        <button className="primary-btn" onClick={onAddEntry}><Plus size={18} /> ثبت بدهی یا طلب</button>
      </div>

      <section className="content-card">
        <div className="tabs">
          <button className={activeTab === 'active' ? 'active' : ''} onClick={() => setActiveTab('active')}>فعال ({activeEntries.length})</button>
          <button className={activeTab === 'settled' ? 'active' : ''} onClick={() => setActiveTab('settled')}>تسویه‌شده ({settledEntries.length})</button>
          <button className={activeTab === 'all' ? 'active' : ''} onClick={() => setActiveTab('all')}>همه ({entries.length})</button>
        </div>
        {visibleEntries.length ? (
          <div className="entry-list">
            {visibleEntries.map(entry => (
              <EntryCard key={entry.id} entry={entry} balance={Math.max(0, Number(entry.amount) - (entry.payments || []).reduce((total, payment) => total + Number(payment.amount), 0))}
                onPayment={() => onAddPayment(entry)} onEdit={() => onEditEntry(entry)} onSettle={() => onSettle(entry)}
                onDelete={() => onDeleteEntry(entry)} onDeletePayment={payment => onDeletePayment(entry, payment)} />
            ))}
          </div>
        ) : <EmptyState icon={<CreditCard />} title="حسابی در این بخش نیست" text={activeTab === 'settled' ? 'حساب‌های تسویه‌شده اینجا نمایش داده می‌شوند.' : 'از ثبت بدهی یا طلب شروع کنید.'} />}
      </section>

      <section className="content-card">
        <div className="section-heading"><div><h2>تاریخچه این شخص</h2><p>ثبت و تغییرات حساب‌ها و پرداخت‌ها</p></div></div>
        {events.length ? <EventList events={events} people={[person]} /> : <EmptyState icon={<Activity />} title="تاریخچه خالی است" text="فعالیت‌های بعدی اینجا ثبت می‌شوند." />}
      </section>
    </>
  )
}
