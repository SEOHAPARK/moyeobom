import { Navigate } from 'react-router-dom'
import { useAdminAuth } from '../../hooks/useAdminAuth'
import AdminLayout from '../../components/admin/AdminLayout'

export default function AdminRoute({ children }) {
  const { loading, authed, signOut } = useAdminAuth()

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400 text-sm">불러오는 중...</div>
  }
  if (!authed) {
    return <Navigate to="/admin/login" replace />
  }

  return (
    <AdminLayout authed={authed} onLogout={signOut}>
      {children}
    </AdminLayout>
  )
}
