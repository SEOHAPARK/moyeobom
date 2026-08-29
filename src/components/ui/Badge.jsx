const TONES = {
  neutral: { background: 'var(--moyeobom-ink-100)', color: 'var(--moyeobom-ink-700)' },
  brand: { background: 'var(--moyeobom-brand-100)', color: 'var(--moyeobom-brand-700)' },
  success: { background: 'var(--moyeobom-relaxed-100)', color: 'var(--moyeobom-relaxed-600)' },
  warn: { background: 'var(--moyeobom-moderate-100)', color: 'var(--moyeobom-moderate-600)' },
  danger: { background: 'var(--moyeobom-blocked-100)', color: 'var(--moyeobom-blocked-600)' },
  info: { background: 'var(--moyeobom-info-100)', color: 'var(--moyeobom-info-600)' },
  outline: { background: 'transparent', color: 'var(--moyeobom-ink-700)', border: '1px solid var(--moyeobom-line)' },
}

export function Badge({ tone = 'neutral', icon, children, style, ...rest }) {
  return (
    <span
      {...rest}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '6px',
        borderRadius: 'var(--moyeobom-radius-full)', padding: '4px 10px',
        font: 'var(--moyeobom-text-caption)', fontWeight: 500, letterSpacing: 'var(--moyeobom-tracking-caption)',
        ...TONES[tone], ...style,
      }}
    >
      {icon}{children}
    </span>
  )
}
