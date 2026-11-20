import { Activity, LayoutDashboard, Users } from 'lucide-react'
import { PAGE } from '../../constants/app'

const items = [
  { page: PAGE.HOME, label: 'خانه', icon: LayoutDashboard },
  { page: PAGE.PEOPLE, label: 'اشخاص', icon: Users },
  { page: PAGE.ACTIVITY, label: 'تاریخچه', icon: Activity },
]

export default function MobileNavigation({ currentPage, onNavigate }) {
  return (
    <nav className="mobile-nav">
      {items.map(({ page, label, icon: Icon }) => (
        <button key={page} className={currentPage === page || (page === PAGE.PEOPLE && currentPage === PAGE.PERSON) ? 'selected' : ''} onClick={() => onNavigate(page)}>
          <Icon /><span>{label}</span>
        </button>
      ))}
    </nav>
  )
}
