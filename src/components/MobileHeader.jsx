import { useNavigate } from 'react-router-dom'
import { ChevronLeftIcon } from '@heroicons/react/24/outline'

export default function MobileHeader({ title, titlePill, showBack = true, right = null }) {
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-gray-100">
      <div className="max-w-xl mx-auto px-2 py-1.5 flex items-center gap-1">
        {showBack ? (
          <button
            onClick={() => navigate(-1)}
            aria-label="뒤로가기"
            className="shrink-0 w-11 h-11 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-50 hover:text-gray-800 cursor-pointer transition-colors"
          >
            <ChevronLeftIcon className="w-5 h-5" aria-hidden="true" />
          </button>
        ) : (
          <span className="w-11 shrink-0" />
        )}
        <div className="flex-1 flex justify-center min-w-0">
          {titlePill ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-50 text-sm font-bold text-gray-900 truncate font-heading">
              <span className={`w-2 h-2 rounded-full ${titlePill.dot}`} aria-hidden="true" />
              {titlePill.label}
            </span>
          ) : (
            <h1 className="text-base font-bold text-gray-900 truncate font-heading">{title}</h1>
          )}
        </div>
        <div className="w-11 shrink-0 flex justify-end">{right}</div>
      </div>
    </header>
  )
}
