import { NavLink } from 'react-router-dom'

const items = [
  { to: '/admin', label: '대시보드', end: true },
  { to: '/admin/zones', label: '공연장 관리' },
  { to: '/admin/facilities', label: '편의시설 관리' },
  { to: '/admin/congestion', label: '혼잡도 현황' },
  { to: '/admin/privacy', label: '개인정보 보호' },
]

export default function AdminSidebar() {
  return (
    <aside className="w-56 shrink-0 border-r border-gray-100 bg-white min-h-[calc(100vh-56px)] px-6 py-6">
      <p className="text-xs font-semibold text-gray-400 mb-3">관리 메뉴</p>
      <nav className="flex flex-col gap-2 text-sm">
        {items.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `underline underline-offset-2 ${isActive ? 'text-gray-900 font-semibold' : 'text-gray-400 hover:text-gray-700'}`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
