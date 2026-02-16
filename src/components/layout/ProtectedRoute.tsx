import { Navigate, useLocation } from "react-router-dom"
import type { Profile } from "@/types/database"

interface ProtectedRouteProps {
  children: React.ReactNode
  isAuthenticated: boolean
  profile?: Profile | null
  requireAdmin?: boolean
}

/**
 * Componente per proteggere le route che richiedono autenticazione
 * 
 * @param isAuthenticated - Se l'utente è autenticato
 * @param profile - Profilo dell'utente (per verificare il ruolo)
 * @param requireAdmin - Se la route richiede il ruolo admin
 */
export function ProtectedRoute({
  children,
  isAuthenticated,
  profile,
  requireAdmin = false,
}: ProtectedRouteProps) {
  const location = useLocation()

  // Se non è autenticato, redirect al login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Se richiede admin e l'utente non è admin, redirect alla dashboard
  if (requireAdmin && profile?.role !== "admin") {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}
