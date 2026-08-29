import { CONGESTION } from '../../lib/congestion'

/** 혼잡도 4단계 상태 배지. 색상만으로 정보를 전달하지 않도록 항상 텍스트 라벨을 함께 렌더한다. 브랜드 컬러는 절대 쓰지 않는다. */
export function CongestionBadge({ state = 'relaxed', percent, size = 'md', solid = false, style, ...rest }) {
  const s = CONGESTION[state] || CONGESTION.unknown
  return (
    <span
      {...rest}
      title={s.range || undefined}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '6px',
        borderRadius: 'var(--moyeobom-radius-full)',
        padding: size === 'sm' ? '3px 8px' : '4px 10px',
        font: size === 'sm' ? 'var(--moyeobom-text-caption)' : 'var(--moyeobom-text-body-sm)',
        fontWeight: size === 'sm' ? 600 : 700,
        background: solid ? s.fg : s.bg, color: solid ? 'var(--moyeobom-paper)' : s.fg,
        transition: 'background var(--moyeobom-duration-sm) var(--moyeobom-ease-in-out),color var(--moyeobom-duration-sm) var(--moyeobom-ease-in-out)',
        ...style,
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: '999px', background: 'currentColor', flex: 'none' }} aria-hidden="true" />
      {s.label}{typeof percent === 'number' && <span style={{ fontWeight: 500, opacity: 0.85 }}>{percent}%</span>}
    </span>
  )
}
