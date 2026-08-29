export const CONGESTION = {
  relaxed: { label: '여유', bg: 'var(--moyeobom-relaxed-100)', fg: 'var(--moyeobom-relaxed-600)', range: '0–33%' },
  moderate: { label: '보통', bg: 'var(--moyeobom-moderate-100)', fg: 'var(--moyeobom-moderate-600)', range: '33–66%' },
  congested: { label: '혼잡', bg: 'var(--moyeobom-congested-100)', fg: 'var(--moyeobom-congested-600)', range: '66–100%' },
  blocked: { label: '입장불가', bg: 'var(--moyeobom-blocked-100)', fg: 'var(--moyeobom-blocked-600)', range: '100%+' },
  unknown: { label: '정보 없음', bg: 'var(--moyeobom-ink-100)', fg: 'var(--moyeobom-ink-600)', range: '' },
}

export const LEVELS = CONGESTION

// 혼잡도 비율(%) -> 상태 키. 명세: 0~33 여유, 33~66 보통, 66~100 혼잡, 100+ 입장불가(관리자 확인 필요)
export function ratioToKey(percent) {
  if (percent >= 100) return 'blocked'
  if (percent >= 66) return 'congested'
  if (percent >= 33) return 'moderate'
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
  if (manualStatus && CONGESTION[manualStatus]) return { key: manualStatus, ...CONGESTION[manualStatus] }

  const percent = getPercent(current, max)
  if (percent == null) return { key: 'unknown', ...CONGESTION.unknown }

  if (percent >= 100 && !entryBlocked) {
    // 100% 이상이지만 관리자 확인 전이면 '혼잡'까지만 노출
    return { key: 'congested', ...CONGESTION.congested }
  }
  const key = ratioToKey(percent)
  return { key, ...CONGESTION[key] }
}
