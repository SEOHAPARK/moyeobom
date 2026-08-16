export default function SectionCard({ title, right, children, className = '' }) {
  return (
    <div className={`bg-white rounded-2xl border border-gray-100 overflow-hidden ${className}`}>
      {title && (
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-base font-bold text-gray-800">{title}</h3>
          {right}
        </div>
      )}
      {children}
    </div>
  )
}
