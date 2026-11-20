import { ChevronLeft } from 'lucide-react'
import { sum, toman } from '../../utils'
import { getEntryBalance } from '../../hooks/useLedger'

export default function PersonRow({ person, entries = [], onClick }) {
  const activeEntries = entries.filter(entry => entry.status === 'active')
  const receivable = sum(activeEntries.filter(entry => entry.direction === 'receivable'), getEntryBalance)
  const payable = sum(activeEntries.filter(entry => entry.direction === 'payable'), getEntryBalance)

  return (
    <button className="person-row" onClick={onClick}>
      <div className="avatar">{person.name.slice(0, 1)}</div>
      <div className="person-row-main">
        <strong>{person.name}</strong>
        <small>{person.phone || 'بدون شماره تماس'}</small>
      </div>
      <div className="person-row-balances">
        {entries.length ? <>
          <span className="green-text">طلب {toman(receivable)}</span>
          <span className="orange-text">بدهی {toman(payable)}</span>
        </> : <span className="muted">مشاهده جزئیات</span>}
      </div>
      <ChevronLeft className="row-chevron" size={18} />
    </button>
  )
}
