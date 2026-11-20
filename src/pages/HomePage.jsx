import { Activity, ArrowDownLeft, ArrowUpRight, ChevronLeft, CreditCard, Plus, UserRound, Users, ReceiptText } from 'lucide-react'
import SummaryCard from '../components/common/SummaryCard'
import SearchBox from '../components/common/SearchBox'
import EmptyState from '../components/common/EmptyState'
import PersonRow from '../components/people/PersonRow'
import EventList from '../components/activity/EventList'
import { getEntryBalance } from '../domain/ledger'
import { toman, dateLabel, formatNumber, sum } from '../utils'

function DashboardEntries({ title, entries, people, direction, onOpenPerson }) {
  const isReceivable = direction === 'receivable'
  const Icon = isReceivable ? ArrowDownLeft : ArrowUpRight
  const total = sum(entries, getEntryBalance)
  return (
    <section className="content-card dashboard-accounts">
      <div className={`section-heading dashboard-section-heading ${isReceivable ? 'green-text' : 'orange-text'}`}>
        <div><h2>{title}</h2><p>حساب‌های فعال، همراه با مانده و جزئیات</p></div>
        <strong className="dashboard-section-total">{toman(total)}</strong>
      </div>
      {entries.length ? <div className="dashboard-entry-list">
        {entries.slice(0, 8).map(entry => {
          const person = people.find(item => item.id === entry.personId)
          const remaining = getEntryBalance(entry)
          return <button className="dashboard-entry" key={entry.id} onClick={() => person && onOpenPerson(person.id)} disabled={!person}>
            <span className={`dashboard-entry-icon ${isReceivable ? 'receivable' : 'payable'}`}><Icon size={20}/></span>
            <span className="dashboard-entry-info"><strong>{person?.name || 'شخص حذف‌شده'}</strong><small>{entry.title}</small><small className="dashboard-entry-note">{dateLabel(entry.date)}{entry.note ? ` · ${entry.note}` : ''}</small></span>
            <span className="dashboard-entry-amounts"><strong>{toman(remaining)}</strong><small>از {toman(entry.amount)}</small></span>
            <ChevronLeft className="row-chevron" size={17}/>
          </button>
        })}
      </div> : <EmptyState icon={<CreditCard />} title={`مورد فعالی در ${isReceivable ? 'طلب‌ها' : 'بدهی‌ها'} نیست`} text="با ثبت حساب جدید، جزئیات آن در این بخش نمایش داده می‌شود." />}
    </section>
  )
}

export default function HomePage({ data, totals, people, search, onSearch, onOpenPerson, onAddPerson, onShowPeople, onQuickEntry }) {
  const recentEvents = data.events.slice(0, 5)
  const activeEntries = data.entries.filter(entry => entry.status === 'active')
  const receivables = activeEntries.filter(entry => entry.direction === 'receivable').sort((a,b) => String(b.date).localeCompare(String(a.date)))
  const payables = activeEntries.filter(entry => entry.direction === 'payable').sort((a,b) => String(b.date).localeCompare(String(a.date)))

  return <>
    <div className="page-heading">
      <div><span className="eyebrow">خوش آمدید</span><h1>نمای کلی حساب‌ها</h1><p>وضعیت کلی طلب‌ها، بدهی‌ها و اشخاص را اینجا ببینید.</p></div>
      <div className="home-actions"><button className="primary-btn" onClick={onQuickEntry}><ReceiptText size={18} /> ثبت طلب / بدهی</button><button className="outline-btn" onClick={onAddPerson}><Plus size={18} /> افزودن شخص</button></div>
    </div>
    <section className="summary-grid">
      <SummaryCard title="مجموع طلب‌های فعال" value={toman(totals.receivables)} icon={<ArrowDownLeft />} tone="green" hint="مبالغی که باید دریافت شوند" />
      <SummaryCard title="مجموع بدهی‌های فعال" value={toman(totals.payables)} icon={<ArrowUpRight />} tone="orange" hint="مبالغی که باید پرداخت شوند" />
      <SummaryCard title="اشخاص ثبت‌شده" value={formatNumber(data.people.length)} icon={<Users />} tone="blue" hint="افراد و طرف‌حساب‌ها" />
      <SummaryCard title="حساب‌های فعال" value={formatNumber(totals.activeCount)} icon={<CreditCard />} tone="purple" hint="حساب‌های تسویه‌نشده" />
    </section>
    <DashboardEntries title="جزئیات طلب‌ها" entries={receivables} people={data.people} direction="receivable" onOpenPerson={onOpenPerson}/>
    <DashboardEntries title="جزئیات بدهی‌ها" entries={payables} people={data.people} direction="payable" onOpenPerson={onOpenPerson}/>
    <section className="content-card">
      <div className="section-heading"><div><h2>اشخاص</h2><p>برای مشاهده جزئیات و حساب هر شخص انتخاب کنید.</p></div><button className="text-btn" onClick={onShowPeople}>مشاهده همه <ChevronLeft size={16} /></button></div>
      <SearchBox value={search} onChange={onSearch} placeholder="جست‌وجوی نام شخص..." />
      {people.length ? <div className="people-list">{people.slice(0, 6).map(person => <PersonRow key={person.id} person={person} entries={data.entries.filter(entry => entry.personId === person.id)} onClick={() => onOpenPerson(person.id)} />)}</div> : <EmptyState icon={<UserRound />} title={search ? 'شخصی پیدا نشد' : 'هنوز شخصی ثبت نشده'} text={search ? 'نام دیگری را جست‌وجو کنید.' : 'برای شروع، اولین شخص را ثبت کنید.'} />}
    </section>
    <section className="content-card"><div className="section-heading"><div><h2>آخرین فعالیت‌ها</h2><p>آخرین تغییرات ثبت‌شده در حساب‌ها</p></div></div>{recentEvents.length ? <EventList events={recentEvents} people={data.people} /> : <EmptyState icon={<Activity />} title="هنوز فعالیتی وجود ندارد" text="پس از ثبت حساب یا پرداخت، رویدادها اینجا نمایش داده می‌شوند." />}</section>
  </>
}
