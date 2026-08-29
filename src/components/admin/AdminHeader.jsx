import { Link } from 'react-router-dom'
import { Icon } from '../ui/Icon'
import Logo from '../Logo'

export default function AdminHeader({ authed, onLogout }) {
  return (
    <header className="bg-white border-b border-gray-100">
      <div className="px-6 h-14 flex items-center gap-6">
        <Link to="/admin" className="flex items-center gap-2 font-heading font-bold text-gray-900 cursor-pointer">
          <Logo size={22} />
          모여봄
        </Link>
        <nav className="ml-auto flex items-center gap-5 text-sm">
          <Link to="/" className="text-gray-500 hover:text-brand-600 underline underline-offset-2 cursor-pointer transition-colors">
            관객 지도
          </Link>
          {authed ? (
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 text-gray-500 hover:text-gray-900 cursor-pointer transition-colors"
            >
              <Icon name="log-out" size={16} />
              로그아웃
            </button>
          ) : (
            <Link to="/admin/login" className="text-gray-500 hover:text-brand-600 underline underline-offset-2 cursor-pointer transition-colors">
              관리자 로그인
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
