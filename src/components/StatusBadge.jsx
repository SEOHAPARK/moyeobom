export default function StatusBadge({ level, size = 'md' }) {
  const pad = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full bg-gray-100 font-semibold text-gray-700 ${pad}`}>
      <span className={`w-2 h-2 rounded-full ${level.dot}`} />
      {level.label}
    </span>
  )
}
