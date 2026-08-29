import { Card } from './ui/Card'

export default function SectionCard({ title, right, children, className = '' }) {
  return (
    <Card variant="default" padding="none" className={`overflow-hidden ${className}`}>
      {title && (
        <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--moyeobom-line-soft)' }}>
          <h3 className="text-base font-bold text-gray-800">{title}</h3>
          {right}
        </div>
      )}
      {children}
    </Card>
  )
}
