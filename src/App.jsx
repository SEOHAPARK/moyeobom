import { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import FestivalMap from './components/KakaoMap'
import StatusBadge from './components/StatusBadge'
import { useCongestion } from './hooks/useCongestion'
import { getLevel } from './lib/congestion'
import { formatClock } from './lib/format'

const FILTERS = [
  { key: 'all', label: '전체' },
  { key: 'stage', label: '공연장' },
  { key: 'food', label: 'F&B' },
  { key: 'event', label: '이벤트' },
  { key: 'restroom', label: '화장실' },
]

export default function App() {
  const { zones, loading, lastUpdated, online } = useCongestion()
  const [filter, setFilter] = useState('all')
  const [query, setQuery] = useState('')
  const mapRef = useRef(null)
  const navigate = useNavigate()

  const filtered = useMemo(() => {
    return zones.filter(z => {
      if (filter !== 'all' && z.zones.type !== filter) return false
      if (query && !z.zones.name.includes(query)) return false
      return true
    })
  }, [zones, filter, query])

  const stageZones = filtered.filter(z => z.zones.type === 'stage')
  const facilityZones = filtered.filter(z => z.zones.type !== 'stage')

  function goToZone(zone) {
    navigate(`/zone/${zone.zone_id}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="px-4 py-3 flex items-center gap-2">
          <span className="text-xl">🌿</span>
          <div>
            <h1 className="text-base font-bold text-gray-900 leading-tight">모여봄</h1>
            <p className="text-xs text-gray-400">페스티벌 실시간 혼잡도</p>
          </div>
          <span className="ml-auto flex items-center gap-1 text-xs text-green-500">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse inline-block" />
            실시간
          </span>
        </div>
      </header>

      <div className="relative h-56 bg-gray-100 border-b border-gray-100">
        {loading ? (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">불러오는 중...</div>
        ) : (
          <FestivalMap ref={mapRef} zones={zones} onSelectZone={goToZone} />
        )}
      </div>

      <main className="max-w-xl mx-auto px-4 py-4 flex flex-col gap-5">
        <div className="flex gap-2">
          <div className="flex-1 flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2.5">
            <span className="text-gray-400">🔍</span>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="장소 검색"
              className="flex-1 outline-none text-sm placeholder:text-gray-400"
            />
          </div>
          <button
            onClick={() => mapRef.current?.locate()}
            className="px-4 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 whitespace-nowrap"
          >
            현재 위치
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto -mx-1 px-1">
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap border ${
                filter === f.key
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-500 border-gray-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {stageZones.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-bold text-gray-800">지금 주변 공연장</h2>
              <span className="text-xs text-gray-400">
                갱신 {lastUpdated ? formatClock(lastUpdated) : '-'} · {online ? '연결됨' : '오프라인'}
              </span>
            </div>
            <ul className="flex flex-col gap-2">
              {stageZones.map(zone => {
                const level = getLevel({ current: zone.current_count, max: zone.zones.max_capacity, entryBlocked: zone.entry_blocked })
                return (
                  <li key={zone.id} className="bg-white rounded-xl border border-gray-100 px-4 py-3 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{zone.zones.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        현재 {zone.current_count}명 / 수용 {zone.zones.max_capacity}명
                      </p>
                    </div>
                    <StatusBadge level={level} size="sm" />
                    <button
                      onClick={() => navigate(`/route/${zone.zone_id}`)}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 whitespace-nowrap"
                    >
                      경로
                    </button>
                  </li>
                )
              })}
            </ul>
          </section>
        )}

        {facilityZones.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-bold text-gray-800">편의시설</h2>
              <button onClick={() => setFilter('all')} className="text-xs text-gray-400 underline underline-offset-2">
                전체 보기
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {facilityZones.map(zone => {
                const level = getLevel({ current: zone.current_count, max: zone.zones.max_capacity, entryBlocked: zone.entry_blocked })
                return (
                  <button
                    key={zone.id}
                    onClick={() => goToZone(zone)}
                    className="bg-white rounded-xl border border-gray-100 px-3 py-3 text-left"
                  >
                    <p className="text-sm font-semibold text-gray-900 truncate">{zone.zones.name}</p>
                    <StatusBadge level={level} size="sm" />
                  </button>
                )
              })}
            </div>
          </section>
        )}

        {!loading && filtered.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-10">조건에 맞는 장소가 없습니다</p>
        )}

        <button
          onClick={() => navigate('/offline')}
          className="text-center text-sm text-gray-400 underline underline-offset-2 py-2"
        >
          오프라인 캐시 지도 보기
        </button>
      </main>
    </div>
  )
}
