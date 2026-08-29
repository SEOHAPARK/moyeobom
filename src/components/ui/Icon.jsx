import {
  AlertTriangle, ArrowRight, Ban, CheckCircle2, ChevronLeft, Download, ExternalLink,
  LocateFixed, LogOut, Map, MapPin, QrCode, Search, Users, X, Bell, BellRing,
  BarChart3, LayoutDashboard, Music, ShieldCheck, Store,
} from 'lucide-react'

const ICONS = {
  'alert-triangle': AlertTriangle, 'arrow-right': ArrowRight, ban: Ban, 'check-circle-2': CheckCircle2,
  'chevron-left': ChevronLeft, download: Download, 'external-link': ExternalLink, 'locate-fixed': LocateFixed,
  'log-out': LogOut, map: Map, 'map-pin': MapPin, 'qr-code': QrCode, search: Search, users: Users, x: X,
  bell: Bell, 'bell-ring': BellRing, 'bar-chart-3': BarChart3, 'layout-dashboard': LayoutDashboard,
  music: Music, 'shield-check': ShieldCheck, store: Store,
}

/** Lucide 아이콘 래퍼. stroke 1.5를 한 곳에서 강제한다. 사용: <Icon name="map-pin" size={18} /> */
export function Icon({ name, size = 20, strokeWidth = 1.5, ...rest }) {
  const Cmp = ICONS[name]
  if (!Cmp) return null
  return <Cmp size={size} strokeWidth={strokeWidth} aria-hidden="true" {...rest} />
}
