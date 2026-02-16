import { useEffect, useState, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import type { Group, GroupAthlete, Profile } from "@/types/database"

// ============================================
// TYPES
// ============================================

export interface GroupWithDetails extends Group {
  coach?: Profile | null
  athlete_count?: number
}

export interface GroupAthleteWithDetails extends GroupAthlete {
  athlete?: Profile
  group?: Group
}

export interface GroupFormData {
  name: string
  macro_category: "male" | "female"
  level: "base" | "medium" | "pro"
  day_of_week: number
  time_slot: "18:30-20:00" | "20:00-21:30"
  max_athletes: number
  coach_id?: string | null
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseQuery = any

// ============================================
// HOOK: useGroups
// ============================================

interface UseGroupsReturn {
  groups: GroupWithDetails[]
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
  createGroup: (data: GroupFormData) => Promise<Group>
  updateGroup: (id: number, data: Partial<GroupFormData>) => Promise<Group>
  deleteGroup: (id: number) => Promise<void>
}

/**
 * Hook per recuperare e gestire i gruppi di allenamento
 */
export function useGroups(): UseGroupsReturn {
  const [groups, setGroups] = useState<GroupWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchGroups = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const { data, error: supabaseError } = await (supabase as SupabaseQuery)
        .from("groups")
        .select(`
          *,
          coach:profiles!groups_coach_id_fkey(id, full_name, email),
          athlete_count:group_athletes(count)
        `)
        .eq("is_active", true)
        .order("day_of_week")
        .order("time_slot")

      if (supabaseError) {
        throw new Error(supabaseError.message)
      }

      // Normalizza i dati - athlete_count arriva come oggetto { count: X }
      const normalizedData = ((data as GroupWithDetails[]) || []).map(group => ({
        ...group,
        athlete_count: typeof group.athlete_count === 'object' && group.athlete_count !== null 
          ? (group.athlete_count as unknown as { count: number }).count 
          : (group.athlete_count || 0)
      }))

      setGroups(normalizedData)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Errore sconosciuto"))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchGroups()
  }, [fetchGroups])

  const createGroup = useCallback(async (formData: GroupFormData): Promise<Group> => {
    const { data: newGroup, error } = await (supabase as SupabaseQuery)
      .from("groups")
      .insert(formData)
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    await fetchGroups()
    return newGroup as Group
  }, [fetchGroups])

  const updateGroup = useCallback(async (id: number, formData: Partial<GroupFormData>): Promise<Group> => {
    const { data: updatedGroup, error } = await (supabase as SupabaseQuery)
      .from("groups")
      .update(formData)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    await fetchGroups()
    return updatedGroup as Group
  }, [fetchGroups])

  const deleteGroup = useCallback(async (id: number): Promise<void> => {
    const { error } = await (supabase as SupabaseQuery)
      .from("groups")
      .update({ is_active: false })
      .eq("id", id)

    if (error) {
      throw new Error(error.message)
    }

    await fetchGroups()
  }, [fetchGroups])

  return {
    groups,
    isLoading,
    error,
    refetch: fetchGroups,
    createGroup,
    updateGroup,
    deleteGroup,
  }
}

// ============================================
// HOOK: useGroupAthletes
// ============================================

interface UseGroupAthletesReturn {
  groupAthletes: GroupAthleteWithDetails[]
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
  addAthleteToGroup: (groupId: number, athleteId: string) => Promise<void>
  removeAthleteFromGroup: (groupAthleteId: number) => Promise<void>
  moveAthlete: (athleteId: string, fromGroupId: number, toGroupId: number) => Promise<void>
}

/**
 * Hook per gestire gli atleti nei gruppi
 */
export function useGroupAthletes(groupId?: number): UseGroupAthletesReturn {
  const [groupAthletes, setGroupAthletes] = useState<GroupAthleteWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchGroupAthletes = useCallback(async () => {
    if (!groupId) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const { data, error: supabaseError } = await (supabase as SupabaseQuery)
        .from("group_athletes")
        .select(`
          *,
          athlete:profiles(id, full_name, email, phone)
        `)
        .eq("group_id", groupId)
        .eq("is_active", true)
        .order("joined_at")

      if (supabaseError) {
        throw new Error(supabaseError.message)
      }

      setGroupAthletes((data as GroupAthleteWithDetails[]) || [])
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Errore sconosciuto"))
    } finally {
      setIsLoading(false)
    }
  }, [groupId])

  useEffect(() => {
    fetchGroupAthletes()
  }, [fetchGroupAthletes])

  const addAthleteToGroup = useCallback(async (groupId: number, athleteId: string): Promise<void> => {
    const { error } = await (supabase as SupabaseQuery)
      .from("group_athletes")
      .insert({
        group_id: groupId,
        athlete_id: athleteId,
        is_active: true,
      })

    if (error) {
      throw new Error(error.message)
    }

    await fetchGroupAthletes()
  }, [fetchGroupAthletes])

  const removeAthleteFromGroup = useCallback(async (groupAthleteId: number): Promise<void> => {
    const { error } = await (supabase as SupabaseQuery)
      .from("group_athletes")
      .update({
        is_active: false,
        left_at: new Date().toISOString(),
      })
      .eq("id", groupAthleteId)

    if (error) {
      throw new Error(error.message)
    }

    await fetchGroupAthletes()
  }, [fetchGroupAthletes])

  const moveAthlete = useCallback(async (
    athleteId: string,
    fromGroupId: number,
    toGroupId: number
  ): Promise<void> => {
    // Disattiva dal gruppo precedente
    const { error: deactivateError } = await (supabase as SupabaseQuery)
      .from("group_athletes")
      .update({
        is_active: false,
        left_at: new Date().toISOString(),
      })
      .eq("group_id", fromGroupId)
      .eq("athlete_id", athleteId)
      .eq("is_active", true)

    if (deactivateError) {
      throw new Error(deactivateError.message)
    }

    // Aggiungi al nuovo gruppo
    const { error: insertError } = await (supabase as SupabaseQuery)
      .from("group_athletes")
      .insert({
        group_id: toGroupId,
        athlete_id: athleteId,
        is_active: true,
      })

    if (insertError) {
      throw new Error(insertError.message)
    }

    await fetchGroupAthletes()
  }, [fetchGroupAthletes])

  return {
    groupAthletes,
    isLoading,
    error,
    refetch: fetchGroupAthletes,
    addAthleteToGroup,
    removeAthleteFromGroup,
    moveAthlete,
  }
}

// ============================================
// HOOK: useAthleteGroups
// ============================================

interface UseAthleteGroupsReturn {
  groups: GroupWithDetails[]
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

/**
 * Hook per recuperare i gruppi di un atleta specifico
 */
export function useAthleteGroups(athleteId?: string): UseAthleteGroupsReturn {
  const [groups, setGroups] = useState<GroupWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchAthleteGroups = useCallback(async () => {
    if (!athleteId) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const { data, error: supabaseError } = await (supabase as SupabaseQuery)
        .from("group_athletes")
        .select(`
          group:groups(*)
        `)
        .eq("athlete_id", athleteId)
        .eq("is_active", true)

      if (supabaseError) {
        throw new Error(supabaseError.message)
      }

      setGroups(((data as { group: GroupWithDetails }[]) || []).map((ga) => ga.group))
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Errore sconosciuto"))
    } finally {
      setIsLoading(false)
    }
  }, [athleteId])

  useEffect(() => {
    fetchAthleteGroups()
  }, [fetchAthleteGroups])

  return {
    groups,
    isLoading,
    error,
    refetch: fetchAthleteGroups,
  }
}
