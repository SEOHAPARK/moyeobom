export default function Logo({ size = 28, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
      <rect x="2" y="2" width="9" height="9" rx="2" fill="#ff3162" />
      <rect x="13" y="2" width="9" height="9" rx="2" fill="#ff3162" />
      <rect x="2" y="13" width="9" height="9" rx="2" fill="#ff3162" />
      <rect x="13" y="13" width="9" height="9" rx="2" fill="#ff3162" />
    </svg>
  )
}
