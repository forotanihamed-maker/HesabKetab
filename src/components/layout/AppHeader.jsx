import { Wallet } from 'lucide-react'

export default function AppHeader({ onHome }) {
  return (
    <header className="topbar">
      <button className="brand" onClick={onHome} type="button">
        <div className="brand-mark"><Wallet size={21} /></div>
        <div><strong>حساب‌کتاب</strong><small>مدیریت ساده حساب‌ها</small></div>
      </button>
      <div className="topbar-note"><span className="live-dot" /> اطلاعات روی همین دستگاه ذخیره می‌شود</div>
    </header>
  )
}
