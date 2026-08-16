import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { getLevel } from '../lib/congestion'

const DOT_COLOR = {
  relaxed: '#22c55e',
  normal: '#eab308',
  crowded: '#f97316',
  blocked: '#ef4444',
  unknown: '#9ca3af',
}

function buildIcon(zone, selected) {
  const level = getLevel({ current: zone.current_count, max: zone.zones.max_capacity, entryBlocked: zone.entry_blocked })
  const color = DOT_COLOR[level.key]

  const pill = selected
    ? `background:${color};color:white;border:2px solid white;`
    : `background:white;color:#0f172a;border:1px solid rgba(0,0,0,0.08);`

  const dot = selected ? '' : `<span style="width:7px;height:7px;border-radius:999px;background:${color};flex-shrink:0;"></span>`

  return L.divIcon({
    html: `<div style="
      display:inline-flex;align-items:center;gap:5px;
      ${pill}
      padding:6px 12px;
      border-radius:999px;
      font-size:12px;font-weight:700;
      white-space:nowrap;
      box-shadow:0 2px 6px rgba(0,0,0,0.15);
      cursor:pointer;
    ">${dot}${zone.zones.name}</div>`,
    className: '',
    iconAnchor: [selected ? 40 : 30, 14],
  })
}

const FestivalMap = forwardRef(function FestivalMap({ zones, selectedId, onSelectZone }, ref) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)

  useImperativeHandle(ref, () => ({
    locate() {
      if (!mapInstanceRef.current) return
      if (!navigator.geolocation) {
        window.alert('이 브라우저에서는 위치 확인을 지원하지 않습니다.')
        return
      }
      navigator.geolocation.getCurrentPosition(
        pos => mapInstanceRef.current.setView([pos.coords.latitude, pos.coords.longitude], 18),
        () => window.alert('위치 권한을 확인할 수 없습니다. 출발지를 직접 설정해주세요.')
      )
    },
  }))

  useEffect(() => {
    if (!zones.length || !mapRef.current || mapInstanceRef.current) return

    const withLatLng = zones.find(z => z.zones.lat && z.zones.lng)
    const center = withLatLng ? [withLatLng.zones.lat, withLatLng.zones.lng] : [37.5665, 126.978]
    const map = L.map(mapRef.current, { zoomControl: false }).setView(center, 17)
    mapInstanceRef.current = map

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
    }).addTo(map)
  }, [zones])

  // 마커 갱신 (최초 렌더 + 혼잡도 변경 + 선택 상태 변경 시)
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return

    map.eachLayer(layer => {
      if (layer instanceof L.Marker) map.removeLayer(layer)
    })

    zones.forEach(zone => {
      const { lat, lng } = zone.zones
      if (!lat || !lng) return
      const selected = zone.id === selectedId
      const marker = L.marker([lat, lng], { icon: buildIcon(zone, selected), zIndexOffset: selected ? 1000 : 0 }).addTo(map)
      marker.on('click', () => onSelectZone(zone))
    })
  }, [zones, selectedId, onSelectZone])

  return <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
})

export default FestivalMap
