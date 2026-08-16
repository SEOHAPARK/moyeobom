export function formatTime(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date)
  const hours = d.getHours()
  const period = hours < 12 ? '오전' : '오후'
  const h12 = hours % 12 === 0 ? 12 : hours % 12
  const m = String(d.getMinutes()).padStart(2, '0')
  return `${period} ${h12}:${m}`
}

export function formatClock(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export function isNowPlaying(start, end) {
  const now = formatClock(new Date())
  return now >= start && now <= end
}
