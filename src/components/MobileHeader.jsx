import { useNavigate } from 'react-router-dom'

export default function MobileHeader({ title, titlePill, showBack = true, right = null }) {
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-gray-100">
      <div className="max-w-xl mx-auto px-4 py-3 flex items-center gap-3">
        {showBack ? (
          <button
            onClick={() => navigate(-1)}
            aria-label="뒤로가기"
            className="text-gray-400 hover:text-gray-700 text-xl leading-none w-6"
          >
            &lt;
          </button>
        ) : (
          <span className="w-6" />
        )}
        <div className="flex-1 flex justify-center">
          {titlePill ? (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-50 text-sm font-bold text-gray-900 truncate`}>
              <span className={`w-2 h-2 rounded-full ${titlePill.dot}`} />
              {titlePill.label}
            </span>
          ) : (
            <h1 className="text-base font-bold text-gray-900 truncate">{title}</h1>
          )}
        </div>
        <div className="w-6 flex justify-end">{right}</div>
      </div>
    </header>
  )
}
