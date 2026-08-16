import AdminHeader from './AdminHeader'
import AdminSidebar from './AdminSidebar'

export default function AdminLayout({ authed, onLogout, children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader authed={authed} onLogout={onLogout} />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 px-8 py-8">{children}</main>
      </div>
    </div>
  )
}
