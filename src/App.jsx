import './index.css'
import ZoneCard from './components/ZoneCard'
import { useCongestion } from './hooks/useCongestion'

function App() {
  const { zones, loading } = useCongestion()

  return (
    <div className="min-h-screen bg-green-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-xl mx-auto px-4 py-4 flex items-center gap-2">
          <span className="text-2xl">🌿</span>
          <div>
            <h1 className="text-xl font-bold text-green-700 leading-tight">모여봄</h1>
            <p className="text-xs text-gray-400">페스티벌 실시간 혼잡도</p>
          </div>
          <span className="ml-auto flex items-center gap-1 text-xs text-green-500">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse inline-block" />
            실시간
          </span>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 py-6">
        {loading ? (
          <p className="text-center text-gray-400 mt-20">불러오는 중...</p>
        ) : (
          <div className="flex flex-col gap-4">
            {zones.map(zone => (
              <ZoneCard key={zone.id} zone={zone} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default App
