import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCongestion } from '../../hooks/useCongestion'
import { getLevel, getPercent } from '../../lib/congestion'
import { formatTime } from '../../lib/format'
import Modal from '../../components/admin/Modal'
import { supabase } from '../../lib/supabase'

const OPERATING_OPTIONS = ['운영 중', '운영 종료', '점검 중']

export default function AdminZonesPage() {
  const { zones, lastUpdated, refetch } = useCongestion()
  const [query, setQuery] = useState('')
  const [operatingFilter, setOperatingFilter] = useState('')
  const [levelFilter, setLevelFilter] = useState('')
  const [showCreate, setShowCreate] = useState(false)

  const stageZones = zones.filter(z => z.zones.type === 'stage')

  const filtered = stageZones.filter(z => {
    if (query && !z.zones.name.includes(query)) return false
    if (operatingFilter && (z.zones.operating_status ?? '운영 중') !== operatingFilter) return false
    if (levelFilter) {
      const level = getLevel({ current: z.current_count, max: z.zones.max_capacity, entryBlocked: z.entry_blocked })
      if (level.key !== levelFilter) return false
    }
    return true
  })

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-900">공연장 관리</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="text-sm font-semibold bg-gray-900 text-white px-4 py-2 rounded-lg"
        >
          공연장 등록
        </button>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div>
          <p className="text-xs text-gray-400 mb-1">검색</p>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="공연장 검색"
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400 w-48"
          />
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-1">운영 상태</p>
          <select
            value={operatingFilter}
            onChange={e => setOperatingFilter(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400"
          >
            <option value="">전체</option>
            {OPERATING_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-1">혼잡도</p>
          <select
            value={levelFilter}
            onChange={e => setLevelFilter(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400"
          >
            <option value="">전체</option>
            <option value="relaxed">여유</option>
            <option value="normal">보통</option>
            <option value="crowded">혼잡</option>
            <option value="blocked">입장 불가</option>
          </select>
        </div>
        <button
          onClick={() => { setQuery(''); setOperatingFilter(''); setLevelFilter('') }}
          className="border border-gray-200 rounded-lg px-4 py-2 text-sm font-semibold text-gray-700"
        >
          필터 초기화
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-400 text-xs">
              <th className="px-6 py-3 font-medium">공연장명</th>
              <th className="px-6 py-3 font-medium">수용인원</th>
              <th className="px-6 py-3 font-medium">현재 인원</th>
              <th className="px-6 py-3 font-medium">혼잡도</th>
              <th className="px-6 py-3 font-medium">운영 상태</th>
              <th className="px-6 py-3 font-medium">최종 갱신</th>
              <th className="px-6 py-3 font-medium">관리</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(z => {
              const percent = getPercent(z.current_count, z.zones.max_capacity)
              return (
                <tr key={z.id} className="border-t border-gray-50">
                  <td className="px-6 py-3.5 font-medium text-gray-800">{z.zones.name}</td>
                  <td className="px-6 py-3.5 text-gray-600">{z.zones.max_capacity.toLocaleString()}명</td>
                  <td className="px-6 py-3.5 text-gray-600">{z.current_count.toLocaleString()}명</td>
                  <td className="px-6 py-3.5 text-gray-600">{percent ?? '-'}%</td>
                  <td className="px-6 py-3.5 text-gray-600">{z.zones.operating_status ?? '운영 중'}</td>
                  <td className="px-6 py-3.5 text-gray-400">{lastUpdated ? formatTime(lastUpdated) : '-'}</td>
                  <td className="px-6 py-3.5">
                    <Link to={`/admin/zones/${z.zone_id}/capacity`} className="text-gray-700 underline underline-offset-2 font-medium">
                      수용인원 입력
                    </Link>
                  </td>
                </tr>
              )
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center text-gray-400 py-8">조건에 맞는 공연장이 없습니다</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showCreate && (
        <CreateZoneModal onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); refetch() }} />
      )}
    </div>
  )
}

function CreateZoneModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ name: '', description: '', max_capacity: '', lat: '', lng: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name || !form.max_capacity) return
    setSaving(true)
    setError('')

    const { data: zone, error: zoneError } = await supabase
      .from('zones')
      .insert({
        name: form.name,
        description: form.description || null,
        max_capacity: Number(form.max_capacity),
        lat: form.lat ? Number(form.lat) : null,
        lng: form.lng ? Number(form.lng) : null,
        type: 'stage',
      })
      .select()
      .single()

    if (zoneError) {
      setError('공연장 등록에 실패했습니다')
      setSaving(false)
      return
    }

    await supabase.from('congestion').insert({ zone_id: zone.id, current_count: 0 })
    setSaving(false)
    onCreated()
  }

  return (
    <Modal title="공연장 등록" onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 text-sm">
        <div>
          <label className="text-gray-500">공연장명</label>
          <input
            required
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-gray-400"
          />
        </div>
        <div>
          <label className="text-gray-500">설명</label>
          <input
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-gray-400"
          />
        </div>
        <div>
          <label className="text-gray-500">수용인원 (명)</label>
          <input
            required
            type="number"
            min="1"
            value={form.max_capacity}
            onChange={e => setForm(f => ({ ...f, max_capacity: e.target.value }))}
            className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-gray-400"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-gray-500">위도</label>
            <input
              type="number"
              step="any"
              value={form.lat}
              onChange={e => setForm(f => ({ ...f, lat: e.target.value }))}
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-gray-400"
            />
          </div>
          <div>
            <label className="text-gray-500">경도</label>
            <input
              type="number"
              step="any"
              value={form.lng}
              onChange={e => setForm(f => ({ ...f, lng: e.target.value }))}
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-gray-400"
            />
          </div>
        </div>

        {error && <p className="text-red-500">{error}</p>}

        <div className="flex justify-end gap-2 mt-2">
          <button type="button" onClick={onClose} className="border border-gray-200 rounded-lg px-4 py-2 font-semibold text-gray-700">취소</button>
          <button type="submit" disabled={saving} className="bg-gray-900 text-white rounded-lg px-4 py-2 font-semibold disabled:opacity-50">
            {saving ? '등록 중...' : '등록'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
