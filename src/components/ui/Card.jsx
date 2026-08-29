import React from 'react'

const PAD = { none: 0, sm: 'var(--moyeobom-space-4)', md: 'var(--moyeobom-space-5)', lg: 'var(--moyeobom-space-8)' }

/** paper 위에 얹는 서피스 컨테이너. 기본은 그림자 없음 — line-soft 보더로 구분하고, hover에만 shadow-xs. */
export function Card({ variant = 'default', padding = 'md', as = 'div', children, style, ...rest }) {
  const [hover, setHover] = React.useState(false)
  const V = {
    default: { background: 'var(--moyeobom-surface)', border: '1px solid var(--moyeobom-line-soft)', boxShadow: hover ? 'var(--moyeobom-shadow-xs)' : 'none' },
    elevated: { background: 'var(--moyeobom-surface)', border: '1px solid var(--moyeobom-line-soft)', boxShadow: hover ? 'var(--moyeobom-shadow-sm)' : 'var(--moyeobom-shadow-xs)' },
    ghost: { background: 'transparent', border: '1px solid var(--moyeobom-line)' },
    filled: { background: 'var(--moyeobom-brand-50)', border: '1px solid var(--moyeobom-brand-100)' },
  }[variant]
  const Comp = as
  return (
    <Comp
      {...rest}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ display: 'block', borderRadius: 'var(--moyeobom-radius-lg)', padding: PAD[padding], transition: 'var(--transition-overlay)', ...V, ...style }}
    >
      {children}
    </Comp>
  )
}

export function CardHeader({ children, style, ...rest }) { return <div {...rest} style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: 'var(--moyeobom-space-4)', ...style }}>{children}</div> }
export function CardTitle({ children, style, ...rest }) { return <h3 {...rest} style={{ font: 'var(--moyeobom-text-h3)', color: 'var(--moyeobom-ink-900)', margin: 0, ...style }}>{children}</h3> }
export function CardDescription({ children, style, ...rest }) { return <p {...rest} style={{ font: 'var(--moyeobom-text-body-sm)', color: 'var(--moyeobom-ink-600)', margin: 0, ...style }}>{children}</p> }
export function CardContent({ children, style, ...rest }) { return <div {...rest} style={{ font: 'var(--moyeobom-text-body)', color: 'var(--moyeobom-ink-700)', ...style }}>{children}</div> }
export function CardFooter({ children, style, ...rest }) { return <div {...rest} style={{ display: 'flex', alignItems: 'center', gap: 'var(--moyeobom-space-3)', marginTop: 'var(--moyeobom-space-6)', paddingTop: 'var(--moyeobom-space-4)', borderTop: '1px solid var(--moyeobom-line-soft)', ...style }}>{children}</div> }
