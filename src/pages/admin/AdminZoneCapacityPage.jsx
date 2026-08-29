import { useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useCongestion } from '../../hooks/useCongestion'
import { supabase } from '../../lib/supabase'
import { formatTime } from '../../lib/format'

export default function AdminZoneCapacityPage() {
  const { zoneId } = useParams()
  const navigate = useNavigate()
  const { zones, refetch } = useCongestion()
  const [value, setValue] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const zone = zones.find(z => String(z.zone_id) === String(zoneId))

  if (!zone) {
    return <p className="text-gray-400 text-sm">공연장을 찾을 수 없습니다.</p>
  }

  const capacity = value !== '' ? value : ''

  async function handleSave(e) {
    e.preventDefault()
    const n = Number(capacity)
    if (!Number.isInteger(n) || n < 1) {
      setError('수용인원은 1 이상의 정수로 입력해주세요.')
      return
    }
    setSaving(true)
    setError('')
    const { error: updateError } = await supabase.from('zones').update({ max_capacity: n }).eq('id', zone.zone_id)
    setSaving(false)
    if (updateError) {
      setError('저장에 실패했습니다. 다시 시도해주세요.')
      return
    }
    refetch()
    navigate('/admin/congestion')
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <h1 className="text-lg font-bold text-gray-900">수용인원 설정</h1>

      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="font-bold text-gray-800 mb-4">공연장 정보</h2>
        <div>
          <p className="text-xs text-gray-400">공연장 선택</p>
          <p className="mt-1 font-medium text-gray-800">{zone.zones.name}</p>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div>
            <p className="text-xs text-gray-400">공연장 유형</p>
            <p className="mt-1 text-gray-700">공연장</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">현재 등록 수용인원</p>
            <p className="mt-1 text-gray-700">{zone.zones.max_capacity.toLocaleString()}명</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">최종 수정일</p>
            <p className="mt-1 text-gray-700">{formatTime(new Date())}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="font-bold text-gray-800 mb-4">수용인원 입력</h2>
        <label className="text-sm text-gray-500">기준 수용인원 (명)</label>
        <input
          type="number"
          min="1"
          value={capacity}
          onChange={e => setValue(e.target.value)}
          placeholder={String(zone.zones.max_capacity)}
          className="mt-1 w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-600"
        />
        <p className="text-xs text-gray-400 mt-2">수용인원은 1 이상의 정수로 입력하세요. 저장 후 혼잡도 산정에 즉시 반영됩니다.</p>
        <p className="text-xs text-gray-400">* 필수 입력 항목입니다.</p>

        {error && <p className="text-sm text-blocked-600 mt-2">{error}</p>}

        <div className="flex justify-end gap-2 mt-4">
          <Link to="/admin/congestion" className="border border-gray-200 rounded-lg px-4 py-2 text-sm font-semibold text-gray-700 no-underline">
            공연장 혼잡도 현황으로
          </Link>
          <button type="submit" disabled={saving} className="bg-brand-600 text-white hover:bg-brand-700 transition-colors cursor-pointer rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-50">
            {saving ? '저장 중...' : '저장'}
          </button>
        </div>
      </form>

      <Link to="/admin/zones" className="text-sm text-gray-400 underline underline-offset-2">공연장 목록으로 돌아가기</Link>
    </div>
  )
}
