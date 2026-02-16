import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local"
  )
}

/**
 * Client Supabase tipizzato per l'intera applicazione
 * Usare questo client per tutte le operazioni su database, auth e storage
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})

/**
 * Tipo per il client Supabase (utile per i parametri delle funzioni)
 */
export type SupabaseClient = typeof supabase

/**
 * Helper per gestire gli errori di Supabase
 * @param error - Errore da Supabase
 * @param context - Contesto dell'operazione (per il logging)
 * @throws Error con messaggio localizzato
 */
export function handleSupabaseError(error: Error | null, context: string): void {
  if (error) {
    console.error(`[Supabase Error] ${context}:`, error)
    throw new Error(`${context}: ${error.message}`)
  }
}

/**
 * Verifica se l'utente corrente è autenticato
 * @returns true se l'utente è autenticato
 */
export async function isAuthenticated(): Promise<boolean> {
  const { data } = await supabase.auth.getSession()
  return !!data.session
}

/**
 * Ottiene l'ID dell'utente corrente
 * @returns ID utente o null se non autenticato
 */
export async function getCurrentUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getUser()
  return data.user?.id ?? null
}
