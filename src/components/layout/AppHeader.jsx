import { WalletCards } from 'lucide-react'

export default function AppHeader({ onHome }) {
  return (
    <header className="topbar">
      <button className="brand" onClick={onHome} type="button" aria-label="رفتن به صفحه اصلی حساب‌کتاب">
        <span className="brand-mark" aria-hidden="true"><WalletCards size={22} strokeWidth={2.1} /></span>
        <span className="brand-copy">
          <strong className="brand-name"><span>حساب</span><span className="brand-name-accent">‌کتاب</span></strong>
          <small>مدیریت یکپارچه طلب‌ها و بدهی‌ها</small>
        </span>
      </button>
      <div className="topbar-note"><span className="live-dot" /> اطلاعات روی همین دستگاه ذخیره می‌شود</div>
    </header>
  )
}
