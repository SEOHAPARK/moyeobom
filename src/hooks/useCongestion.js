import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useCongestion() {
  const [zones, setZones] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()

    const subscription = supabase
      .channel('congestion-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'congestion' }, fetchData)
      .subscribe()

    return () => subscription.unsubscribe()
  }, [])

  async function fetchData() {
    const { data } = await supabase
      .from('congestion')
      .select('*, zones(name, description, max_capacity)')
      .order('zone_id')

    if (data) setZones(data)
    setLoading(false)
  }

  return { zones, loading }
}
