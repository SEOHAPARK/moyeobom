import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminHeader from '../../components/admin/AdminHeader'
import { useAdminAuth } from '../../hooks/useAdminAuth'

export default function AdminLoginPage() {
  const { signIn } = useAdminAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    const { error } = await signIn(email, password)
    setSubmitting(false)
    if (error) {
      setError('이메일 또는 비밀번호가 올바르지 않습니다')
      return
    }
    navigate('/admin')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader authed={false} />

      <main className="max-w-sm mx-auto px-6 py-16">
        <h1 className="text-lg font-bold text-gray-900 text-center">관리자 로그인</h1>
        <p className="text-sm text-gray-400 text-center mt-1 mb-8">페스티벌 운영 및 관리를 위해 로그인하세요</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-sm text-gray-500">이메일</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="mt-1 w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-600"
            />
          </div>
          <div>
            <label className="text-sm text-gray-500">비밀번호</label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="mt-1 w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-600"
            />
          </div>

          {error && <p className="text-sm text-blocked-600">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="bg-brand-600 text-white hover:bg-brand-700 transition-colors cursor-pointer rounded-xl py-2.5 font-semibold text-sm disabled:opacity-50"
          >
            {submitting ? '로그인 중...' : '로그인'}
          </button>
          <a
            href="mailto:support@festival.com"
            className="text-center border border-gray-200 rounded-xl py-2.5 font-semibold text-sm text-gray-700"
          >
            지원 문의
          </a>
        </form>
      </main>
    </div>
  )
}
