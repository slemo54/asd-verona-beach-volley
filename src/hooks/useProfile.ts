import { useEffect, useState, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import type { Profile } from "@/types/database"

interface UseProfileReturn {
  profile: Profile | null
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
  updateProfile: (updates: ProfileUpdate) => Promise<void>
  uploadAvatar: (file: File) => Promise<void>
}

// Tipo per gli aggiornamenti del profilo (esclude i campi generati)
interface ProfileUpdate {
  full_name?: string
  phone?: string | null
  tshirt_size?: "XS" | "S" | "M" | "L" | "XL" | "XXL" | null
  avatar_url?: string | null
}

/**
 * Hook per recuperare e gestire il profilo dell'utente corrente
 */
export function useProfile(userId?: string): UseProfileReturn {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchProfile = useCallback(async () => {
    if (!userId) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const { data, error: supabaseError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single()

      if (supabaseError) {
        throw new Error(supabaseError.message)
      }

      setProfile(data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Errore sconosciuto"))
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  const updateProfile = useCallback(async (updates: ProfileUpdate) => {
    if (!userId) {
      throw new Error("Utente non autenticato")
    }

    setIsLoading(true)

    try {
      // Per ora usiamo l'API standard con type assertion
      const { data, error: supabaseError } = await supabase
        .from("profiles")
        // @ts-expect-error - Supabase type inference issue
        .update(updates)
        .eq("id", userId)
        .select()
        .single()

      if (supabaseError) {
        throw new Error(supabaseError.message)
      }

      setProfile(data)
    } catch (err) {
      throw err instanceof Error ? err : new Error("Errore durante l'aggiornamento")
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  const uploadAvatar = useCallback(async (file: File) => {
    if (!userId) {
      throw new Error("Utente non autenticato")
    }

    setIsLoading(true)

    try {
      const fileExt = file.name.split(".").pop()
      const fileName = `${userId}/${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file)

      if (uploadError) {
        throw new Error(uploadError.message)
      }

      const { data: publicUrl } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName)

      await updateProfile({ avatar_url: publicUrl.publicUrl })
    } catch (err) {
      throw err instanceof Error ? err : new Error("Errore durante l'upload")
    } finally {
      setIsLoading(false)
    }
  }, [userId, updateProfile])

  return {
    profile,
    isLoading,
    error,
    refetch: fetchProfile,
    updateProfile,
    uploadAvatar,
  }
}

/**
 * Hook per recuperare tutti i profili (solo admin)
 */
export function useAllProfiles(): {
  profiles: Profile[]
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
} {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchProfiles = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const { data, error: supabaseError } = await supabase
        .from("profiles")
        .select("*")
        .order("full_name")

      if (supabaseError) {
        throw new Error(supabaseError.message)
      }

      setProfiles(data || [])
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Errore sconosciuto"))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProfiles()
  }, [fetchProfiles])

  return {
    profiles,
    isLoading,
    error,
    refetch: fetchProfiles,
  }
}
