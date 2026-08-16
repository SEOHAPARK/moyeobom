import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useCongestion } from '../hooks/useCongestion'
import MobileHeader from '../components/MobileHeader'
import SectionCard from '../components/SectionCard'
import CongestionBar from '../components/CongestionBar'
import { getLevel, getPercent, getAvailabilityLabel } from '../lib/congestion'
import { formatTime, isNowPlaying } from '../lib/format'

function durationLabel(start, end) {
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  let diff = eh * 60 + em - (sh * 60 + sm)
  if (diff < 0) diff += 24 * 60
  return `${diff}min`
}

function Timetable({ performances }) {
  return (
    <SectionCard title="TIME TABLE">
      {performances.length === 0 ? (
        <p className="text-center text-gray-400 py-8 text-sm">등록된 공연이 없습니다</p>
      ) : (
        <ul className="divide-y divide-gray-50">
          {performances.map(p => {
            const playing = isNowPlaying(p.start_time, p.end_time)
            return (
              <li key={p.id} className="flex items-center justify-between px-5 py-3">
                <p className={`text-sm ${playing ? 'font-bold text-gray-900' : 'text-gray-400'}`}>{p.artist}</p>
                <p className={`text-xs ${playing ? 'text-gray-700' : 'text-gray-300'}`}>
                  {p.start_time} - {p.end_time}({durationLabel(p.start_time, p.end_time)})
                </p>
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
              <li key={e.id} className={`px-5 py-4 ${active ? 'bg-brand-50' : ''}`}>
                <div className="flex items-center justify-between">
                  <p className={`font-semibold ${active ? 'text-brand-600' : 'text-gray-800'}`}>{e.name}</p>
                  {active && (
                    <span className="text-xs bg-brand-500 text-white px-2 py-0.5 rounded-full">진행 중</span>
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

function NotifyButton({ startTime }) {
  const [subscribed, setSubscribed] = useState(false)

  async function toggle() {
    if (subscribed) {
      setSubscribed(false)
      return
    }
    if (typeof Notification !== 'undefined') {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') return
    }
    setSubscribed(true)
  }

  return (
    <button
      onClick={toggle}
      className={`rounded-xl py-3 font-bold text-sm transition ${
        subscribed ? 'bg-brand-50 text-brand-600 border border-brand-500' : 'bg-gray-50 text-gray-500'
      }`}
    >
      {subscribed ? `알림 설정됨${startTime ? ` (${startTime})` : ''}` : '알림 받기'}
    </button>
  )
}

function CrowdDetail({ zone, level, percent, online }) {
  return (
    <div className="rounded-xl bg-gray-50 px-4 py-3.5 text-sm flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-gray-400">현재 인원</span>
        <span className="font-semibold text-gray-800">{zone.current_count.toLocaleString()}명 / {zone.zones.max_capacity.toLocaleString()}명</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-gray-400">혼잡 단계</span>
        <span className={`font-semibold ${level.text}`}>{level.label} ({percent ?? '-'}%)</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-gray-400">데이터 상태</span>
        <span className="text-gray-600">{online ? '실시간 연결 중' : '오프라인 (최근 데이터)'}</span>
      </div>
    </div>
  )
}

export default function ZoneDetailPage() {
  const { zoneId } = useParams()
  const navigate = useNavigate()
  const { zones, lastUpdated, online } = useCongestion()
  const [performances, setPerformances] = useState([])
  const [booths, setBooths] = useState([])
  const [events, setEvents] = useState([])
  const [showCrowdDetail, setShowCrowdDetail] = useState(false)

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
      <MobileHeader titlePill={{ label: info.name, dot: level.dot }} />

      <main className="max-w-xl mx-auto px-4 py-5 flex flex-col gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="text-xl font-bold text-gray-900">{nowPlaying?.artist ?? info.name}</h2>
          <p className="text-sm text-gray-500 mt-1">
            {zoneType === 'stage' ? (nowPlaying ? '공연중' : '공연 없음') : (info.operating_status ?? '운영 정보')}{' '}
            <span className={`font-semibold ${level.key === 'blocked' ? 'text-red-600' : 'text-green-600'}`}>
              {getAvailabilityLabel(level, zoneType)}
            </span>
          </p>

          <CongestionBar percent={percent} level={level} />

          <p className="text-xs text-gray-400 text-right -mt-1">
            {online ? `최종 갱신 ${lastUpdated ? formatTime(lastUpdated) : '-'}` : '오프라인 · 최근 데이터'}
          </p>

          {zoneType === 'stage' && (
            <div className="grid grid-cols-2 gap-2 mt-4">
              <button
                onClick={() => setShowCrowdDetail(v => !v)}
                className="rounded-xl py-3 font-bold text-sm bg-gray-50 text-gray-600"
              >
                대기 현장 보기
              </button>
              <NotifyButton startTime={nowPlaying ? undefined : performances[0]?.start_time} />
            </div>
          )}

          {showCrowdDetail && (
            <div className="mt-3">
              <CrowdDetail zone={zone} level={level} percent={percent} online={online} />
            </div>
          )}
        </div>

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
              className="w-full bg-brand-500 text-white rounded-xl py-3.5 font-bold text-sm hover:bg-brand-600 transition"
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
