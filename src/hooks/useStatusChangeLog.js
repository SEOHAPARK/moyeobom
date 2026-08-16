import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function useStatusChangeLog(limit = 20) {
  const [entries, setEntries] = useState([])
  const [available, setAvailable] = useState(true)

  useEffect(() => {
    load()

    const subscription = supabase
      .channel('status-change-log-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'status_change_log' }, load)
      .subscribe()

    return () => subscription.unsubscribe()

    async function load() {
      const { data, error } = await supabase
        .from('status_change_log')
        .select('*')
        .order('changed_at', { ascending: false })
        .limit(limit)

      if (error) {
        setAvailable(false)
        return
      }
      setAvailable(true)
      setEntries(data ?? [])
    }
  }, [limit])

  return { entries, available }
}
