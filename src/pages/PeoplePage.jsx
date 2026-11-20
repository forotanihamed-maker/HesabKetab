import { Plus, Users } from 'lucide-react'
import EmptyState from '../components/common/EmptyState'
import SearchBox from '../components/common/SearchBox'
import PersonRow from '../components/people/PersonRow'

export default function PeoplePage({ people, entries = [], search, onSearch, onOpenPerson, onAddPerson }) {
  return (
    <>
      <div className="page-heading">
        <div><span className="eyebrow">دفتر اشخاص</span><h1>اشخاص</h1><p>هر شخص فقط یک‌بار ثبت می‌شود و تمام حساب‌هایش در یک صفحه قرار می‌گیرد.</p></div>
        <button className="primary-btn" onClick={onAddPerson}><Plus size={18} /> افزودن شخص</button>
      </div>
      <section className="content-card">
        <SearchBox value={search} onChange={onSearch} placeholder="جست‌وجو بر اساس نام شخص..." />
        {people.length ? (
          <div className="people-list">{people.map(person => <PersonRow key={person.id} person={person} entries={entries.filter(entry => entry.personId === person.id)} onClick={() => onOpenPerson(person.id)} />)}</div>
        ) : <EmptyState icon={<Users />} title={search ? 'نتیجه‌ای پیدا نشد' : 'دفتر اشخاص خالی است'} text="با افزودن شخص، حساب‌های مربوط به او را ثبت و پیگیری کنید." />}
      </section>
    </>
  )
}
