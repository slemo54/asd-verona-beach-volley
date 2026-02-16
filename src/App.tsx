import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { useProfile } from "@/hooks/useProfile"
import { LoginPage } from "@/pages/LoginPage"
import { LandingPage } from "@/pages/LandingPage"
import { CalendarPage } from "@/pages/CalendarPage"
import { BookingPage } from "@/pages/BookingPage"
import { ShopPage } from "@/pages/ShopPage"
import { CertificatesPage } from "@/pages/CertificatesPage"
import { GroupsPage } from "@/pages/admin/GroupsPage"
import { AttendancePage } from "@/pages/admin/AttendancePage"
import { PaymentsPage } from "@/pages/admin/PaymentsPage"
import { ProtectedRoute } from "@/components/layout/ProtectedRoute"
import { AppLayout } from "@/components/layout/AppLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, AlertCircle, Volleyball, Users, CreditCard, FileText } from "lucide-react"
import { useGroups } from "@/hooks/useGroups"
import { usePaymentStats } from "@/hooks/usePayments"

/**
 * Pagina Dashboard Atleta
 */
function AthleteDashboardPage() {
  const { user } = useAuth()
  const { profile } = useProfile(user?.id)
  const { groups } = useGroups()
  const { stats } = usePaymentStats()
  
  const myGroups = groups.filter(g => g.athlete_count && g.athlete_count > 0).slice(0, 3)

  return (
    <div className="py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Ciao, {profile?.full_name?.split(" ")[0] || "Atleta"}!</h1>
        <p className="text-muted-foreground">Benvenuto nella tua area personale VRB</p>
      </div>
      
      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold text-vrb-orange">
              {myGroups.length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">I tuoi gruppi</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold">
              {stats ? new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(stats.collectedAmount) : "-"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Quota pagata</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold">
              {stats ? new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(stats.outstandingAmount) : "-"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Saldo dovuto</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold text-green-600">
              {profile?.is_moroso ? "No" : "Sì"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Regolare</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Volleyball className="h-5 w-5" />
              Prossimi Allenamenti
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Vai al Calendario per vedere i tuoi prossimi allenamenti.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Stato Pagamenti
            </CardTitle>
          </CardHeader>
          <CardContent>
            {profile?.is_moroso ? (
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-4 w-4" />
                <p className="text-sm">In attesa di pagamento</p>
              </div>
            ) : (
              <p className="text-sm text-green-600">✓ Pagamenti in regola</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Certificato Medico
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Carica o verifica il tuo certificato medico.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

/**
 * Pagina Profilo
 */
function ProfilePage() {
  const { user } = useAuth()
  const { profile, isLoading } = useProfile(user?.id)

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Il Mio Profilo</h1>
        <p className="text-muted-foreground">Gestisci i tuoi dati personali</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informazioni Personali</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Nome Completo</label>
              <p className="text-lg">{profile?.full_name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <p className="text-lg">{profile?.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Telefono</label>
              <p className="text-lg">{profile?.phone || "Non impostato"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Taglia Maglietta</label>
              <p className="text-lg">{profile?.tshirt_size || "Non impostata"}</p>
            </div>
          </div>
          
          <div className="pt-4 border-t">
            <label className="text-sm font-medium text-muted-foreground">Ruolo</label>
            <div className="mt-1">
              <Badge variant={profile?.role === "admin" ? "default" : "secondary"}>
                {profile?.role === "admin" ? "Amministratore" : "Atleta"}
              </Badge>
            </div>
          </div>

          {profile?.is_moroso && (
            <div className="flex items-center gap-2 p-4 bg-red-50 text-red-700 rounded-lg">
              <AlertCircle className="h-5 w-5" />
              <p className="text-sm font-medium">
                Attenzione: risulti moroso. Alcune funzionalità potrebbero essere limitate.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * Admin Dashboard
 */
function AdminDashboardPage() {
  const { stats } = usePaymentStats()

  return (
    <div className="py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard Admin</h1>
        <p className="text-muted-foreground">Gestione completa dell'associazione</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-3xl font-bold">
              <Users className="h-8 w-8 mb-2" />
              136
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Atleti Registrati</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-3xl font-bold text-yellow-600">
              {stats?.partialCount || 0}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Pagamenti Parziali</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-3xl font-bold text-red-600">
              {stats?.overdueCount || 0}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">In Ritardo</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-3xl font-bold text-green-600">
              {stats ? new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(stats.collectedAmount) : "-"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Incassato</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gestione</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            <a href="/admin/groups" className="flex items-center gap-2 p-3 border rounded-lg hover:bg-muted">
              <Badge variant="secondary">Fase 2</Badge>
              <span>Gestione Gruppi</span>
            </a>
            <a href="/admin/attendance" className="flex items-center gap-2 p-3 border rounded-lg hover:bg-muted">
              <Badge variant="secondary">Fase 3</Badge>
              <span>Registrazione Presenze</span>
            </a>
            <a href="/admin/payments" className="flex items-center gap-2 p-3 border rounded-lg hover:bg-muted">
              <Badge variant="secondary">Fase 4</Badge>
              <span>Gestione Pagamenti</span>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * Componente principale App
 */
function App() {
  const { user, isLoading, isAuthenticated, signIn, signOut } = useAuth()
  const { profile } = useProfile(user?.id)

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-vrb-orange" />
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <LandingPage />
            )
          }
        />
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <LoginPage onLogin={signIn} isLoading={isLoading} />
            )
          }
        />

        {/* Protected Routes */}
        <Route
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated} profile={profile}>
              <AppLayout profile={profile} onLogout={signOut} />
            </ProtectedRoute>
          }
        >
          {/* Athlete Routes */}
          <Route path="/dashboard" element={<AthleteDashboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/certificates" element={<CertificatesPage />} />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated} profile={profile} requireAdmin>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/groups"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated} profile={profile} requireAdmin>
                <GroupsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/attendance"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated} profile={profile} requireAdmin>
                <AttendancePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/payments"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated} profile={profile} requireAdmin>
                <PaymentsPage />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Redirects */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
