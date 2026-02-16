import { useEffect, useState, useCallback } from "react"
import type { Session, User } from "@supabase/supabase-js"
// import { supabase } from "@/lib/supabase"
import * as auth from "@/lib/auth"

interface AuthState {
  user: User | null
  session: Session | null
  isLoading: boolean
  isAuthenticated: boolean
}

interface UseAuthReturn extends AuthState {
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName: string) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
}

/**
 * Hook per la gestione dell'autenticazione
 * Fornisce lo stato auth e le funzioni di login/logout
 */
export function useAuth(): UseAuthReturn {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
    isAuthenticated: false,
  })

  // Carica la sessione iniziale
  useEffect(() => {
    const initAuth = async () => {
      try {
        const session = await auth.getSession()
        setState({
          user: session?.user ?? null,
          session,
          isLoading: false,
          isAuthenticated: !!session,
        })
      } catch (error) {
        console.error("Auth initialization error:", error)
        setState(prev => ({ ...prev, isLoading: false }))
      }
    }

    initAuth()
  }, [])

  // Sottoscrizione ai cambiamenti di stato
  useEffect(() => {
    const subscription = auth.onAuthStateChange((_event, session) => {
      setState({
        user: session?.user ?? null,
        session,
        isLoading: false,
        isAuthenticated: !!session,
      })
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    setState(prev => ({ ...prev, isLoading: true }))
    try {
      const data = await auth.signIn({ email, password })
      setState({
        user: data.user,
        session: data.session,
        isLoading: false,
        isAuthenticated: true,
      })
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }))
      throw error
    }
  }, [])

  const signUp = useCallback(async (email: string, password: string, fullName: string) => {
    setState(prev => ({ ...prev, isLoading: true }))
    try {
      const data = await auth.signUp({ email, password, fullName })
      setState({
        user: data.user,
        session: data.session,
        isLoading: false,
        isAuthenticated: !!data.session,
      })
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }))
      throw error
    }
  }, [])

  const signOut = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }))
    try {
      await auth.signOut()
      setState({
        user: null,
        session: null,
        isLoading: false,
        isAuthenticated: false,
      })
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }))
      throw error
    }
  }, [])

  const resetPassword = useCallback(async (email: string) => {
    await auth.resetPassword(email)
  }, [])

  return {
    ...state,
    signIn,
    signUp,
    signOut,
    resetPassword,
  }
}
