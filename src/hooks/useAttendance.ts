import { useEffect, useState, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import type { Attendance, Profile, TrainingSession, Group } from "@/types/database"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseQuery = any

export interface AttendanceWithDetails extends Attendance {
  athlete?: Profile
  session?: TrainingSession & { group?: Group }
}

export interface AttendanceFormData {
  session_id: number
  athlete_id: string
  is_present: boolean
  needs_recovery?: boolean
  notes?: string
}

export interface RecoveryBooking {
  id: number
  athlete_id: string
  original_session_id: number
  recovery_group_id: number
  recovery_date: string
  status: "pending" | "confirmed" | "completed" | "cancelled"
  created_at: string
  athlete?: Profile
  original_session?: TrainingSession
  recovery_group?: Group
}

// ============================================
// HOOK: useAttendance
// ============================================

interface UseAttendanceReturn {
  attendances: AttendanceWithDetails[]
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
  recordAttendance: (data: AttendanceFormData) => Promise<void>
  updateAttendance: (id: number, data: Partial<AttendanceFormData>) => Promise<void>
  bulkRecordAttendance: (sessionId: number, attendanceData: { athlete_id: string; is_present: boolean; needs_recovery?: boolean; notes?: string }[]) => Promise<void>
}

export function useAttendance(
  sessionId?: number,
  athleteId?: string
): UseAttendanceReturn {
  const [attendances, setAttendances] = useState<AttendanceWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchAttendances = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      let query = (supabase as SupabaseQuery)
        .from("attendances")
        .select(`
          *,
          athlete:profiles(id, full_name, email),
          session:training_sessions(*, group:groups(*))
        `)

      if (sessionId) {
        query = query.eq("session_id", sessionId)
      }

      if (athleteId) {
        query = query.eq("athlete_id", athleteId)
      }

      const { data, error: supabaseError } = await query
        .order("recorded_at", { ascending: false })

      if (supabaseError) {
        throw new Error(supabaseError.message)
      }

      setAttendances((data as AttendanceWithDetails[]) || [])
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Errore sconosciuto"))
    } finally {
      setIsLoading(false)
    }
  }, [sessionId, athleteId])

  useEffect(() => {
    fetchAttendances()
  }, [fetchAttendances])

  const recordAttendance = useCallback(async (data: AttendanceFormData): Promise<void> => {
    const { error } = await (supabase as SupabaseQuery)
      .from("attendances")
      .upsert({
        ...data,
        recorded_at: new Date().toISOString(),
      }, {
        onConflict: "session_id,athlete_id"
      })

    if (error) {
      throw new Error(error.message)
    }

    await fetchAttendances()
  }, [fetchAttendances])

  const updateAttendance = useCallback(async (id: number, data: Partial<AttendanceFormData>): Promise<void> => {
    const { error } = await (supabase as SupabaseQuery)
      .from("attendances")
      .update(data)
      .eq("id", id)

    if (error) {
      throw new Error(error.message)
    }

    await fetchAttendances()
  }, [fetchAttendances])

  const bulkRecordAttendance = useCallback(async (
    sessionId: number,
    attendanceData: { athlete_id: string; is_present: boolean; needs_recovery?: boolean; notes?: string }[]
  ): Promise<void> => {
    const records = attendanceData.map((data) => ({
      session_id: sessionId,
      ...data,
      recorded_at: new Date().toISOString(),
    }))

    const { error } = await (supabase as SupabaseQuery)
      .from("attendances")
      .upsert(records, {
        onConflict: "session_id,athlete_id"
      })

    if (error) {
      throw new Error(error.message)
    }

    await fetchAttendances()
  }, [fetchAttendances])

  return {
    attendances,
    isLoading,
    error,
    refetch: fetchAttendances,
    recordAttendance,
    updateAttendance,
    bulkRecordAttendance,
  }
}

// ============================================
// HOOK: useAthleteAttendanceStats
// ============================================

interface AttendanceStats {
  totalSessions: number
  presentCount: number
  absentCount: number
  attendanceRate: number
  recoveriesToSchedule: number
  recoveriesCompleted: number
}

interface UseAthleteAttendanceStatsReturn {
  stats: AttendanceStats | null
  recentAttendances: AttendanceWithDetails[]
  isLoading: boolean
  error: Error | null
}

export function useAthleteAttendanceStats(
  athleteId?: string,
  season?: string
): UseAthleteAttendanceStatsReturn {
  const [stats, setStats] = useState<AttendanceStats | null>(null)
  const [recentAttendances, setRecentAttendances] = useState<AttendanceWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      if (!athleteId) {
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        // Recupera tutte le presenze dell'atleta
        const { data: attendances, error: attendancesError } = await (supabase as SupabaseQuery)
          .from("attendances")
          .select(`
            *,
            session:training_sessions(*, group:groups(*))
          `)
          .eq("athlete_id", athleteId)
          .order("recorded_at", { ascending: false })

        if (attendancesError) {
          throw new Error(attendancesError.message)
        }

        const attendanceList = (attendances as AttendanceWithDetails[]) || []

        // Calcola statistiche
        const totalSessions = attendanceList.length
        const presentCount = attendanceList.filter((a) => a.is_present).length
        const absentCount = totalSessions - presentCount
        const attendanceRate = totalSessions > 0 ? (presentCount / totalSessions) * 100 : 0

        const recoveriesToSchedule = attendanceList.filter(
          (a) => !a.is_present && a.needs_recovery && !a.recovery_date
        ).length

        const recoveriesCompleted = attendanceList.filter(
          (a) => a.recovery_date
        ).length

        setStats({
          totalSessions,
          presentCount,
          absentCount,
          attendanceRate,
          recoveriesToSchedule,
          recoveriesCompleted,
        })

        setRecentAttendances(attendanceList.slice(0, 10))
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Errore sconosciuto"))
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [athleteId, season])

  return {
    stats,
    recentAttendances,
    isLoading,
    error,
  }
}

// ============================================
// HOOK: useRecovery
// ============================================

interface UseRecoveryReturn {
  pendingRecoveries: AttendanceWithDetails[]
  recoveryBookings: RecoveryBooking[]
  isLoading: boolean
  error: Error | null
  bookRecovery: (attendanceId: number, recoveryGroupId: number, recoveryDate: string) => Promise<void>
  cancelRecovery: (attendanceId: number) => Promise<void>
  confirmRecovery: (attendanceId: number) => Promise<void>
}

export function useRecovery(athleteId?: string): UseRecoveryReturn {
  const [pendingRecoveries, setPendingRecoveries] = useState<AttendanceWithDetails[]>([])
  const [recoveryBookings, setRecoveryBookings] = useState<RecoveryBooking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchRecoveries = useCallback(async () => {
    if (!athleteId) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Recupera assenze che necessitano recupero
      const { data: pending, error: pendingError } = await (supabase as SupabaseQuery)
        .from("attendances")
        .select(`
          *,
          athlete:profiles(id, full_name),
          session:training_sessions(*, group:groups(*))
        `)
        .eq("athlete_id", athleteId)
        .eq("is_present", false)
        .eq("needs_recovery", true)
        .is("recovery_date", null)

      if (pendingError) {
        throw new Error(pendingError.message)
      }

      setPendingRecoveries((pending as AttendanceWithDetails[]) || [])

      // Recupera recuperi programmati/completati
      const { data: booked, error: bookedError } = await (supabase as SupabaseQuery)
        .from("attendances")
        .select(`
          *,
          athlete:profiles(id, full_name),
          session:training_sessions(*, group:groups(*)),
          recovery_group:groups!attendances_recovery_group_id_fkey(*)
        `)
        .eq("athlete_id", athleteId)
        .not("recovery_date", "is", null)
        .order("recovery_date", { ascending: true })

      if (bookedError) {
        throw new Error(bookedError.message)
      }

      setRecoveryBookings((booked as unknown as RecoveryBooking[]) || [])
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Errore sconosciuto"))
    } finally {
      setIsLoading(false)
    }
  }, [athleteId])

  useEffect(() => {
    fetchRecoveries()
  }, [fetchRecoveries])

  const bookRecovery = useCallback(async (
    attendanceId: number,
    recoveryGroupId: number,
    recoveryDate: string
  ): Promise<void> => {
    const { error } = await (supabase as SupabaseQuery)
      .from("attendances")
      .update({
        recovery_group_id: recoveryGroupId,
        recovery_date: recoveryDate,
      })
      .eq("id", attendanceId)

    if (error) {
      throw new Error(error.message)
    }

    await fetchRecoveries()
  }, [fetchRecoveries])

  const cancelRecovery = useCallback(async (attendanceId: number): Promise<void> => {
    const { error } = await (supabase as SupabaseQuery)
      .from("attendances")
      .update({
        recovery_group_id: null,
        recovery_date: null,
      })
      .eq("id", attendanceId)

    if (error) {
      throw new Error(error.message)
    }

    await fetchRecoveries()
  }, [fetchRecoveries])

  const confirmRecovery = useCallback(async (attendanceId: number): Promise<void> => {
    const { error } = await (supabase as SupabaseQuery)
      .from("attendances")
      .update({
        needs_recovery: false,
      })
      .eq("id", attendanceId)

    if (error) {
      throw new Error(error.message)
    }

    await fetchRecoveries()
  }, [fetchRecoveries])

  return {
    pendingRecoveries,
    recoveryBookings,
    isLoading,
    error,
    bookRecovery,
    cancelRecovery,
    confirmRecovery,
  }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

export function canRecoverInGroup(
  originalGroupLevel: string,
  targetGroupLevel: string
): boolean {
  // Il recupero è permesso solo nello stesso livello
  return originalGroupLevel === targetGroupLevel
}

export function getAttendanceStatusColor(isPresent: boolean): string {
  return isPresent
    ? "bg-green-100 text-green-800 border-green-200"
    : "bg-red-100 text-red-800 border-red-200"
}

export function getAttendanceStatusLabel(isPresent: boolean): string {
  return isPresent ? "Presente" : "Assente"
}
