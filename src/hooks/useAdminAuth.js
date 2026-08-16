import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function useAdminAuth() {
  const [session, setSession] = useState(undefined) // undefined = 로딩 중, null = 미인증

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: listener } = supabase.auth.onAuthStateChange((_event, s) => setSession(s))
    return () => listener.subscription.unsubscribe()
  }, [])

  async function signIn(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  return {
    loading: session === undefined,
    authed: !!session,
    user: session?.user ?? null,
    signIn,
    signOut,
  }
}
