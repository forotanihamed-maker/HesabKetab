import { ChevronLeft } from 'lucide-react'
import { toman } from '../../utils'
import { summarizeEntries } from '../../domain/ledger'

export default function PersonRow({ person, entries = [], onClick }) {
  const { receivables, payables, activeCount } = summarizeEntries(entries)
  const settledCount = entries.length - activeCount

  return (
    <button className="person-row" onClick={onClick}>
      <div className="avatar">{person.name.slice(0, 1)}</div>
      <div className="person-row-main">
        <strong>{person.name}</strong>
        <small>{person.phone || 'بدون شماره تماس'} · {entries.length ? `${entries.length} حساب ( ${settledCount} تسویه‌شده )` : 'ثبت‌شده در دفتر اشخاص'}</small>
      </div>
      <div className="person-row-balances">
        {activeCount ? <>
          <span className="green-text">طلب {toman(receivables)}</span>
          <span className="orange-text">بدهی {toman(payables)}</span>
        </> : entries.length ? <span className="muted">همه حساب‌ها تسویه</span> : <span className="muted">حسابی ثبت نشده</span>}
      </div>
      <ChevronLeft className="row-chevron" size={18} />
    </button>
  )
}
