import React from 'react'

export function Textarea({ label, hint, error, required, rows = 4, id, style, ...rest }) {
  const [focus, setFocus] = React.useState(false)
  const autoId = React.useId()
  const fid = id || autoId
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--moyeobom-space-2)' }}>
      <label htmlFor={fid} style={{ font: 'var(--moyeobom-text-body-sm)', fontWeight: 500, color: 'var(--moyeobom-ink-700)' }}>
        {label}{required && <span style={{ color: 'var(--moyeobom-blocked-600)', marginLeft: 4 }} aria-hidden="true">*</span>}
      </label>
      <textarea
        {...rest}
        id={fid}
        rows={rows}
        required={required}
        aria-invalid={!!error}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        style={{
          width: '100%', padding: '12px 16px', font: 'var(--moyeobom-text-body)', fontFamily: 'var(--moyeobom-font-base)',
          color: 'var(--moyeobom-ink-900)', background: 'var(--moyeobom-surface)', resize: 'vertical', boxSizing: 'border-box',
          border: '1px solid ' + (error ? 'var(--moyeobom-blocked-600)' : focus ? 'var(--moyeobom-brand-600)' : 'var(--moyeobom-ink-200)'),
          borderRadius: 'var(--moyeobom-radius-md)', outline: 'none',
          boxShadow: focus ? '0 0 0 2px var(--focus-ring)' : 'none', transition: 'var(--transition-state)', ...style,
        }}
      />
      {hint && !error && <p style={{ font: 'var(--moyeobom-text-body-sm)', color: 'var(--moyeobom-ink-500)', margin: 0 }}>{hint}</p>}
      {error && <p style={{ font: 'var(--moyeobom-text-body-sm)', color: 'var(--moyeobom-blocked-600)', margin: 0 }}>{error}</p>}
    </div>
  )
}
