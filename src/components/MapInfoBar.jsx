import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline'
import CongestionBar from './CongestionBar'
import { getLevel, getPercent } from '../lib/congestion'

export default function MapInfoBar({ zone, subtitle, onExpand }) {
  if (!zone) return null

  const level = getLevel({ current: zone.current_count, max: zone.zones.max_capacity, entryBlocked: zone.entry_blocked })
  const percent = getPercent(zone.current_count, zone.zones.max_capacity)

  return (
    <div className="absolute bottom-4 left-4 right-4 z-[1000]">
      <div className="bg-white rounded-2xl shadow-xl px-5 py-4" style={{ animation: 'slideUp 0.2s ease' }}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-heading font-bold text-gray-900 truncate">
              {zone.zones.name} : <span className={level.text}>{level.label}</span>
            </p>
            {subtitle && <p className="text-sm text-gray-500 mt-0.5 truncate">{subtitle}</p>}
          </div>
          <button
            onClick={onExpand}
            aria-label="상세 보기"
            className="shrink-0 w-11 h-11 -mr-1 -mt-1 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-brand-600 cursor-pointer transition-colors"
          >
            <ArrowTopRightOnSquareIcon className="w-4.5 h-4.5" aria-hidden="true" />
          </button>
        </div>
        <CongestionBar percent={percent} level={level} />
      </div>
      <style>{`@keyframes slideUp { from { transform: translateY(12px); opacity:0 } to { transform: translateY(0); opacity:1 } }`}</style>
    </div>
  )
}
