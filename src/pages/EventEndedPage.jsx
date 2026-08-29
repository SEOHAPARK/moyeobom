import { useNavigate, useSearchParams } from 'react-router-dom'
import { Icon } from '../components/ui/Icon'

export default function EventEndedPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const endedAt = params.get('endedAt')

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-xl mx-auto px-4 py-3 text-center">
          <h1 className="font-heading text-base font-bold text-gray-900">행사 종료 안내</h1>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 py-12 flex flex-col items-center text-center gap-3">
        <div className="w-14 h-14 rounded-full border-2 border-gray-300 flex items-center justify-center text-gray-400">
          <Icon name="ban" size={24} />
        </div>
        <h2 className="font-heading text-lg font-bold text-gray-900">행사 종료</h2>
        <p className="text-sm text-gray-500">이 행사는 이미 종료되었습니다.</p>
        {endedAt && <p className="text-xs text-gray-400">종료 시간 {endedAt}</p>}

        <div className="w-full flex flex-col gap-2 mt-4">
          <button
            onClick={() => navigate('/')}
            className="w-full min-h-11 bg-brand-600 text-white rounded-xl py-3 font-bold text-sm hover:bg-brand-700 cursor-pointer transition-colors"
          >
            다른 행사 찾기
          </button>
          <button
            onClick={() => window.close()}
            className="w-full min-h-11 border border-gray-200 rounded-xl py-3 font-semibold text-sm text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors"
          >
            서비스 나가기
          </button>
        </div>
      </main>
    </div>
  )
}
