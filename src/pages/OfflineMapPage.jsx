import MobileHeader from '../components/MobileHeader'
import SectionCard from '../components/SectionCard'
import { useCongestion } from '../hooks/useCongestion'
import { getLevel, getPercent, LEVELS } from '../lib/congestion'
import { formatTime } from '../lib/format'

const LEGEND = ['relaxed', 'normal', 'crowded', 'blocked']

export default function OfflineMapPage() {
  const { zones, lastUpdated } = useCongestion()

  const stageZones = zones.filter(z => z.zones.type === 'stage')
  const facilityZones = zones.filter(z => z.zones.type !== 'stage')

  return (
    <div className="min-h-screen bg-gray-50">
      <MobileHeader title="오프라인 캐시 지도" />

      <main className="max-w-xl mx-auto px-4 py-5 flex flex-col gap-4">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm">
          <div className="flex items-center justify-between font-semibold text-amber-700">
            <span>⚠ 오프라인 상태</span>
            <span className="text-xs font-normal text-amber-600">마지막 갱신 {lastUpdated ? formatTime(lastUpdated) : '-'}</span>
          </div>
          <p className="text-amber-600 text-xs mt-1">저장된 지도 정보를 표시 중입니다. 실시간 혼잡도가 반영되지 않을 수 있습니다.</p>
        </div>

        <div className="border border-dashed border-gray-200 rounded-2xl h-64 bg-white flex items-center justify-center text-gray-300 text-sm">
          Image
        </div>

        <div className="flex flex-wrap gap-3 text-xs text-gray-500">
          {LEGEND.map(key => (
            <span key={key} className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${LEVELS[key].dot}`} />
              {LEVELS[key].label}
            </span>
          ))}
        </div>

        <SectionCard title="공연장">
          {stageZones.length === 0 ? (
            <p className="text-center text-gray-400 py-6 text-sm">캐시된 정보가 없습니다</p>
          ) : (
            <ul className="divide-y divide-gray-50">
              {stageZones.map(zone => {
                const level = getLevel({ current: zone.current_count, max: zone.zones.max_capacity, entryBlocked: zone.entry_blocked })
                const percent = getPercent(zone.current_count, zone.zones.max_capacity)
                return (
                  <li key={zone.id} className="flex items-center justify-between px-5 py-3.5">
                    <div>
                      <p className="font-semibold text-gray-900">{zone.zones.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        수용 {zone.zones.max_capacity.toLocaleString()}명 · 캐시 기준 혼잡도 {percent ?? '-'}%
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-gray-600">{level.label}</span>
                  </li>
                )
              })}
            </ul>
          )}
        </SectionCard>

        <SectionCard title="편의시설 및 부스">
          {facilityZones.length === 0 ? (
            <p className="text-center text-gray-400 py-6 text-sm">캐시된 정보가 없습니다</p>
          ) : (
            <ul className="divide-y divide-gray-50">
              {facilityZones.map(zone => {
                const level = getLevel({ current: zone.current_count, max: zone.zones.max_capacity, entryBlocked: zone.entry_blocked })
                return (
                  <li key={zone.id} className="flex items-center justify-between px-5 py-3.5">
                    <div>
                      <p className="font-semibold text-gray-900">{zone.zones.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">정보 캐시 저장됨</p>
                    </div>
                    <span className="text-xs font-semibold text-gray-600">{level.label}</span>
                  </li>
                )
              })}
            </ul>
          )}
        </SectionCard>

        <SectionCard title="캐시 데이터 안내">
          <p className="px-5 py-4 text-sm text-gray-500">
            표시된 혼잡도·운영 상태는 마지막 네트워크 연결 시점({lastUpdated ? formatTime(lastUpdated) : '알 수 없음'}) 기준입니다.
          </p>
        </SectionCard>
      </main>
    </div>
  )
}
