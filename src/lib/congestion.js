export const LEVELS = {
  relaxed: { label: '여유', dot: 'bg-green-500', text: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200', bar: 'bg-green-500' },
  normal: { label: '보통', dot: 'bg-yellow-500', text: 'text-yellow-700', bg: 'bg-yellow-50', border: 'border-yellow-200', bar: 'bg-yellow-500' },
  crowded: { label: '혼잡', dot: 'bg-orange-500', text: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200', bar: 'bg-orange-500' },
  blocked: { label: '입장 불가', dot: 'bg-red-500', text: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200', bar: 'bg-red-500' },
  unknown: { label: '정보 없음', dot: 'bg-gray-400', text: 'text-gray-500', bg: 'bg-gray-50', border: 'border-gray-200', bar: 'bg-gray-400' },
}

// 혼잡도 비율(%) -> 상태 키. 명세: 0~33 여유, 33~66 보통, 66~100 혼잡, 100+ 입장불가(관리자 확인 필요)
export function ratioToKey(percent) {
  if (percent >= 100) return 'blocked'
  if (percent >= 66) return 'crowded'
  if (percent >= 33) return 'normal'
  return 'relaxed'
}

export function getPercent(current, max) {
  if (!max || max <= 0 || current == null) return null
  return Math.round((current / max) * 100)
}

// 공연장은 "입장 가능/불가", 그 외 편의시설(F&B/이벤트/화장실)은 "이용 가능/불가"로 표현
export function getAvailabilityLabel(level, zoneType) {
  if (zoneType === 'stage') return level.key === 'blocked' ? '입장 불가' : '입장 가능'
  return level.key === 'blocked' ? '이용 불가' : '이용 가능'
}

// entryBlocked: 관리자가 입장불가로 확정한 경우에만 blocked로 표시(명세 4.1.2)
export function getLevel({ current, max, manualStatus, entryBlocked }) {
  if (manualStatus && LEVELS[manualStatus]) return { key: manualStatus, ...LEVELS[manualStatus] }

  const percent = getPercent(current, max)
  if (percent == null) return { key: 'unknown', ...LEVELS.unknown }

  if (percent >= 100 && !entryBlocked) {
    // 100% 이상이지만 관리자 확인 전이면 '혼잡'까지만 노출
    return { key: 'crowded', ...LEVELS.crowded }
  }
  const key = ratioToKey(percent)
  return { key, ...LEVELS[key] }
}
