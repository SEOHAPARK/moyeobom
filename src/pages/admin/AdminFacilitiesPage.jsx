import { useEffect, useState } from 'react'
import { useCongestion } from '../../hooks/useCongestion'
import { supabase } from '../../lib/supabase'
import Modal from '../../components/admin/Modal'
import { formatTime } from '../../lib/format'

const TYPE_LABEL = { food: 'F&B', event: '이벤트', restroom: '화장실' }
const TYPE_OPTIONS = Object.entries(TYPE_LABEL)

export default function AdminFacilitiesPage() {
  const { zones, lastUpdated, refetch } = useCongestion()
  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [exposureFilter, setExposureFilter] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [contentCounts, setContentCounts] = useState({})

  const facilities = zones.filter(z => z.zones.type !== 'stage')

  useEffect(() => {
    async function loadCounts() {
      const [{ data: booths }, { data: events }] = await Promise.all([
        supabase.from('booths').select('zone_id'),
        supabase.from('zone_events').select('zone_id'),
      ])
      const counts = {}
      ;(booths ?? []).forEach(b => { counts[b.zone_id] = (counts[b.zone_id] ?? 0) + 1 })
      ;(events ?? []).forEach(e => { counts[e.zone_id] = (counts[e.zone_id] ?? 0) + 1 })
      setContentCounts(counts)
    }
    loadCounts()
  }, [zones.length])

  const filtered = facilities.filter(z => {
    if (query && !z.zones.name.includes(query)) return false
    if (typeFilter && z.zones.type !== typeFilter) return false
    if (exposureFilter && (z.zones.active === false ? '미노출' : '노출') !== exposureFilter) return false
    return true
  })

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-900">편의시설 관리</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="text-sm font-semibold bg-brand-600 text-white hover:bg-brand-700 transition-colors cursor-pointer px-4 py-2 rounded-lg"
        >
          새 시설 등록
        </button>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div>
          <p className="text-xs text-gray-400 mb-1">검색</p>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="시설명 검색"
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-600 w-48"
          />
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-1">시설 유형</p>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-600">
            <option value="">전체</option>
            {TYPE_OPTIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-1">노출 상태</p>
          <select value={exposureFilter} onChange={e => setExposureFilter(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-600">
            <option value="">전체</option>
            <option value="노출">노출</option>
            <option value="미노출">미노출</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-3 flex justify-end text-xs text-gray-400 border-b border-gray-50">
          최종 갱신 {lastUpdated ? formatTime(lastUpdated) : '-'}
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-400 text-xs">
              <th className="px-6 py-3 font-medium">시설명</th>
              <th className="px-6 py-3 font-medium">유형</th>
              <th className="px-6 py-3 font-medium">위치</th>
              <th className="px-6 py-3 font-medium">운영 시간</th>
              <th className="px-6 py-3 font-medium">메뉴·행사 정보</th>
              <th className="px-6 py-3 font-medium">노출 상태</th>
              <th className="px-6 py-3 font-medium">관리</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(z => (
              <tr key={z.id} className="border-t border-gray-50">
                <td className="px-6 py-3.5 font-medium text-gray-800">{z.zones.name}</td>
                <td className="px-6 py-3.5 text-gray-600">{TYPE_LABEL[z.zones.type] ?? z.zones.type}</td>
                <td className="px-6 py-3.5 text-gray-600">{z.zones.location_desc ?? z.zones.description ?? '-'}</td>
                <td className="px-6 py-3.5 text-gray-600">{z.zones.operating_hours ?? '-'}</td>
                <td className="px-6 py-3.5 text-gray-600">{contentCounts[z.zone_id] ?? 0}건</td>
                <td className="px-6 py-3.5 text-gray-600">{z.zones.active === false ? '미노출' : '노출'}</td>
                <td className="px-6 py-3.5">
                  <a href={`/zone/${z.zone_id}`} target="_blank" rel="noreferrer" className="text-gray-700 underline underline-offset-2 font-medium">
                    관객 화면 보기
                  </a>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center text-gray-400 py-8">조건에 맞는 시설이 없습니다</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="text-sm text-gray-400 underline underline-offset-2 self-end">시설 유형 기준 정보 수정</p>

      {showCreate && (
        <CreateFacilityModal onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); refetch() }} />
      )}
    </div>
  )
}

function CreateFacilityModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ name: '', type: 'food', location_desc: '', operating_hours: '', detail: '', active: true })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name || !form.type) return
    setSaving(true)
    setError('')

    const { data: zone, error: zoneError } = await supabase
      .from('zones')
      .insert({
        name: form.name,
        type: form.type,
        location_desc: form.location_desc || null,
        operating_hours: form.operating_hours || null,
        description: form.detail || null,
        max_capacity: 100,
        active: form.active,
      })
      .select()
      .single()

    if (zoneError) {
      setError('시설 등록에 실패했습니다')
      setSaving(false)
      return
    }

    await supabase.from('congestion').insert({ zone_id: zone.id, current_count: 0 })
    setSaving(false)
    onCreated()
  }

  return (
    <Modal title="새 편의시설 등록" onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 text-sm">
        <div>
          <label className="text-gray-500">시설명</label>
          <input
            required
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-brand-600"
          />
        </div>
        <div>
          <label className="text-gray-500">시설 유형</label>
          <select
            value={form.type}
            onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
            className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-brand-600"
          >
            {TYPE_OPTIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <div>
          <label className="text-gray-500">위치 설명</label>
          <input
            value={form.location_desc}
            onChange={e => setForm(f => ({ ...f, location_desc: e.target.value }))}
            className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-brand-600"
          />
        </div>
        <div>
          <label className="text-gray-500">운영 시간</label>
          <input
            placeholder="예: 11:00 - 22:00"
            value={form.operating_hours}
            onChange={e => setForm(f => ({ ...f, operating_hours: e.target.value }))}
            className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-brand-600"
          />
        </div>
        <div>
          <label className="text-gray-500">상세 정보 (메뉴·가격·행사 내용)</label>
          <textarea
            rows={3}
            value={form.detail}
            onChange={e => setForm(f => ({ ...f, detail: e.target.value }))}
            className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-brand-600 resize-none"
          />
        </div>
        <div>
          <label className="text-gray-500">관객 노출 상태</label>
          <select
            value={form.active ? 'true' : 'false'}
            onChange={e => setForm(f => ({ ...f, active: e.target.value === 'true' }))}
            className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-brand-600"
          >
            <option value="true">노출</option>
            <option value="false">미노출</option>
          </select>
        </div>

        {error && <p className="text-blocked-600">{error}</p>}

        <div className="flex justify-end gap-2 mt-2">
          <button type="button" onClick={onClose} className="border border-gray-200 rounded-lg px-4 py-2 font-semibold text-gray-700">취소</button>
          <button type="submit" disabled={saving} className="bg-brand-600 text-white hover:bg-brand-700 transition-colors cursor-pointer rounded-lg px-4 py-2 font-semibold disabled:opacity-50">
            {saving ? '등록 중...' : '등록'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
