import React from 'react'

const FONTS = { sm: 'var(--moyeobom-text-body-sm)', md: 'var(--moyeobom-text-body)', lg: 'var(--moyeobom-text-body)' }
const PAD = { sm: '8px 16px', md: '12px 24px', lg: '14px 32px' }

/** 모여봄 버튼. 마케팅 CTA는 rounded="full"(기본), 제품 UI 컨트롤은 rounded="md". */
export function Button({ variant = 'primary', size = 'md', rounded = 'full', disabled = false, as = 'button', icon, children, style, ...rest }) {
  const [hover, setHover] = React.useState(false)
  const [press, setPress] = React.useState(false)
  const base = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--moyeobom-space-2)',
    font: FONTS[size], fontWeight: 500, fontFamily: 'var(--moyeobom-font-base)', padding: PAD[size],
    borderRadius: rounded === 'full' ? 'var(--moyeobom-radius-full)' : 'var(--moyeobom-radius-md)',
    border: '1px solid transparent', cursor: disabled ? 'not-allowed' : 'pointer', userSelect: 'none', textDecoration: 'none',
    minHeight: '44px', boxSizing: 'border-box',
    transition: 'var(--transition-hover)', transform: press && variant !== 'link' ? 'scale(0.98)' : 'none',
    opacity: disabled ? 0.5 : 1, pointerEvents: disabled ? 'none' : 'auto',
  }
  const V = {
    primary: { background: hover ? 'var(--moyeobom-brand-700)' : 'var(--moyeobom-brand-600)', color: 'var(--moyeobom-paper)' },
    secondary: { background: 'var(--moyeobom-surface)', color: 'var(--moyeobom-ink-900)', borderColor: hover ? 'var(--moyeobom-ink-300)' : 'var(--moyeobom-line)' },
    ghost: { background: hover ? 'var(--moyeobom-ink-100)' : 'transparent', color: 'var(--moyeobom-ink-900)' },
    link: { background: 'transparent', color: hover ? 'var(--moyeobom-brand-700)' : 'var(--moyeobom-brand-600)', padding: 0, minHeight: 0, textDecoration: 'underline', textDecorationThickness: '1px', textUnderlineOffset: '4px' },
    danger: { background: 'var(--moyeobom-blocked-600)', color: 'var(--moyeobom-paper)', filter: hover ? 'brightness(0.95)' : 'none' },
  }[variant]
  const Comp = as
  return (
    <Comp
      {...rest}
      disabled={Comp === 'button' ? disabled : undefined}
      aria-disabled={disabled || undefined}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setPress(false) }}
      onMouseDown={() => setPress(true)}
      onMouseUp={() => setPress(false)}
      style={{ ...base, ...V, ...style }}
    >
      {icon}{children}
    </Comp>
  )
}
