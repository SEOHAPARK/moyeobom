import { XMarkIcon } from '@heroicons/react/24/outline'

export default function Modal({ title, onClose, children, width = 'max-w-md' }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className={`bg-white rounded-2xl w-full ${width} p-6`}>
        <div className="flex items-start justify-between mb-4">
          <h2 className="font-bold text-gray-900">{title}</h2>
          {onClose && (
            <button
              onClick={onClose}
              aria-label="닫기"
              className="-mr-2 -mt-2 w-11 h-11 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-50 hover:text-gray-700 cursor-pointer transition-colors"
            >
              <XMarkIcon className="w-5 h-5" aria-hidden="true" />
            </button>
          )}
        </div>
        {children}
      </div>
    </div>
  )
}
