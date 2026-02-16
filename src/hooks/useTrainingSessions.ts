import { useEffect, useState, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import type { TrainingSession, Group, Profile } from "@/types/database"

// ============================================
// TYPES
// ============================================

export interface TrainingSessionWithDetails extends TrainingSession {
  group?: Group
  created_by_profile?: Profile
}

export interface SessionFormData {
  group_id: number
  session_date: string
  time_slot: "18:30-20:00" | "20:00-21:30"
  notes?: string
}

export interface WeeklySchedule {
  dayOfWeek: number
  dayName: string
  sessions: TrainingSessionWithDetails[]
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseQuery = any

// ============================================
// HOOK: useTrainingSessions
// ============================================

interface UseTrainingSessionsReturn {
  sessions: TrainingSessionWithDetails[]
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
  createSession: (data: SessionFormData) => Promise<TrainingSession>
  updateSession: (id: number, data: Partial<SessionFormData>) => Promise<TrainingSession>
  deleteSession: (id: number) => Promise<void>
}

/**
 * Hook per recuperare e gestire le sessioni di allenamento
 */
export function useTrainingSessions(
  groupId?: number,
  startDate?: string,
  endDate?: string
): UseTrainingSessionsReturn {
  const [sessions, setSessions] = useState<TrainingSessionWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchSessions = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      let query = (supabase as SupabaseQuery)
        .from("training_sessions")
        .select(`
          *,
          group:groups(*),
          created_by_profile:profiles!training_sessions_created_by_fkey(id, full_name)
        `)

      if (groupId) {
        query = query.eq("group_id", groupId)
      }

      if (startDate) {
        query = query.gte("session_date", startDate)
      }

      if (endDate) {
        query = query.lte("session_date", endDate)
      }

      const { data, error: supabaseError } = await query
        .order("session_date", { ascending: false })
        .order("time_slot")

      if (supabaseError) {
        throw new Error(supabaseError.message)
      }

      setSessions((data as TrainingSessionWithDetails[]) || [])
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Errore sconosciuto"))
    } finally {
      setIsLoading(false)
    }
  }, [groupId, startDate, endDate])

  useEffect(() => {
    fetchSessions()
  }, [fetchSessions])

  const createSession = useCallback(async (formData: SessionFormData): Promise<TrainingSession> => {
    const { data: newSession, error } = await (supabase as SupabaseQuery)
      .from("training_sessions")
      .insert(formData)
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    await fetchSessions()
    return newSession as TrainingSession
  }, [fetchSessions])

  const updateSession = useCallback(async (id: number, formData: Partial<SessionFormData>): Promise<TrainingSession> => {
    const { data: updatedSession, error } = await (supabase as SupabaseQuery)
      .from("training_sessions")
      .update(formData)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    await fetchSessions()
    return updatedSession as TrainingSession
  }, [fetchSessions])

  const deleteSession = useCallback(async (id: number): Promise<void> => {
    const { error } = await (supabase as SupabaseQuery)
      .from("training_sessions")
      .delete()
      .eq("id", id)

    if (error) {
      throw new Error(error.message)
    }

    await fetchSessions()
  }, [fetchSessions])

  return {
    sessions,
    isLoading,
    error,
    refetch: fetchSessions,
    createSession,
    updateSession,
    deleteSession,
  }
}

// ============================================
// HOOK: useWeeklySchedule
// ============================================

interface UseWeeklyScheduleReturn {
  schedule: WeeklySchedule[]
  isLoading: boolean
  error: Error | null
}

const DAY_NAMES = ["Domenica", "Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato"]

/**
 * Hook per ottenere la schedule settimanale
 */
export function useWeeklySchedule(weekOffset: number = 0): UseWeeklyScheduleReturn {
  const [schedule, setSchedule] = useState<WeeklySchedule[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchSchedule = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Calcola inizio e fine settimana
        const now = new Date()
        const startOfWeek = new Date(now)
        startOfWeek.setDate(now.getDate() - now.getDay() + 1 + weekOffset * 7) // Lunedì
        startOfWeek.setHours(0, 0, 0, 0)

        const endOfWeek = new Date(startOfWeek)
        endOfWeek.setDate(startOfWeek.getDate() + 6) // Domenica
        endOfWeek.setHours(23, 59, 59, 999)

        const { data, error: supabaseError } = await (supabase as SupabaseQuery)
          .from("training_sessions")
          .select(`
            *,
            group:groups(*)
          `)
          .gte("session_date", startOfWeek.toISOString().split("T")[0])
          .lte("session_date", endOfWeek.toISOString().split("T")[0])
          .order("session_date")
          .order("time_slot")

        if (supabaseError) {
          throw new Error(supabaseError.message)
        }

        // Organizza per giorno della settimana
        const weeklySchedule: WeeklySchedule[] = []

        for (let i = 1; i <= 5; i++) { // Lunedì a Venerdì
          const dayDate = new Date(startOfWeek)
          dayDate.setDate(startOfWeek.getDate() + i - 1)

          const daySessions = ((data as TrainingSessionWithDetails[]) || []).filter(
            (s) => new Date(s.session_date).getDay() === i
          )

          weeklySchedule.push({
            dayOfWeek: i,
            dayName: DAY_NAMES[i],
            sessions: daySessions,
          })
        }

        setSchedule(weeklySchedule)
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Errore sconosciuto"))
      } finally {
        setIsLoading(false)
      }
    }

    fetchSchedule()
  }, [weekOffset])

  return {
    schedule,
    isLoading,
    error,
  }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Formatta la data per visualizzazione
 */
export function formatSessionDate(dateString: string): string {
  const date = new Date(dateString)
  const dayName = DAY_NAMES[date.getDay()]
  const formatted = date.toLocaleDateString("it-IT", {
    day: "numeric",
    month: "long",
  })
  return `${dayName} ${formatted}`
}

/**
 * Ottiene il colore in base al livello del gruppo
 */
export function getLevelColor(level: string): string {
  switch (level) {
    case "base":
      return "bg-green-100 text-green-800 border-green-200"
    case "medium":
      return "bg-yellow-100 text-yellow-800 border-yellow-200"
    case "pro":
      return "bg-red-100 text-red-800 border-red-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

/**
 * Ottiene il label in italiano per il livello
 */
export function getLevelLabel(level: string): string {
  switch (level) {
    case "base":
      return "Base"
    case "medium":
      return "Medio"
    case "pro":
      return "Pro"
    default:
      return level
  }
}

/**
 * Ottiene il label in italiano per la macro-categoria
 */
export function getCategoryLabel(category: string): string {
  switch (category) {
    case "male":
      return "Maschile"
    case "female":
      return "Femminile"
    default:
      return category
  }
}
