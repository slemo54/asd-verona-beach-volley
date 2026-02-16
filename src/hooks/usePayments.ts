import { useEffect, useState, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import type { Payment, PaymentTransaction, Profile } from "@/types/database"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseQuery = any

export interface PaymentWithDetails extends Payment {
  athlete?: Profile
  transactions?: PaymentTransaction[]
}

export interface PaymentFormData {
  athlete_id: string
  season: string
  total_season_fee: number
  association_fee: number
  notes?: string
}

export interface TransactionFormData {
  payment_id: number
  amount: number
  method: string
  notes?: string
}

// ============================================
// HOOK: usePayments
// ============================================

interface UsePaymentsReturn {
  payments: PaymentWithDetails[]
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
  createPayment: (data: PaymentFormData) => Promise<void>
  updatePayment: (id: number, data: Partial<PaymentFormData>) => Promise<void>
  addTransaction: (data: TransactionFormData) => Promise<void>
}

export function usePayments(athleteId?: string, season?: string): UsePaymentsReturn {
  const [payments, setPayments] = useState<PaymentWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchPayments = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      let query = (supabase as SupabaseQuery)
        .from("payments")
        .select(`
          *,
          athlete:profiles(id, full_name, email),
          transactions:payment_transactions(*)
        `)

      if (athleteId) {
        query = query.eq("athlete_id", athleteId)
      }

      if (season) {
        query = query.eq("season", season)
      }

      const { data, error: supabaseError } = await query
        .order("created_at", { ascending: false })

      if (supabaseError) {
        throw new Error(supabaseError.message)
      }

      setPayments((data as PaymentWithDetails[]) || [])
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Errore sconosciuto"))
    } finally {
      setIsLoading(false)
    }
  }, [athleteId, season])

  useEffect(() => {
    fetchPayments()
  }, [fetchPayments])

  const createPayment = useCallback(async (formData: PaymentFormData): Promise<void> => {
    const { error } = await (supabase as SupabaseQuery)
      .from("payments")
      .insert(formData)

    if (error) {
      throw new Error(error.message)
    }

    await fetchPayments()
  }, [fetchPayments])

  const updatePayment = useCallback(async (id: number, formData: Partial<PaymentFormData>): Promise<void> => {
    const { error } = await (supabase as SupabaseQuery)
      .from("payments")
      .update(formData)
      .eq("id", id)

    if (error) {
      throw new Error(error.message)
    }

    await fetchPayments()
  }, [fetchPayments])

  const addTransaction = useCallback(async (formData: TransactionFormData): Promise<void> => {
    const { error } = await (supabase as SupabaseQuery)
      .from("payment_transactions")
      .insert(formData)

    if (error) {
      throw new Error(error.message)
    }

    await fetchPayments()
  }, [fetchPayments])

  return {
    payments,
    isLoading,
    error,
    refetch: fetchPayments,
    createPayment,
    updatePayment,
    addTransaction,
  }
}

// ============================================
// HOOK: usePaymentStats
// ============================================

interface PaymentStats {
  totalAthletes: number
  paidCount: number
  partialCount: number
  overdueCount: number
  totalAmount: number
  collectedAmount: number
  outstandingAmount: number
}

interface UsePaymentStatsReturn {
  stats: PaymentStats | null
  isLoading: boolean
  error: Error | null
}

export function usePaymentStats(season?: string): UsePaymentStatsReturn {
  const [stats, setStats] = useState<PaymentStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const currentSeason = season || new Date().getFullYear().toString()

        const { data: payments, error: paymentsError } = await (supabase as SupabaseQuery)
          .from("payments")
          .select("*")
          .eq("season", currentSeason)

        if (paymentsError) {
          throw new Error(paymentsError.message)
        }

        const paymentList = (payments as Payment[]) || []

        const totalAthletes = paymentList.length
        const paidCount = paymentList.filter((p) => p.status === "paid").length
        const partialCount = paymentList.filter((p) => p.status === "partial").length
        const overdueCount = paymentList.filter((p) => p.status === "overdue").length

        const totalAmount = paymentList.reduce(
          (acc, p) => acc + p.total_season_fee + p.association_fee,
          0
        )
        const collectedAmount = paymentList.reduce((acc, p) => acc + p.amount_paid, 0)
        const outstandingAmount = totalAmount - collectedAmount

        setStats({
          totalAthletes,
          paidCount,
          partialCount,
          overdueCount,
          totalAmount,
          collectedAmount,
          outstandingAmount,
        })
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Errore sconosciuto"))
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [season])

  return {
    stats,
    isLoading,
    error,
  }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

export function getPaymentStatusColor(status: string): string {
  switch (status) {
    case "paid":
      return "bg-green-100 text-green-800 border-green-200"
    case "partial":
      return "bg-yellow-100 text-yellow-800 border-yellow-200"
    case "overdue":
      return "bg-red-100 text-red-800 border-red-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

export function getPaymentStatusLabel(status: string): string {
  switch (status) {
    case "paid":
      return "Pagato"
    case "partial":
      return "Parziale"
    case "overdue":
      return "In ritardo"
    default:
      return status
  }
}

export function getSemaphoreVariant(status: string): "success" | "warning" | "danger" | "default" {
  switch (status) {
    case "paid":
      return "success"
    case "partial":
      return "warning"
    case "overdue":
      return "danger"
    default:
      return "default"
  }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
  }).format(amount)
}

export function calculateProgress(amountPaid: number, totalAmount: number): number {
  if (totalAmount === 0) return 0
  return Math.min(100, Math.round((amountPaid / totalAmount) * 100))
}
