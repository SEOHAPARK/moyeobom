function getLevel(current, max) {
  const ratio = current / max
  if (ratio < 0.4) return { label: '여유', color: 'bg-green-100 text-green-700 border-green-200', bar: 'bg-green-400' }
  if (ratio < 0.7) return { label: '보통', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', bar: 'bg-yellow-400' }
  if (ratio < 0.9) return { label: '혼잡', color: 'bg-orange-100 text-orange-700 border-orange-200', bar: 'bg-orange-400' }
  return { label: '매우혼잡', color: 'bg-red-100 text-red-700 border-red-200', bar: 'bg-red-400' }
}

export default function ZoneCard({ zone }) {
  const { current_count, zones: info } = zone
  const level = getLevel(current_count, info.max_capacity)
  const percent = Math.min(Math.round((current_count / info.max_capacity) * 100), 100)

  return (
    <div className={`rounded-2xl border-2 p-5 ${level.color}`}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <h2 className="text-lg font-bold">{info.name}</h2>
          <p className="text-sm opacity-70">{info.description}</p>
        </div>
        <span className="text-sm font-bold px-3 py-1 rounded-full bg-white bg-opacity-60">
          {level.label}
        </span>
      </div>
      <div className="w-full bg-white bg-opacity-50 rounded-full h-3 mb-2">
        <div className={`h-3 rounded-full ${level.bar} transition-all duration-500`} style={{ width: `${percent}%` }} />
      </div>
      <p className="text-sm text-right opacity-70">{current_count} / {info.max_capacity}명 ({percent}%)</p>
    </div>
  )
}
