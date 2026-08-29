import React from 'react'

const fieldStyle = (err, focus) => ({
  width: '100%', padding: '12px 16px', font: 'var(--moyeobom-text-body)',
  fontFamily: 'var(--moyeobom-font-base)', color: 'var(--moyeobom-ink-900)', background: 'var(--moyeobom-surface)',
  border: '1px solid ' + (err ? 'var(--moyeobom-blocked-600)' : focus ? 'var(--moyeobom-brand-600)' : 'var(--moyeobom-ink-200)'),
  borderRadius: 'var(--moyeobom-radius-md)', outline: 'none', boxSizing: 'border-box',
  boxShadow: focus ? '0 0 0 2px ' + (err ? 'rgba(220,38,38,.4)' : 'var(--focus-ring)') : 'none',
  transition: 'var(--transition-state)',
})

const labelStyle = { font: 'var(--moyeobom-text-body-sm)', fontWeight: 500, color: 'var(--moyeobom-ink-700)' }

function AlertIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" /></svg>
}

export function Input({ label, hint, error, required, id, style, ...rest }) {
  const [focus, setFocus] = React.useState(false)
  const autoId = React.useId()
  const fid = id || autoId
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--moyeobom-space-2)' }}>
      <label htmlFor={fid} style={labelStyle}>{label}{required && <span style={{ color: 'var(--moyeobom-blocked-600)', marginLeft: 4 }} aria-hidden="true">*</span>}</label>
      <input
        {...rest}
        id={fid}
        required={required}
        aria-invalid={!!error}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        style={{ ...fieldStyle(!!error, focus), ...style }}
      />
      {hint && !error && <p style={{ font: 'var(--moyeobom-text-body-sm)', color: 'var(--moyeobom-ink-500)', margin: 0 }}>{hint}</p>}
      {error && <p style={{ display: 'flex', alignItems: 'center', gap: 6, font: 'var(--moyeobom-text-body-sm)', color: 'var(--moyeobom-blocked-600)', margin: 0 }}><AlertIcon />{error}</p>}
    </div>
  )
}
