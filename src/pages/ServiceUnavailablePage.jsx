import { useSearchParams } from 'react-router-dom'

export default function ServiceUnavailablePage() {
  const [params] = useSearchParams()
  const reason = params.get('reason') || '행사 정보를 확인할 수 없습니다.'

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-xl mx-auto px-4 py-3 text-center">
          <h1 className="text-base font-bold text-gray-900">서비스 이용 불가</h1>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 py-8 flex flex-col gap-4">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900">이용할 수 없는 행사입니다</h2>
          <p className="text-sm text-gray-400 mt-2">QR 코드가 유효하지 않거나 행사가 종료되었습니다</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <p className="text-sm font-bold text-gray-800 mb-2">사유</p>
          <p className="text-sm text-gray-500">{reason}</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <p className="text-sm font-bold text-gray-800 mb-2">확인 사항</p>
          <ul className="text-sm text-gray-500 flex flex-col gap-1.5 list-disc pl-4">
            <li>행사 날짜 재확인</li>
            <li>QR 코드 정확성 확인</li>
          </ul>
        </div>
      </main>
    </div>
  )
}
