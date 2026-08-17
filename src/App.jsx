import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowDownTrayIcon, ViewfinderCircleIcon } from '@heroicons/react/24/outline'
import FestivalMap from './components/KakaoMap'
import MapInfoBar from './components/MapInfoBar'
import Logo from './components/Logo'
import { useCongestion } from './hooks/useCongestion'
import { supabase } from './lib/supabase'
import { isNowPlaying } from './lib/format'

const FILTERS = [
  { key: 'all', label: '전체' },
  { key: 'stage', label: '공연장' },
  { key: 'food', label: 'F&B' },
  { key: 'event', label: '이벤트' },
  { key: 'restroom', label: '화장실' },
]

export default function App() {
  const { zones, loading } = useCongestion()
  const [filter, setFilter] = useState('all')
  const [selectedZone, setSelectedZone] = useState(null)
  const [nowPlaying, setNowPlaying] = useState(null)
  const mapRef = useRef(null)
  const navigate = useNavigate()

  const filtered = useMemo(
    () => (filter === 'all' ? zones : zones.filter(z => z.zones.type === filter)),
    [zones, filter]
  )

  // 필터를 바꾸거나 데이터를 처음 불러왔을 때만 화면을 맞춰준다.
  // zones/filtered를 deps에 넣으면 폴링될 때마다 지도가 흔들려서 의도적으로 뺌.
  useEffect(() => {
    if (loading) return
    mapRef.current?.fitToZones(filter === 'all' ? zones : zones.filter(z => z.zones.type === filter))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, loading])

  useEffect(() => {
    if (!selectedZone || selectedZone.zones.type !== 'stage') return
    supabase
      .from('performances')
      .select('*')
      .eq('zone_id', selectedZone.zone_id)
      .order('start_time')
      .then(({ data }) => {
        setNowPlaying((data ?? []).find(p => isNowPlaying(p.start_time, p.end_time)) ?? null)
      })
  }, [selectedZone])

  const subtitle = selectedZone
    ? selectedZone.zones.type === 'stage'
      ? nowPlaying
        ? `${nowPlaying.artist} 공연중`
        : '공연 없음'
      : (selectedZone.zones.operating_status ?? selectedZone.zones.description ?? null)
    : null

  return (
    <div className="relative" style={{ height: '100dvh', overflow: 'hidden' }}>
      {loading ? (
        <div className="flex items-center justify-center h-full text-gray-400 text-sm">불러오는 중...</div>
      ) : (
        <FestivalMap
          ref={mapRef}
          zones={filtered}
          selectedId={selectedZone?.id}
          onSelectZone={setSelectedZone}
        />
      )}

      {/* 상단 브랜드 + 필터 오버레이 */}
      <div className="absolute top-4 left-4 right-4 z-[900] flex items-center gap-2">
        <div className="shrink-0 h-11 bg-white/90 backdrop-blur rounded-full pl-2 pr-3.5 flex items-center gap-1.5 shadow">
          <Logo size={22} />
          <span className="font-heading font-bold text-sm text-gray-900">모여봄</span>
        </div>
        <div className="flex-1 flex gap-1.5 overflow-x-auto">
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`shrink-0 h-11 px-4 rounded-full text-xs font-semibold whitespace-nowrap shadow cursor-pointer transition-colors ${
                filter === f.key ? 'bg-brand-500 text-white' : 'bg-white/90 backdrop-blur text-gray-600 hover:text-gray-900'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* 우측 하단 플로팅 버튼: 오프라인 지도 / 현재 위치 */}
      <div
        className="absolute right-4 z-[900] flex flex-col gap-2 transition-all"
        style={{ bottom: selectedZone ? '196px' : '24px' }}
      >
        <button
          onClick={() => navigate('/offline')}
          aria-label="오프라인 캐시 지도"
          className="w-11 h-11 rounded-full bg-white shadow flex items-center justify-center text-gray-500 hover:text-gray-800 cursor-pointer transition-colors"
        >
          <ArrowDownTrayIcon className="w-5 h-5" aria-hidden="true" />
        </button>
        <button
          onClick={() => mapRef.current?.locate()}
          aria-label="현재 위치"
          className="w-11 h-11 rounded-full bg-white shadow flex items-center justify-center text-gray-700 hover:text-brand-600 cursor-pointer transition-colors"
        >
          <ViewfinderCircleIcon className="w-5 h-5" aria-hidden="true" />
        </button>
      </div>

      <MapInfoBar
        zone={selectedZone}
        subtitle={subtitle}
        onExpand={() => navigate(`/zone/${selectedZone.zone_id}`)}
      />
    </div>
  )
}
