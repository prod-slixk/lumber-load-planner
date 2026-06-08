import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const url = import.meta.env.VITE_SUPABASE_URL as string
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!url || !key) {
  console.warn(
    '[LLP] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY — ' +
    'auth and cloud saves will be disabled. Copy .env.example to .env.local to enable.'
  )
}

export const supabase = createClient<Database>(url ?? '', key ?? '')

// ─── Auth helpers ─────────────────────────────────────────────────────────────

/** Send a magic-link email. Returns error string on failure, null on success. */
export async function signInWithMagicLink(email: string): Promise<string | null> {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: window.location.origin },
  })
  return error ? error.message : null
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut()
}

export async function getSession() {
  const { data } = await supabase.auth.getSession()
  return data.session
}
