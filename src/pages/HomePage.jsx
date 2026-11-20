import { Activity, ArrowDownLeft, ArrowUpRight, ChevronLeft, CreditCard, Plus, UserRound, Users } from 'lucide-react'
import SummaryCard from '../components/common/SummaryCard'
import SearchBox from '../components/common/SearchBox'
import EmptyState from '../components/common/EmptyState'
import PersonRow from '../components/people/PersonRow'
import EventList from '../components/activity/EventList'
import { toman, dateLabel } from '../utils'
import { getEntryBalance } from '../hooks/useLedger'

export default function HomePage({ data, totals, people, search, onSearch, onOpenPerson, onAddPerson, onShowPeople }) {
  const recentEvents = data.events.slice(0, 5)
  const activeEntries = data.entries.filter(entry => entry.status === 'active')
  const receivableEntries = activeEntries.filter(entry => entry.direction === 'receivable')
  const payableEntries = activeEntries.filter(entry => entry.direction === 'payable')
  const personName = personId => data.people.find(person => person.id === personId)?.name || 'شخص نامشخص'
  const renderAccountList = (entries, direction) => entries.length ? (
    <div className="dashboard-entry-list">
      {entries.map(entry => (
        <button className="dashboard-entry" key={entry.id} onClick={() => onOpenPerson(entry.personId)}>
          <span className={`dashboard-entry-icon ${direction}`}>
            {direction === 'receivable' ? <ArrowDownLeft size={19} /> : <ArrowUpRight size={19} />}
          </span>
          <span className="dashboard-entry-info">
            <strong>{entry.title}</strong>
            <small>{personName(entry.personId)} · {dateLabel(entry.date)}</small>
            {entry.note && <small className="dashboard-entry-note">{entry.note}</small>}
          </span>
          <span className="dashboard-entry-amounts">
            <strong className={direction === 'receivable' ? 'green-text' : 'orange-text'}>{toman(getEntryBalance(entry))}</strong>
            <small>مانده از {toman(entry.amount)}</small>
          </span>
          <ChevronLeft className="row-chevron" size={18} />
        </button>
      ))}
    </div>
  ) : <EmptyState
    icon={direction === 'receivable' ? <ArrowDownLeft /> : <ArrowUpRight />}
    title={direction === 'receivable' ? 'طلب فعالی ثبت نشده' : 'بدهی فعالی ثبت نشده'}
    text={direction === 'receivable' ? 'طلب‌های ثبت‌شده در این بخش نمایش داده می‌شوند.' : 'بدهی‌های ثبت‌شده در این بخش نمایش داده می‌شوند.'}
  />

  return (
    <>
      <div className="page-heading">
        <div><span className="eyebrow">خوش آمدید</span><h1>نمای کلی حساب‌ها</h1><p>وضعیت کلی طلب‌ها، بدهی‌ها و اشخاص را اینجا ببینید.</p></div>
        <button className="primary-btn" onClick={onAddPerson}><Plus size={18} /> افزودن شخص</button>
      </div>

      <section className="summary-grid">
        <SummaryCard title="مجموع طلب‌های فعال" value={toman(totals.receivables)} icon={<ArrowDownLeft />} tone="green" hint="مبالغی که باید دریافت شوند" />
        <SummaryCard title="مجموع بدهی‌های فعال" value={toman(totals.payables)} icon={<ArrowUpRight />} tone="orange" hint="مبالغی که باید پرداخت شوند" />
        <SummaryCard title="اشخاص ثبت‌شده" value={new Intl.NumberFormat('fa-IR').format(data.people.length)} icon={<Users />} tone="blue" hint="افراد و طرف‌حساب‌ها" />
        <SummaryCard title="حساب‌های فعال" value={new Intl.NumberFormat('fa-IR').format(totals.activeCount)} icon={<CreditCard />} tone="purple" hint="حساب‌های تسویه‌نشده" />
      </section>

      <section className="content-card">
        <div className="section-heading dashboard-section-heading">
          <div><h2>جزئیات طلب‌ها</h2><p>حساب‌هایی که باید از دیگران دریافت کنید</p></div>
          <span className="dashboard-section-total green-text">{toman(totals.receivables)}</span>
        </div>
        {renderAccountList(receivableEntries, 'receivable')}
      </section>

      <section className="content-card">
        <div className="section-heading dashboard-section-heading">
          <div><h2>جزئیات بدهی‌ها</h2><p>حساب‌هایی که باید پرداخت کنید</p></div>
          <span className="dashboard-section-total orange-text">{toman(totals.payables)}</span>
        </div>
        {renderAccountList(payableEntries, 'payable')}
      </section>

      <section className="content-card">
        <div className="section-heading">
          <div><h2>اشخاص</h2><p>برای مشاهده جزئیات و حساب هر شخص انتخاب کنید.</p></div>
          <button className="text-btn" onClick={onShowPeople}>مشاهده همه <ChevronLeft size={16} /></button>
        </div>
        <SearchBox value={search} onChange={onSearch} placeholder="جست‌وجوی نام شخص..." />
        {people.length ? (
          <div className="people-list">
            {people.slice(0, 6).map(person => (
              <PersonRow key={person.id} person={person} entries={data.entries.filter(entry => entry.personId === person.id)} onClick={() => onOpenPerson(person.id)} />
            ))}
          </div>
        ) : <EmptyState icon={<UserRound />} title={search ? 'شخصی پیدا نشد' : 'هنوز شخصی ثبت نشده'} text={search ? 'نام دیگری را جست‌وجو کنید.' : 'برای شروع، اولین شخص را ثبت کنید.'} />}
      </section>

      <section className="content-card">
        <div className="section-heading"><div><h2>آخرین فعالیت‌ها</h2><p>آخرین تغییرات ثبت‌شده در حساب‌ها</p></div></div>
        {recentEvents.length ? <EventList events={recentEvents} people={data.people} /> : <EmptyState icon={<Activity />} title="هنوز فعالیتی وجود ندارد" text="پس از ثبت حساب یا پرداخت، رویدادها اینجا نمایش داده می‌شوند." />}
      </section>
    </>
  )
}
