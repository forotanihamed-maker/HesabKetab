import { ChevronLeft } from 'lucide-react'
import { sum, toman } from '../../utils'
import { getEntryBalance } from '../../domain/ledger'

export default function PersonRow({ person, entries = [], onClick }) {
  const activeEntries = entries.filter(entry => entry.status === 'active')
  const receivable = sum(activeEntries.filter(entry => entry.direction === 'receivable'), getEntryBalance)
  const payable = sum(activeEntries.filter(entry => entry.direction === 'payable'), getEntryBalance)
  const settledCount = entries.filter(entry => entry.status === 'settled').length

  return (
    <button className="person-row" onClick={onClick}>
      <div className="avatar">{person.name.slice(0, 1)}</div>
      <div className="person-row-main">
        <strong>{person.name}</strong>
        <small>{person.phone || 'بدون شماره تماس'} · {entries.length ? `${entries.length} حساب ( ${settledCount} تسویه‌شده )` : 'ثبت‌شده در دفتر اشخاص'}</small>
      </div>
      <div className="person-row-balances">
        {activeEntries.length ? <>
          <span className="green-text">طلب {toman(receivable)}</span>
          <span className="orange-text">بدهی {toman(payable)}</span>
        </> : entries.length ? <span className="muted">همه حساب‌ها تسویه</span> : <span className="muted">حسابی ثبت نشده</span>}
      </div>
      <ChevronLeft className="row-chevron" size={18} />
    </button>
  )
}
