export default function Modal({ title, onClose, children, width = 'max-w-md' }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className={`bg-white rounded-2xl w-full ${width} p-6`}>
        <div className="flex items-start justify-between mb-4">
          <h2 className="font-bold text-gray-900">{title}</h2>
          {onClose && (
            <button onClick={onClose} className="text-gray-400 hover:text-gray-700 leading-none">✕</button>
          )}
        </div>
        {children}
      </div>
    </div>
  )
}
