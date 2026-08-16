import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useCongestion } from '../hooks/useCongestion'
import MobileHeader from '../components/MobileHeader'
import SectionCard from '../components/SectionCard'
import StatusBadge from '../components/StatusBadge'
import { getLevel, getPercent } from '../lib/congestion'
import { formatTime, formatClock } from '../lib/format'

function getNow() {
  const now = new Date()
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
}

function isNowPlaying(start, end) {
  const now = getNow()
  return now >= start && now <= end
}

function Timetable({ performances }) {
  return (
    <SectionCard title="🎵 공연 타임테이블">
      {performances.length === 0 ? (
        <p className="text-center text-gray-400 py-8 text-sm">등록된 공연이 없습니다</p>
      ) : (
        <ul className="divide-y divide-gray-50">
          {performances.map(p => {
            const playing = isNowPlaying(p.start_time, p.end_time)
            return (
              <li key={p.id} className={`flex items-center gap-4 px-5 py-4 ${playing ? 'bg-green-50' : ''}`}>
                <div className="text-center w-20 flex-shrink-0 text-xs text-gray-400">
                  <p>{p.start_time}</p>
                  <p className="text-gray-300">–</p>
                  <p>{p.end_time}</p>
                </div>
                <div className="flex-1">
                  <p className={`font-semibold ${playing ? 'text-green-700' : 'text-gray-800'}`}>{p.artist}</p>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${playing ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500'}`}>
                  {playing ? '진행 중' : '예정'}
                </span>
              </li>
            )
          })}
        </ul>
      )}
    </SectionCard>
  )
}

function MenuList({ booths }) {
  return (
    <SectionCard title="메뉴 및 가격">
      {booths.length === 0 ? (
        <p className="text-center text-gray-400 py-8 text-sm">등록된 메뉴가 없습니다</p>
      ) : (
        <ul className="divide-y divide-gray-50">
          {booths.map(b => (
            <li key={b.id} className="flex items-center justify-between px-5 py-3.5">
              <div>
                <p className="font-medium text-gray-800">{b.name}</p>
                {b.description && <p className="text-xs text-gray-400 mt-0.5">{b.description}</p>}
              </div>
              {b.price != null && (
                <p className="font-semibold text-gray-900 whitespace-nowrap">{Number(b.price).toLocaleString()}원</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  )
}

function EventList({ events }) {
  return (
    <SectionCard title="이벤트 내용">
      {events.length === 0 ? (
        <p className="text-center text-gray-400 py-8 text-sm">등록된 이벤트가 없습니다</p>
      ) : (
        <ul className="divide-y divide-gray-50">
          {events.map(e => {
            const active = isNowPlaying(e.start_time, e.end_time)
            return (
              <li key={e.id} className={`px-5 py-4 ${active ? 'bg-purple-50' : ''}`}>
                <div className="flex items-center justify-between">
                  <p className={`font-semibold ${active ? 'text-purple-700' : 'text-gray-800'}`}>{e.name}</p>
                  {active && (
                    <span className="text-xs bg-purple-500 text-white px-2 py-0.5 rounded-full">진행 중</span>
                  )}
                </div>
                {e.description && <p className="text-sm text-gray-400 mt-1">{e.description}</p>}
                <p className="text-xs text-gray-300 mt-1">{e.start_time} – {e.end_time}</p>
              </li>
            )
          })}
        </ul>
      )}
    </SectionCard>
  )
}

function OperatingInfoCard({ info }) {
  return (
    <SectionCard title="운영 정보">
      <div className="px-5 py-4 flex flex-col gap-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-gray-400">운영 시간</span>
          <span className="font-medium text-gray-800">{info.operating_hours ?? '정보 없음'}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-400">현재 상태</span>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-700">
            {info.operating_status ?? '정보 없음'}
          </span>
        </div>
      </div>
    </SectionCard>
  )
}

function LocationCard({ description }) {
  return (
    <SectionCard title="위치 정보">
      <div className="px-5 pb-5 pt-1">
        <div className="border border-dashed border-gray-200 rounded-xl h-36 flex items-center justify-center text-gray-300 text-sm mb-3">
          Image
        </div>
        <p className="text-sm text-gray-500">📍 {description || '위치 정보가 등록되지 않았습니다'}</p>
      </div>
    </SectionCard>
  )
}

export default function ZoneDetailPage() {
  const { zoneId } = useParams()
  const navigate = useNavigate()
  const { zones, lastUpdated, online } = useCongestion()
  const [performances, setPerformances] = useState([])
  const [booths, setBooths] = useState([])
  const [events, setEvents] = useState([])

  const zone = zones.find(z => String(z.zone_id) === String(zoneId))
  const zoneType = zone?.zones?.type

  useEffect(() => {
    if (!zoneType) return
    if (zoneType === 'stage') {
      supabase.from('performances').select('*').eq('zone_id', zoneId).order('start_time')
        .then(({ data }) => data && setPerformances(data))
    } else if (zoneType === 'food') {
      supabase.from('booths').select('*').eq('zone_id', zoneId)
        .then(({ data }) => data && setBooths(data))
    } else if (zoneType === 'event') {
      supabase.from('zone_events').select('*').eq('zone_id', zoneId).order('start_time')
        .then(({ data }) => data && setEvents(data))
    }
  }, [zoneId, zoneType])

  if (!zone) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MobileHeader title="상세 정보" />
        <p className="text-center text-gray-400 py-20 text-sm">불러오는 중...</p>
      </div>
    )
  }

  const { current_count, zones: info } = zone
  const level = getLevel({ current: current_count, max: info.max_capacity, entryBlocked: zone.entry_blocked })
  const percent = getPercent(current_count, info.max_capacity)
  const nowPlaying = zoneType === 'stage' ? performances.find(p => isNowPlaying(p.start_time, p.end_time)) : null

  return (
    <div className="min-h-screen bg-gray-50">
      <MobileHeader title={info.name} />

      <main className="max-w-xl mx-auto px-4 py-5 flex flex-col gap-4">
        <div className={`rounded-2xl border-2 ${level.border} ${level.bg} p-5`}>
          <div className="flex justify-between items-start mb-3">
            <div>
              <h2 className={`text-xl font-bold ${level.text}`}>{info.name}</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                {zoneType === 'stage' ? (nowPlaying ? '현재 공연 중' : info.description) : info.description}
              </p>
            </div>
            <StatusBadge level={level} />
          </div>

          {percent != null && (
            <>
              <div className="flex items-center justify-between text-sm mb-1.5">
                <span className="text-gray-500">👤 현재 인원 {current_count.toLocaleString()} / 수용 {info.max_capacity.toLocaleString()}명</span>
                <span className={`font-bold ${level.text}`}>{percent}%</span>
              </div>
              <div className="w-full bg-white bg-opacity-70 rounded-full h-2.5 mb-3">
                <div className={`h-2.5 rounded-full ${level.bar} transition-all duration-500`} style={{ width: `${Math.min(percent, 100)}%` }} />
              </div>
            </>
          )}

          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white bg-opacity-70 text-gray-700">
              {level.key === 'blocked' ? '입장 불가' : '입장 가능'}
            </span>
            <span className="text-xs text-gray-400">⏱ 갱신 {lastUpdated ? formatClock(lastUpdated) : '-'}</span>
          </div>
        </div>

        <SectionCard>
          <div className="px-5 py-4 flex items-center justify-between">
            <p className="text-sm font-bold text-gray-800">정보 갱신 상태</p>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${online ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
              {online ? '온라인' : '오프라인'}
            </span>
          </div>
          <div className="px-5 pb-4 -mt-1">
            <p className="text-sm text-gray-600 flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${online ? 'bg-green-500' : 'bg-amber-500'}`} />
              혼잡도 및 운영 상태 최종 갱신: {lastUpdated ? formatTime(lastUpdated) : '정보 없음'}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {online ? '실시간 연결 중 · 정보가 최신 상태입니다.' : '오프라인 상태 · 최신 정보가 아닐 수 있습니다.'}
            </p>
          </div>
        </SectionCard>

        <LocationCard description={info.location_desc ?? info.description} />

        {zoneType === 'stage' && <Timetable performances={performances} />}

        {zoneType !== 'stage' && (
          <>
            <OperatingInfoCard info={info} />
            {zoneType === 'food' && <MenuList booths={booths} />}
            {zoneType === 'event' && <EventList events={events} />}
          </>
        )}

        {zoneType === 'stage' && (
          <div className="flex flex-col gap-2 pt-1">
            <button
              onClick={() => navigate(`/route/${zoneId}`)}
              className="w-full bg-gray-900 text-white rounded-xl py-3.5 font-bold text-sm hover:bg-gray-800 transition"
            >
              현재 위치에서 경로 안내
            </button>
            <button
              onClick={() => navigate(`/route/${zoneId}/origin`)}
              className="text-center text-sm text-gray-400 underline underline-offset-2 py-1"
            >
              출발지 직접 설정
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
