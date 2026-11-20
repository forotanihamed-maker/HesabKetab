import { Activity } from 'lucide-react'
import EmptyState from '../components/common/EmptyState'
import EventList from '../components/activity/EventList'

export default function ActivityPage({ events, people }) {
  return (
    <>
      <div className="page-heading"><div><span className="eyebrow">گزارش تغییرات</span><h1>تاریخچه فعالیت‌ها</h1><p>رویدادهای ثبت‌شده در تمام حساب‌ها</p></div></div>
      <section className="content-card">
        {events.length ? <EventList events={events} people={people} /> : <EmptyState icon={<Activity />} title="هنوز فعالیتی ثبت نشده" text="با ثبت حساب و پرداخت، تاریخچه اینجا شکل می‌گیرد." />}
      </section>
    </>
  )
}
