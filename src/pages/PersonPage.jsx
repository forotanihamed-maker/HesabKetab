import { useState } from 'react'
import { Activity, ArrowDownLeft, ArrowUpRight, ChevronLeft, CreditCard, Pencil, Plus } from 'lucide-react'
import SummaryCard from '../components/common/SummaryCard'
import EmptyState from '../components/common/EmptyState'
import EntryCard from '../components/entries/EntryCard'
import EventList from '../components/activity/EventList'
import { ENTRY_STATUS } from '../constants/app'
import { getEntryBalance, groupByDirection } from '../domain/ledger'
import { toman } from '../utils'

export default function PersonPage({ person, entries, events, receivable, payable, onBack, onAddEntry, onAddPayment, onEditEntry, onSettle, onDeleteEntry, onDeletePayment, onEditPerson }) {
  const [activeTab, setActiveTab] = useState(ENTRY_STATUS.ACTIVE)
  const activeEntries = entries.filter(entry => entry.status === ENTRY_STATUS.ACTIVE)
  const settledEntries = entries.filter(entry => entry.status === ENTRY_STATUS.SETTLED)
  const visibleEntries = activeTab === ENTRY_STATUS.ACTIVE ? activeEntries : activeTab === ENTRY_STATUS.SETTLED ? settledEntries : entries
  const { receivables: receivableEntries, payables: payableEntries } = groupByDirection(visibleEntries)
  const renderEntryList = list => list.length ? <div className="entry-list">{list.map(entry => (
    <EntryCard key={entry.id} entry={entry} balance={getEntryBalance(entry)}
      onPayment={() => onAddPayment(entry)} onEdit={() => onEditEntry(entry)} onSettle={() => onSettle(entry)}
      onDelete={() => onDeleteEntry(entry)} onDeletePayment={payment => onDeletePayment(entry, payment)} />
  ))}</div> : <EmptyState icon={<CreditCard />} title="حسابی در این بخش نیست" text="حساب‌های این دسته در این فیلتر نمایش داده نمی‌شوند." />

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
          <button className={activeTab === ENTRY_STATUS.ACTIVE ? 'active' : ''} onClick={() => setActiveTab(ENTRY_STATUS.ACTIVE)}>فعال ({activeEntries.length})</button>
          <button className={activeTab === ENTRY_STATUS.SETTLED ? 'active' : ''} onClick={() => setActiveTab(ENTRY_STATUS.SETTLED)}>تسویه‌شده ({settledEntries.length})</button>
          <button className={activeTab === 'all' ? 'active' : ''} onClick={() => setActiveTab('all')}>همه ({entries.length})</button>
        </div>
        <div className="person-entry-groups">
          <section className="person-entry-group">
            <div className="person-entry-group-heading"><ArrowDownLeft size={18}/><h3>طلب‌ها</h3><span>{receivableEntries.length} حساب</span></div>
            {renderEntryList(receivableEntries)}
          </section>
          <section className="person-entry-group">
            <div className="person-entry-group-heading"><ArrowUpRight size={18}/><h3>بدهی‌ها</h3><span>{payableEntries.length} حساب</span></div>
            {renderEntryList(payableEntries)}
          </section>
        </div>
      </section>

      <section className="content-card">
        <div className="section-heading"><div><h2>تاریخچه این شخص</h2><p>ثبت و تغییرات حساب‌ها و پرداخت‌ها</p></div></div>
        {events.length ? <EventList events={events} people={[person]} /> : <EmptyState icon={<Activity />} title="تاریخچه خالی است" text="فعالیت‌های بعدی اینجا ثبت می‌شوند." />}
      </section>
    </>
  )
}
