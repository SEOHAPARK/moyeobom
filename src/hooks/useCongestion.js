import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const CACHE_KEY = 'moyeobom:zones-cache'

function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function writeCache(zones) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ zones, savedAt: new Date().toISOString() }))
  } catch {
    // 저장 공간 부족 등은 무시하고 계속 진행
  }
}

export function useCongestion() {
  const cached = readCache()
  const [zones, setZones] = useState(cached?.zones ?? [])
  const [loading, setLoading] = useState(!cached)
  const [lastUpdated, setLastUpdated] = useState(cached ? new Date(cached.savedAt) : null)
  const [online, setOnline] = useState(navigator.onLine)
  const [fetchFailed, setFetchFailed] = useState(false)

  useEffect(() => {
    fetchData()

    const subscription = supabase
      .channel('congestion-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'congestion' }, fetchData)
      .subscribe()

    const handleOnline = () => { setOnline(true); fetchData() }
    const handleOffline = () => setOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      subscription.unsubscribe()
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  async function fetchData() {
    try {
      const { data, error } = await supabase
        .from('congestion')
        .select('*, zones(name, description, max_capacity, lat, lng, type)')
        .order('zone_id')

      if (error) throw error
      if (data) {
        setZones(data)
        setLastUpdated(new Date())
        setFetchFailed(false)
        writeCache(data)
      }
    } catch {
      setFetchFailed(true)
    } finally {
      setLoading(false)
    }
  }

  return { zones, loading, lastUpdated, online: online && !fetchFailed, refetch: fetchData }
}
