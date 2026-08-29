export default function CongestionBar({ percent, level }) {
  if (percent == null) {
    return <div className="w-full bg-gray-100 rounded-full h-2 my-3" />
  }
  const clamped = Math.min(Math.max(percent, 0), 100)

  return (
    <div className="relative pt-5 pb-3">
      <span className="absolute top-0 left-0 text-xs text-gray-400">0%</span>
      <span className="absolute top-0 right-0 text-xs text-gray-400">100%</span>
      <span
        className="absolute top-0 -translate-x-1/2 text-xs font-bold text-gray-900 whitespace-nowrap"
        style={{ left: `${clamped}%` }}
      >
        {clamped}%
      </span>
      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
        <div
          className="h-2 rounded-full transition-all duration-500"
          style={{ width: `${clamped}%`, background: level.fg }}
        />
      </div>
      <span
        className="absolute bottom-0 -translate-x-1/2 text-gray-900 leading-none text-[8px]"
        style={{ left: `${clamped}%` }}
      >
        ▲
      </span>
    </div>
  )
}
