import { Link } from 'react-router-dom'
import { useCongestion } from '../../hooks/useCongestion'
import { useStatusChangeLog } from '../../hooks/useStatusChangeLog'
import StatTile from '../../components/admin/StatTile'
import { getLevel, getPercent, LEVELS } from '../../lib/congestion'
import { formatTime } from '../../lib/format'

export default function AdminDashboardPage() {
  const { zones, lastUpdated } = useCongestion()
  const { entries, available } = useStatusChangeLog(5)

  const stageZones = zones.filter(z => z.zones.type === 'stage')
  const facilityZones = zones.filter(z => z.zones.type !== 'stage')
  const manualCount = zones.filter(z => z.manual_status || z.entry_blocked).length
  const today = new Date().toDateString()
  const todayChanges = entries.filter(e => new Date(e.changed_at).toDateString() === today).length

  const facilityByType = ['food', 'event', 'restroom'].map(type => {
    const list = facilityZones.filter(z => z.zones.type === type)
    return {
      type,
      label: type === 'food' ? 'F&B 부스' : type === 'event' ? '이벤트 부스' : '화장실',
      count: list.length,
    }
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-900">관리자 대시보드</h1>
        <Link to="/admin/privacy" className="text-sm text-gray-400 underline underline-offset-2">개인정보 보호 안내</Link>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <StatTile label="전체 공연장" value={`${stageZones.length}개 운영 중`} sub={`최종 갱신 ${lastUpdated ? formatTime(lastUpdated) : '-'}`} />
        <StatTile label="전체 편의시설" value={`${facilityZones.length}개 노출 중`} sub={`최종 갱신 ${lastUpdated ? formatTime(lastUpdated) : '-'}`} />
        <StatTile label="수동 상태 적용 중" value={`${manualCount}건`} sub="자동 산정값 우선 적용 중지" />
        <StatTile label="오늘 상태 변경 이력" value={available ? `${todayChanges}건` : '-'} sub={available ? '누적 변경 내역' : '이력 데이터 없음'} />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-800">공연장별 혼잡도 현황</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-400 text-xs">
              <th className="px-6 py-2 font-medium">공연장</th>
              <th className="px-6 py-2 font-medium">현재 인원 / 수용인원</th>
              <th className="px-6 py-2 font-medium">혼잡도</th>
              <th className="px-6 py-2 font-medium">상태 구분</th>
              <th className="px-6 py-2 font-medium">갱신 시각</th>
            </tr>
          </thead>
          <tbody>
            {stageZones.map(z => {
              const percent = getPercent(z.current_count, z.zones.max_capacity)
              return (
                <tr key={z.id} className="border-t border-gray-50">
                  <td className="px-6 py-3 font-medium text-gray-800">{z.zones.name}</td>
                  <td className="px-6 py-3 text-gray-600">{z.current_count.toLocaleString()} / {z.zones.max_capacity.toLocaleString()}명</td>
                  <td className="px-6 py-3 text-gray-600">{percent ?? '-'}%</td>
                  <td className="px-6 py-3 text-gray-600">{z.manual_status || z.entry_blocked ? '수동' : '자동'}</td>
                  <td className="px-6 py-3 text-gray-400">{lastUpdated ? formatTime(lastUpdated) : '-'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <div className="px-6 py-4 flex justify-end">
          <Link to="/admin/congestion" className="text-sm font-semibold bg-gray-900 text-white px-4 py-2 rounded-lg">
            공연장별 혼잡도 현황 전체 보기
          </Link>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-gray-800">편의시설별 상태 및 혼잡도</h2>
          <Link to="/admin/facilities" className="text-sm font-semibold bg-gray-900 text-white px-4 py-2 rounded-lg">
            편의시설 관리
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {facilityByType.map(f => {
            const list = facilityZones.filter(z => z.zones.type === f.type)
            const counts = ['relaxed', 'normal', 'crowded'].map(key => ({
              key,
              label: LEVELS[key].label,
              n: list.filter(z => getLevel({ current: z.current_count, max: z.zones.max_capacity, entryBlocked: z.entry_blocked }).key === key).length,
            }))
            return (
              <div key={f.type} className="bg-white rounded-2xl border border-gray-100 p-5">
                <p className="font-bold text-gray-800">{f.label}</p>
                <p className="text-sm text-gray-400 mt-1">{f.count}개 노출</p>
                <p className="text-xs text-gray-400 mt-2">
                  {counts.map(c => `${c.label} ${c.n}`).join('   ')}
                </p>
              </div>
            )
          })}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-800">최근 시설 상태 변경 이력</h2>
        </div>
        {!available || entries.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-8">
            {available ? '변경 이력이 없습니다' : '변경 이력 테이블이 아직 준비되지 않았습니다'}
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 text-xs">
                <th className="px-6 py-2 font-medium">변경 시각</th>
                <th className="px-6 py-2 font-medium">시설명</th>
                <th className="px-6 py-2 font-medium">변경자</th>
                <th className="px-6 py-2 font-medium">이전 상태</th>
                <th className="px-6 py-2 font-medium">변경 후 상태</th>
                <th className="px-6 py-2 font-medium">변경 사유</th>
              </tr>
            </thead>
            <tbody>
              {entries.map(e => (
                <tr key={e.id} className="border-t border-gray-50">
                  <td className="px-6 py-3 text-gray-400">{formatTime(e.changed_at)}</td>
                  <td className="px-6 py-3 font-medium text-gray-800">{e.facility_name}</td>
                  <td className="px-6 py-3 text-gray-600">{e.changed_by}</td>
                  <td className="px-6 py-3 text-gray-600">{e.previous_status}</td>
                  <td className="px-6 py-3 text-gray-600">{e.new_status}</td>
                  <td className="px-6 py-3 text-gray-400">{e.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div>
        <h2 className="font-bold text-gray-800 mb-3">관리 기능 바로가기</h2>
        <div className="grid grid-cols-4 gap-4">
          <Link to="/admin/zones" className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-gray-300">
            <p className="font-bold text-gray-800">공연장 관리</p>
            <p className="text-xs text-gray-400 mt-1">공연장·수용인원·공연 일정 등록 및 수정</p>
          </Link>
          <Link to="/admin/facilities" className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-gray-300">
            <p className="font-bold text-gray-800">편의시설 관리</p>
            <p className="text-xs text-gray-400 mt-1">F&B·이벤트·화장실 위치 및 운영 정보 관리</p>
          </Link>
          <Link to="/admin/congestion" className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-gray-300">
            <p className="font-bold text-gray-800">공연장별 혼잡도 현황</p>
            <p className="text-xs text-gray-400 mt-1">실시간 혼잡도 및 수동·자동 상태 확인</p>
          </Link>
          <Link to="/admin/privacy" className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-gray-300">
            <p className="font-bold text-gray-800">개인정보 보호 안내</p>
            <p className="text-xs text-gray-400 mt-1">카메라 데이터 처리 목적 및 보호 정책 확인</p>
          </Link>
        </div>
      </div>
    </div>
  )
}
