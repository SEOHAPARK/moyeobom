import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import MobileHeader from '../components/MobileHeader'

const NEARBY = ['공연장 입구', '주차장', '정문']

export default function ManualOriginPage() {
  const { zoneId } = useParams()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [manual, setManual] = useState('')
  const [selected, setSelected] = useState(null)

  const origin = selected ?? manual.trim()

  function handleSubmit() {
    if (!origin) return
    navigate(`/route/${zoneId}`, { state: { originLabel: origin } })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MobileHeader title="출발지 설정" />

      <main className="max-w-xl mx-auto px-4 py-5 flex flex-col gap-5">
        <div>
          <h2 className="text-lg font-bold text-gray-900">출발지 설정</h2>
          <p className="text-sm text-gray-400 mt-1">현재 위치를 찾을 수 없어 출발지를 직접 입력해주세요</p>
        </div>

        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2.5">
          <span className="text-gray-400">🔍</span>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="위치 검색"
            className="flex-1 outline-none text-sm placeholder:text-gray-400"
          />
        </div>

        <div>
          <p className="text-sm font-bold text-gray-800 mb-2">근처 위치</p>
          <div className="flex flex-col gap-2">
            {NEARBY.filter(n => n.includes(query)).map(n => (
              <button
                key={n}
                onClick={() => { setSelected(n); setManual('') }}
                className={`text-left px-4 py-3 rounded-xl border text-sm font-medium ${
                  selected === n ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200 bg-white text-gray-700'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-bold text-gray-800 mb-2">직접 입력</p>
          <label className="text-xs text-gray-400">위치명 또는 주소</label>
          <textarea
            value={manual}
            onChange={e => { setManual(e.target.value); setSelected(null) }}
            rows={3}
            className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-gray-400 resize-none"
          />
        </div>

        <div className="flex gap-2 justify-end pt-2">
          <button
            onClick={() => navigate(-1)}
            className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={!origin}
            className="px-5 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-semibold disabled:opacity-40"
          >
            출발지 설정
          </button>
        </div>
      </main>
    </div>
  )
}
