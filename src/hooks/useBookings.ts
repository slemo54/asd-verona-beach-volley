import { useEffect, useState, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import type { CourtBooking, Profile } from "@/types/database"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseQuery = any

export interface BookingWithDetails extends CourtBooking {
  booked_by_profile?: Profile
}

export function useBookings(date?: string) {
  const [bookings, setBookings] = useState<BookingWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchBookings = useCallback(async () => {
    setIsLoading(true)
    let query = (supabase as SupabaseQuery)
      .from("court_bookings")
      .select("*, booked_by_profile:profiles(*)")
      .order("booking_date", { ascending: true })

    if (date) query = query.eq("booking_date", date)

    const { data, error } = await query
    if (error) setError(new Error(error.message))
    else setBookings(data || [])
    setIsLoading(false)
  }, [date])

  useEffect(() => { fetchBookings() }, [fetchBookings])

  const createBooking = async (data: Omit<CourtBooking, "id" | "created_at">) => {
    const { error } = await (supabase as SupabaseQuery)
      .from("court_bookings")
      .insert(data)
    if (error) throw new Error(error.message)
    await fetchBookings()
  }

  const cancelBooking = async (id: number) => {
    const { error } = await (supabase as SupabaseQuery)
      .from("court_bookings")
      .update({ status: "cancelled" })
      .eq("id", id)
    if (error) throw new Error(error.message)
    await fetchBookings()
  }

  return { bookings, isLoading, error, refetch: fetchBookings, createBooking, cancelBooking }
}

export const TIME_SLOTS = [
  "09:00-10:30", "10:30-12:00", "14:00-15:30", "15:30-17:00", "17:00-18:30"
]

export const COURT_NAMES = ["Campo 1", "Campo 2", "Campo 3"]
