import { useState } from 'react'
import { ArrowDownLeft, ArrowUpRight, CheckCircle2, CirclePlus, Pencil, Trash2 } from 'lucide-react'
import { DIRECTION, ENTRY_STATUS } from '../../constants/app'
import { dateLabel, toman } from '../../utils'

export default function EntryCard({ entry, balance, onPayment, onEdit, onSettle, onDelete, onDeletePayment }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const isReceivable = entry.direction === DIRECTION.RECEIVABLE
  const DirectionIcon = isReceivable ? ArrowDownLeft : ArrowUpRight

  return (
    <article className="entry-card">
      <div className="entry-main">
        <div className={`entry-icon ${isReceivable ? 'green' : 'orange'}`}><DirectionIcon /></div>
        <div className="entry-info">
          <div className="entry-title-line">
            <strong>{entry.title}</strong>
            <span className={`status-pill ${entry.status}`}>
              {entry.status === ENTRY_STATUS.SETTLED ? 'تسویه‌شده' : isReceivable ? 'طلب' : 'بدهی'}
            </span>
          </div>
          <small>{dateLabel(entry.date)}{entry.note ? ` · ${entry.note}` : ''}</small>
          <div className="entry-numbers">
            <span>مبلغ اولیه: {toman(entry.amount)}</span>
            <span className="remaining">مانده: {toman(balance)}</span>
          </div>
        </div>
        <div className="entry-actions">
          <button className="icon-btn" title="ویرایش" onClick={onEdit}><Pencil size={16} /></button>
          <button className="icon-btn danger" title="حذف" onClick={onDelete}><Trash2 size={16} /></button>
        </div>
      </div>

      <div className="entry-footer">
        <button className="subtle-btn" onClick={() => setIsExpanded(value => !value)}>
          {isExpanded ? 'بستن جزئیات' : `پرداخت‌ها (${(entry.payments || []).length})`}
        </button>
        {entry.status === ENTRY_STATUS.ACTIVE && (
          <div className="entry-footer-actions">
            <button className="subtle-btn" onClick={onPayment}><CirclePlus size={15} /> ثبت پرداخت</button>
            <button className="settle-btn" onClick={onSettle}><CheckCircle2 size={15} /> تسویه مستقیم</button>
          </div>
        )}
      </div>

      {isExpanded && (
        <div className="payments-panel">
          {(entry.payments || []).length ? entry.payments.map(payment => (
            <div className="payment-row" key={payment.id}>
              <div><strong>{toman(payment.amount)}</strong><small>{dateLabel(payment.date)}{payment.note ? ` · ${payment.note}` : ''}</small></div>
              <button className="icon-btn danger" onClick={() => onDeletePayment(payment)} title="حذف پرداخت"><Trash2 size={15} /></button>
            </div>
          )) : <p className="muted small-text">پرداختی برای این حساب ثبت نشده است.</p>}
        </div>
      )}
    </article>
  )
}
