import { Activity, ShieldCheck, BookOpen, LayoutDashboard, Users } from 'lucide-react'
import { PAGE } from '../../constants/app'

const navigationItems = [
  { page: PAGE.HOME, label: 'نمای کلی', icon: LayoutDashboard },
  { page: PAGE.PEOPLE, label: 'اشخاص', icon: Users },
  { page: PAGE.ACTIVITY, label: 'تاریخچه فعالیت‌ها', icon: Activity },
  { page: PAGE.BACKUP, label: 'پشتیبان‌گیری', icon: ShieldCheck },
]

export default function Sidebar({ currentPage, onNavigate }) {
  return (
    <aside className="sidebar">
      <div className="side-label">منو</div>
      {navigationItems.map(({ page, label, icon: Icon }) => (
        <button key={page} className={currentPage === page ? 'nav-item active' : 'nav-item'} onClick={() => onNavigate(page)}>
          <Icon size={18} /> {label}
        </button>
      ))}
      <div className="sidebar-tip"><BookOpen size={18} /><span>هر حساب و پرداخت، سابقه جداگانه دارد و با صفر شدن مبلغ حذف نمی‌شود.</span></div>
    </aside>
  )
}
