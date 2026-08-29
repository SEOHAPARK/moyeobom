import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { getLevel } from '../lib/congestion'

function pillHtml(zone, selected) {
  const level = getLevel({ current: zone.current_count, max: zone.zones.max_capacity, entryBlocked: zone.entry_blocked })
  const color = level.fg

  const pill = selected
    ? `background:${color};color:var(--moyeobom-paper);border:2px solid var(--moyeobom-paper);`
    : `background:var(--moyeobom-paper);color:var(--moyeobom-ink-900);border:1px solid var(--moyeobom-line);`

  const dot = selected ? '' : `<span style="width:7px;height:7px;border-radius:999px;background:${color};flex-shrink:0;"></span>`

  return `<div style="
    display:inline-flex;align-items:center;gap:5px;
    ${pill}
    padding:6px 12px;
    border-radius:var(--moyeobom-radius-full);
    font:700 12px var(--moyeobom-font-base);
    white-space:nowrap;
    box-shadow:var(--moyeobom-shadow-sm);
    cursor:pointer;
  ">${dot}${zone.zones.name}</div>`
}

// 기본 divIcon은 12x12로 잡혀서 실제 보이는 알약 크기보다 탭 영역이 훨씬 좁아짐.
// 우선 대략적인 크기로 그린 뒤, 실제 렌더된 크기를 측정해 히트 영역을 맞춰 재설정한다.
function fixHitArea(marker) {
  const el = marker.getElement()
  const child = el?.firstElementChild
  if (!child) return
  const w = child.offsetWidth
  const h = child.offsetHeight
  if (!w || !h) return
  marker.setIcon(
    L.divIcon({
      html: child.outerHTML,
      className: '',
      iconSize: [w, h],
      iconAnchor: [w / 2, h / 2],
    })
  )
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
    fitToZones(zoneList) {
      const map = mapInstanceRef.current
      if (!map) return
      const points = zoneList.filter(z => z.zones.lat && z.zones.lng).map(z => [z.zones.lat, z.zones.lng])
      if (points.length === 0) return
      if (points.length === 1) {
        map.setView(points[0], 17)
        return
      }
      map.fitBounds(L.latLngBounds(points), { padding: [48, 48] })
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
      const icon = L.divIcon({ html: pillHtml(zone, selected), className: '', iconSize: [12, 12] })
      const marker = L.marker([lat, lng], { icon, zIndexOffset: selected ? 1000 : 0 }).addTo(map)
      marker.on('click', () => onSelectZone(zone))
      fixHitArea(marker)
    })
  }, [zones, selectedId, onSelectZone])

  return <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
})

export default FestivalMap
