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

function buildIcon(zone) {
  const level = getLevel({ current: zone.current_count, max: zone.zones.max_capacity, entryBlocked: zone.entry_blocked })
  const color = DOT_COLOR[level.key]

  return L.divIcon({
    html: `<div style="display:flex;flex-direction:column;align-items:center;gap:3px;">
      <div style="
        background:${color};
        color:white;
        width:48px;height:48px;
        border-radius:50%;
        display:flex;align-items:center;justify-content:center;
        box-shadow:0 2px 8px rgba(0,0,0,0.25);
        cursor:pointer;
        border:2.5px solid white;
        line-height:1.2;
      ">
        <span style="font-size:10px;font-weight:600;opacity:0.95">${level.label}</span>
      </div>
      <div style="
        background:rgba(15,23,42,0.75);
        color:white;
        font-size:11px;font-weight:700;
        padding:2px 8px;
        border-radius:10px;
        white-space:nowrap;
      ">${zone.zones.name}</div>
    </div>`,
    className: '',
    iconAnchor: [24, 24],
  })
}

const FestivalMap = forwardRef(function FestivalMap({ zones, onSelectZone }, ref) {
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

    L.control.zoom({ position: 'bottomright' }).addTo(map)
  }, [zones])

  // 마커 갱신 (최초 렌더 + 혼잡도 변경 시)
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return

    map.eachLayer(layer => {
      if (layer instanceof L.Marker) map.removeLayer(layer)
    })

    zones.forEach(zone => {
      const { lat, lng } = zone.zones
      if (!lat || !lng) return
      const marker = L.marker([lat, lng], { icon: buildIcon(zone) }).addTo(map)
      marker.on('click', () => onSelectZone(zone))
    })
  }, [zones, onSelectZone])

  return <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
})

export default FestivalMap
