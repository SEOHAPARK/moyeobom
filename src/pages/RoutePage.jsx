import { useEffect, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { Icon } from '../components/ui/Icon'
import MobileHeader from '../components/MobileHeader'
import { useCongestion } from '../hooks/useCongestion'
import { formatTime } from '../lib/format'

function haversineMeters(a, b) {
  const R = 6371000
  const toRad = deg => (deg * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

const WALK_M_PER_MIN = 70

export default function RoutePage() {
  const { zoneId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { zones } = useCongestion()
  const [geoStatus, setGeoStatus] = useState('locating') // locating | ok | denied
  const [distance, setDistance] = useState(null)

  const zone = zones.find(z => String(z.zone_id) === String(zoneId))
  const manualOrigin = location.state?.originLabel
  const status = manualOrigin ? 'manual' : geoStatus

  useEffect(() => {
    if (manualOrigin || !zone?.zones?.lat) return
    if (!navigator.geolocation) {
      Promise.resolve().then(() => setGeoStatus('denied'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      pos => {
        const d = haversineMeters(
          { lat: pos.coords.latitude, lng: pos.coords.longitude },
          { lat: zone.zones.lat, lng: zone.zones.lng }
        )
        setDistance(Math.round(d))
        setGeoStatus('ok')
      },
      () => setGeoStatus('denied')
    )
  }, [zone, manualOrigin])

  if (!zone) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MobileHeader title="도보 경로 안내" />
        <p className="text-center text-gray-400 py-20 text-sm">불러오는 중...</p>
      </div>
    )
  }

  const minutes = distance != null ? Math.max(1, Math.round(distance / WALK_M_PER_MIN)) : null

  return (
    <div className="min-h-screen bg-gray-50">
      <MobileHeader title="도보 경로 안내" />

      <main className="max-w-xl mx-auto px-4 py-5 flex flex-col gap-4">
        <div className="border border-dashed border-gray-200 rounded-2xl h-72 bg-white flex flex-col items-center justify-center gap-1.5 text-gray-300 text-sm">
          <Icon name="map" size={32} />
          Image
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center justify-between text-sm">
          <div>
            <p className="text-gray-400 mb-1">출발지</p>
            <p className="font-semibold text-gray-900">{manualOrigin ?? '현재 내 위치'}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-400 mb-1">목적지</p>
            <p className="font-semibold text-gray-900">{zone.zones.name}</p>
          </div>
        </div>

        {status === 'denied' && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-sm text-amber-700 flex items-start gap-2">
            <Icon name="alert-triangle" size={20} className="shrink-0 mt-0.5" />
            위치 권한을 확인할 수 없습니다. 출발지를 직접 설정해주세요.
          </div>
        )}

        {(status === 'ok') && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center justify-between text-sm">
            <div>
              <p className="text-gray-400 mb-1">예상 소요 시간</p>
              <p className="font-heading text-lg font-bold text-gray-900">도보 약 {minutes}분</p>
            </div>
            <div className="text-right">
              <p className="text-gray-400 mb-1">거리</p>
              <p className="font-heading text-lg font-bold text-gray-900">{distance}m</p>
            </div>
          </div>
        )}

        {status === 'manual' && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5 text-sm text-gray-500">
            직접 설정한 출발지 기준 거리는 계산되지 않습니다. 지도에서 대략적인 경로를 참고해주세요.
          </div>
        )}

        <p className="text-xs text-gray-400">최종 갱신 {formatTime(new Date())}</p>

        <button
          onClick={() => navigate(`/route/${zoneId}/origin`)}
          className="w-full min-h-11 border border-gray-200 rounded-xl py-3 font-semibold text-sm text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors"
        >
          출발지 직접 설정하기
        </button>
      </main>
    </div>
  )
}
