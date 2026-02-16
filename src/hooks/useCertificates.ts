import { useEffect, useState, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import type { MedicalCertificate, Profile } from "@/types/database"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseQuery = any

export interface CertificateWithDetails extends MedicalCertificate {
  athlete?: Profile
}

export function useCertificates(athleteId?: string) {
  const [certificates, setCertificates] = useState<CertificateWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchCertificates = useCallback(async () => {
    setIsLoading(true)
    let query = (supabase as SupabaseQuery)
      .from("medical_certificates")
      .select("*, athlete:profiles(*)")
      .order("expiry_date", { ascending: true })

    if (athleteId) query = query.eq("athlete_id", athleteId)

    const { data, error } = await query
    if (error) setError(new Error(error.message))
    else setCertificates(data || [])
    setIsLoading(false)
  }, [athleteId])

  useEffect(() => { fetchCertificates() }, [fetchCertificates])

  const uploadCertificate = async (file: File, data: {
    athlete_id: string
    type: "agonistico" | "non_agonistico"
    expiry_date: string
  }) => {
    const fileExt = file.name.split(".").pop()
    const fileName = `${data.athlete_id}/${Date.now()}.${fileExt}`

    const { error: uploadError } = await (supabase as SupabaseQuery)
      .storage.from("certificates")
      .upload(fileName, file)

    if (uploadError) throw new Error(uploadError.message)

    const { data: publicUrl } = (supabase as SupabaseQuery)
      .storage.from("certificates")
      .getPublicUrl(fileName)

    const { error: dbError } = await (supabase as SupabaseQuery)
      .from("medical_certificates")
      .insert({ ...data, file_url: publicUrl.publicUrl })

    if (dbError) throw new Error(dbError.message)
    await fetchCertificates()
  }

  return { certificates, isLoading, error, refetch: fetchCertificates, uploadCertificate }
}

export function getCertificateStatusColor(status: string): string {
  switch (status) {
    case "valid": return "bg-green-100 text-green-800"
    case "expiring": return "bg-yellow-100 text-yellow-800"
    case "expired": return "bg-red-100 text-red-800"
    default: return "bg-gray-100 text-gray-800"
  }
}

export function getCertificateStatusLabel(status: string): string {
  switch (status) {
    case "valid": return "Valido"
    case "expiring": return "In scadenza"
    case "expired": return "Scaduto"
    default: return status
  }
}
