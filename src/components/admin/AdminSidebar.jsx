import { NavLink } from 'react-router-dom'
import {
  HomeIcon,
  MusicalNoteIcon,
  BuildingStorefrontIcon,
  ChartBarIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline'

const items = [
  { to: '/admin', label: '대시보드', end: true, icon: HomeIcon },
  { to: '/admin/zones', label: '공연장 관리', icon: MusicalNoteIcon },
  { to: '/admin/facilities', label: '편의시설 관리', icon: BuildingStorefrontIcon },
  { to: '/admin/congestion', label: '혼잡도 현황', icon: ChartBarIcon },
  { to: '/admin/privacy', label: '개인정보 보호', icon: ShieldCheckIcon },
]

export default function AdminSidebar() {
  return (
    <aside className="w-56 shrink-0 border-r border-gray-100 bg-white min-h-[calc(100vh-56px)] px-4 py-6">
      <p className="text-xs font-semibold text-gray-400 mb-3 px-3">관리 메뉴</p>
      <nav className="flex flex-col gap-1 text-sm">
        {items.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2.5 rounded-lg font-medium cursor-pointer transition-colors ${
                isActive ? 'bg-brand-50 text-brand-600' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
              }`
            }
          >
            <item.icon className="w-5 h-5 shrink-0" aria-hidden="true" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
