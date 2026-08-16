import { Link } from 'react-router-dom'

export default function AdminHeader({ authed, onLogout }) {
  return (
    <header className="bg-white border-b border-gray-100">
      <div className="px-6 h-14 flex items-center gap-6">
        <Link to="/admin" className="font-bold text-gray-900">페스티벌 지도</Link>
        <nav className="ml-auto flex items-center gap-5 text-sm">
          <Link to="/" className="text-gray-500 hover:text-gray-900 underline underline-offset-2">관객 지도</Link>
          {authed ? (
            <button onClick={onLogout} className="text-gray-500 hover:text-gray-900 underline underline-offset-2">
              로그아웃
            </button>
          ) : (
            <Link to="/admin/login" className="text-gray-500 hover:text-gray-900 underline underline-offset-2">
              관리자 로그인
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
