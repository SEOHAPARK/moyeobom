import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCongestion } from '../../hooks/useCongestion'
import { useAdminAuth } from '../../hooks/useAdminAuth'
import { getLevel, getPercent, LEVELS } from '../../lib/congestion'
import { formatTime } from '../../lib/format'
import StatTile from '../../components/admin/StatTile'
import Modal from '../../components/admin/Modal'
import { supabase } from '../../lib/supabase'

const FILTER_OPTIONS = [
  { key: '', label: '전체' },
  { key: 'relaxed', label: '여유' },
  { key: 'normal', label: '보통' },
  { key: 'crowded', label: '혼잡' },
  { key: 'blocked', label: '입장 불가' },
]

async function logStatusChange({ zone, previousLabel, newLabel, reason, changedBy }) {
  try {
    await supabase.from('status_change_log').insert({
      facility_id: zone.zone_id,
      facility_name: zone.zones.name,
      previous_status: previousLabel,
      new_status: newLabel,
      reason,
      changed_by: changedBy,
      changed_at: new Date().toISOString(),
    })
  } catch {
    // 이력 테이블이 아직 없을 수 있음 - 상태 변경 자체는 계속 진행
  }
}

export default function AdminCongestionPage() {
  const { zones, lastUpdated, refetch } = useCongestion()
  const { user } = useAdminAuth()
  const [filter, setFilter] = useState('')
  const [statusModalZone, setStatusModalZone] = useState(null)
  const [entryBlockedZone, setEntryBlockedZone] = useState(null)
  const [dismissed, setDismissed] = useState(new Set())
  const [showInfo, setShowInfo] = useState(false)

  const stageZones = zones.filter(z => z.zones.type === 'stage')

  const withLevel = stageZones.map(z => ({
    ...z,
    level: getLevel({ current: z.current_count, max: z.zones.max_capacity, entryBlocked: z.entry_blocked }),
    autoLevel: getLevel({ current: z.current_count, max: z.zones.max_capacity }),
    percent: getPercent(z.current_count, z.zones.max_capacity),
  }))

  const filtered = filter ? withLevel.filter(z => z.level.key === filter) : withLevel
  const crowdedCount = withLevel.filter(z => z.level.key === 'crowded' || z.level.key === 'blocked').length
  const blockedCount = withLevel.filter(z => z.level.key === 'blocked').length
  const manualCount = withLevel.filter(z => z.manual_status || z.entry_blocked).length

  // 혼잡도 100% 이상이면서 아직 관리자 확인 전인 공연장은 자동으로 입장불가 확인 팝업을 띄운다
  const autoBlockTarget = withLevel.find(z => z.percent >= 100 && !z.entry_blocked && !dismissed.has(z.id))
  const activeEntryBlockedZone = entryBlockedZone ?? autoBlockTarget

  async function handleEntryBlockedConfirm(zone, reason) {
    await supabase.from('congestion').update({
      entry_blocked: true,
      manual_status: 'blocked',
      manual_reason: reason,
      manual_by: user?.email,
      manual_at: new Date().toISOString(),
    }).eq('id', zone.id)

    await logStatusChange({
      zone,
      previousLabel: zone.level.label,
      newLabel: '입장 불가',
      reason,
      changedBy: user?.email,
    })

    setEntryBlockedZone(null)
    refetch()
  }

  function handleEntryBlockedCancel(zone) {
    setDismissed(prev => new Set(prev).add(zone.id))
    setEntryBlockedZone(null)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold text-gray-900">공연장별 혼잡도 현황</h1>
          <button onClick={() => setShowInfo(true)} className="text-xs text-gray-400 underline underline-offset-2 cursor-pointer hover:text-gray-600">
            혼잡도 상태 안내
          </button>
        </div>
        <Link to="/admin/zones" className="text-sm font-semibold bg-brand-500 text-white hover:bg-brand-600 transition-colors cursor-pointer px-4 py-2 rounded-lg">
          수용인원 입력
        </Link>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <StatTile label="전체 공연장" value={stageZones.length} sub="등록된 공연장 수" />
        <StatTile label="혼잡" value={crowdedCount} sub="혼잡 이상 공연장" />
        <StatTile label="입장 불가" value={blockedCount} sub="입장 불가 처리 중" />
        <StatTile label="수동 상태 적용" value={manualCount} sub="자동 산정 재정의 중" />
      </div>

      <div>
        <p className="text-sm font-bold text-gray-800 mb-2">공연장 목록</p>
        <div className="flex gap-2">
          {FILTER_OPTIONS.map(o => (
            <button
              key={o.key}
              onClick={() => setFilter(o.key)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold border ${
                filter === o.key ? 'bg-brand-500 text-white border-brand-500' : 'bg-white text-gray-500 border-gray-200'
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-400 text-xs">
              <th className="px-6 py-3 font-medium">공연장명</th>
              <th className="px-6 py-3 font-medium">현재 인원</th>
              <th className="px-6 py-3 font-medium">수용인원</th>
              <th className="px-6 py-3 font-medium">혼잡도</th>
              <th className="px-6 py-3 font-medium">자동 산정 상태</th>
              <th className="px-6 py-3 font-medium">관객 노출 상태</th>
              <th className="px-6 py-3 font-medium">수동 적용</th>
              <th className="px-6 py-3 font-medium">최종 갱신</th>
              <th className="px-6 py-3 font-medium">작업</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(z => (
              <tr key={z.id} className="border-t border-gray-50">
                <td className="px-6 py-3.5 font-medium text-gray-800">{z.zones.name}</td>
                <td className="px-6 py-3.5 text-gray-600">{z.current_count.toLocaleString()}명</td>
                <td className="px-6 py-3.5 text-gray-600">{z.zones.max_capacity.toLocaleString()}명</td>
                <td className="px-6 py-3.5 text-gray-600">{z.percent ?? '-'}%</td>
                <td className="px-6 py-3.5 text-gray-600">{z.autoLevel.label}</td>
                <td className="px-6 py-3.5 text-gray-600">{z.level.label}</td>
                <td className="px-6 py-3.5 text-gray-600">{z.manual_status || z.entry_blocked ? '적용 중' : '-'}</td>
                <td className="px-6 py-3.5 text-gray-400">{lastUpdated ? formatTime(lastUpdated) : '-'}</td>
                <td className="px-6 py-3.5">
                  <button onClick={() => setStatusModalZone(z)} className="text-gray-700 underline underline-offset-2 font-medium cursor-pointer hover:text-brand-600">
                    상태 변경
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={9} className="text-center text-gray-400 py-8">조건에 맞는 공연장이 없습니다</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div>
        <p className="font-bold text-gray-800 mb-3">공연장 상세 현황</p>
        <div className="flex flex-col gap-3">
          {filtered.map(z => (
            <div key={z.id} className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold text-gray-900">{z.zones.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">수용인원 {z.zones.max_capacity.toLocaleString()}명</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-700">{z.level.label}</span>
                  {z.percent >= 100 && !z.entry_blocked && (
                    <button
                      onClick={() => setEntryBlockedZone(z)}
                      className="text-xs font-semibold px-2.5 py-1 rounded-full border border-red-200 text-red-600"
                    >
                      입장 불가 확인
                    </button>
                  )}
                  {z.entry_blocked && (
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-red-600 text-white">입장 불가</span>
                  )}
                  <button onClick={() => setStatusModalZone(z)} className="text-xs text-gray-400 underline underline-offset-2 cursor-pointer hover:text-gray-600">
                    상태 변경
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 mt-4 text-sm">
                <div>
                  <p className="text-gray-400 text-xs">현재 인원</p>
                  <p className="font-bold text-gray-900">{z.current_count.toLocaleString()}명</p>
                  <p className="text-xs text-gray-400">수용 대비 {z.percent ?? '-'}%</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">자동 산정 상태</p>
                  <p className="text-gray-700">{z.autoLevel.label}</p>
                  <p className="text-xs text-gray-400">갱신 {lastUpdated ? formatTime(lastUpdated) : '-'}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">관객 노출 상태</p>
                  <p className="text-gray-700">{z.level.label}</p>
                  <p className="text-xs text-gray-400">{z.manual_status || z.entry_blocked ? '수동 적용 중' : '자동 산정 적용 중'}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">수동 변경자</p>
                  <p className="text-gray-700">{z.manual_by ?? '-'}</p>
                  <p className="text-xs text-gray-400">{z.manual_at ? `${formatTime(z.manual_at)} 적용` : '수동 변경 없음'}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {statusModalZone && (
        <StatusChangeModal
          zone={statusModalZone}
          changedBy={user?.email}
          onClose={() => setStatusModalZone(null)}
          onSaved={() => { setStatusModalZone(null); refetch() }}
        />
      )}

      {activeEntryBlockedZone && (
        <EntryBlockedModal
          zone={activeEntryBlockedZone}
          onCancel={() => handleEntryBlockedCancel(activeEntryBlockedZone)}
          onConfirm={reason => handleEntryBlockedConfirm(activeEntryBlockedZone, reason)}
        />
      )}

      {showInfo && <CongestionInfoModal onClose={() => setShowInfo(false)} />}
    </div>
  )
}

function StatusChangeModal({ zone, changedBy, onClose, onSaved }) {
  const [status, setStatus] = useState('')
  const [reason, setReason] = useState('')
  const [confirming, setConfirming] = useState(false)
  const [saving, setSaving] = useState(false)
  const currentLevel = getLevel({ current: zone.current_count, max: zone.zones.max_capacity, entryBlocked: zone.entry_blocked })

  async function handleSave() {
    setSaving(true)
    const entryBlocked = status === 'blocked'
    await supabase.from('congestion').update({
      manual_status: status,
      entry_blocked: entryBlocked,
      manual_reason: reason,
      manual_by: changedBy,
      manual_at: new Date().toISOString(),
    }).eq('id', zone.id)

    await logStatusChange({ zone, previousLabel: currentLevel.label, newLabel: LEVELS[status]?.label ?? status, reason, changedBy })
    setSaving(false)
    onSaved()
  }

  if (confirming) {
    return (
      <Modal title="상태 변경 확인" onClose={() => setConfirming(false)}>
        <p className="text-sm text-gray-600">수동으로 변경한 상태는 자동 산정값보다 우선 적용됩니다. 계속하시겠습니까?</p>
        <div className="flex justify-end gap-2 mt-5">
          <button onClick={() => setConfirming(false)} className="border border-gray-200 rounded-lg px-4 py-2 text-sm font-semibold text-gray-700">취소</button>
          <button onClick={handleSave} disabled={saving} className="bg-brand-500 text-white hover:bg-brand-600 transition-colors cursor-pointer rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-50">
            {saving ? '저장 중...' : '저장'}
          </button>
        </div>
      </Modal>
    )
  }

  return (
    <Modal title="관객 노출 상태 수동 변경" onClose={onClose}>
      <div className="bg-gray-50 rounded-xl p-4 text-sm mb-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-gray-400">시설명</p>
            <p className="font-medium text-gray-800">{zone.zones.name}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">시설 유형</p>
            <p className="font-medium text-gray-800">공연장</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">현재 노출 상태</p>
            <p className="font-medium text-gray-800">{currentLevel.label}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">자동 산정 상태</p>
            <p className="font-medium text-gray-800">
              {getLevel({ current: zone.current_count, max: zone.zones.max_capacity }).label} ({getPercent(zone.current_count, zone.zones.max_capacity)}%)
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 text-sm">
        <div>
          <label className="text-gray-500">변경할 관객 노출 상태</label>
          <select
            value={status}
            onChange={e => setStatus(e.target.value)}
            className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-brand-500"
          >
            <option value="">Select...</option>
            {Object.entries(LEVELS).filter(([k]) => k !== 'unknown').map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
          <p className="text-xs text-gray-400 mt-1">선택한 상태는 자동 산정값보다 우선 적용됩니다. 수동 상태를 해제하려면 자동으로 변경하세요.</p>
        </div>
        <div>
          <label className="text-gray-500">변경 사유</label>
          <textarea
            rows={3}
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="변경 사유를 입력하세요"
            className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-brand-500 resize-none"
          />
          <p className="text-xs text-gray-400 mt-1">변경 사유는 상태 변경 이력에 기록되며 운영자가 확인할 수 있습니다.</p>
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-5">
        <button onClick={onClose} className="border border-gray-200 rounded-lg px-4 py-2 text-sm font-semibold text-gray-700">취소</button>
        <button
          onClick={() => setConfirming(true)}
          disabled={!status || !reason.trim()}
          className="bg-brand-500 text-white hover:bg-brand-600 transition-colors cursor-pointer rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-40"
        >
          저장
        </button>
      </div>
    </Modal>
  )
}

function EntryBlockedModal({ zone, onCancel, onConfirm }) {
  const [reason, setReason] = useState('')
  const [saving, setSaving] = useState(false)
  const percent = getPercent(zone.current_count, zone.zones.max_capacity)

  async function handleConfirm() {
    setSaving(true)
    await onConfirm(reason)
    setSaving(false)
  }

  return (
    <Modal title="입장 불가 처리 확인" onClose={onCancel}>
      <div className="bg-gray-50 rounded-xl p-4 text-sm mb-3">
        <p className="text-xs text-gray-400">공연장</p>
        <p className="font-medium text-gray-800">{zone.zones.name}</p>
        <p className="text-xs text-gray-400 mt-3">현재 혼잡도</p>
        <p className="text-xl font-bold text-gray-900">{percent}%</p>
        <p className="text-xs text-gray-400 mt-1">수용인원 대비 현재 인원이 초과되었습니다.</p>
      </div>
      <div className="bg-gray-50 rounded-xl p-4 text-sm mb-3">
        <p className="text-xs text-gray-400">처리 내용</p>
        <p className="font-medium text-gray-800">입장 불가 상태로 변경</p>
      </div>
      <div>
        <label className="text-sm text-gray-500">변경 사유</label>
        <textarea
          rows={3}
          value={reason}
          onChange={e => setReason(e.target.value)}
          className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-500 resize-none"
        />
      </div>
      <div className="flex justify-end gap-2 mt-5">
        <button onClick={onCancel} className="min-h-11 border border-gray-200 rounded-lg px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors">취소</button>
        <button
          onClick={handleConfirm}
          disabled={saving || !reason.trim()}
          className="min-h-11 bg-red-600 text-white rounded-lg px-4 py-2 text-sm font-semibold hover:bg-red-700 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed transition-colors"
        >
          {saving ? '처리 중...' : '입장 불가 처리'}
        </button>
      </div>
    </Modal>
  )
}

function CongestionInfoModal({ onClose }) {
  return (
    <Modal title="혼잡도 상태 안내" onClose={onClose}>
      <div className="text-sm text-gray-600 flex flex-col gap-2">
        <p>자동 산정 상태는 카메라 분석 데이터를 기반으로 시스템이 산정한 값입니다.</p>
        <p>수동 상태가 적용된 경우 관객 화면에는 수동 상태가 우선 노출됩니다.</p>
        <p>개인 식별 정보나 카메라 영상은 어떤 화면에도 표시되지 않으며, 집계된 혼잡도 수치만 사용됩니다.</p>
      </div>
      <div className="flex justify-end mt-5">
        <button onClick={onClose} className="bg-brand-500 text-white hover:bg-brand-600 transition-colors cursor-pointer rounded-lg px-4 py-2 text-sm font-semibold">확인</button>
      </div>
    </Modal>
  )
}
