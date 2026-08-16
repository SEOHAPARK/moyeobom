import { useNavigate } from 'react-router-dom'

export default function MobileHeader({ title, showBack = true, right = null }) {
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
        <h1 className="flex-1 text-center text-base font-bold text-gray-900 truncate">{title}</h1>
        <div className="w-6 flex justify-end">{right}</div>
      </div>
    </header>
  )
}
