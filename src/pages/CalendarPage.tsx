import { useState } from "react"
import { useWeeklySchedule, getLevelColor, getLevelLabel } from "@/hooks/useTrainingSessions"
import { useGroups } from "@/hooks/useGroups"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Users, Clock, MapPin } from "lucide-react"

const DAYS_OF_WEEK = ["Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì"]

export function CalendarPage() {
  const [weekOffset, setWeekOffset] = useState(0)
  const { schedule, isLoading, error } = useWeeklySchedule(weekOffset)
  const { groups } = useGroups()

  // Calcola date della settimana
  const now = new Date()
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay() + 1 + weekOffset * 7)
  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 4) // Venerdì

  const weekRange = `${startOfWeek.toLocaleDateString("it-IT", {
    day: "numeric",
    month: "short",
  })} - ${endOfWeek.toLocaleDateString("it-IT", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })}`

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-vrb-orange" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500">Errore: {error.message}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Riprova
        </Button>
      </div>
    )
  }

  return (
    <div className="py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Calendario Allenamenti</h1>
          <p className="text-muted-foreground">Visualizza gli allenamenti della settimana</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setWeekOffset((prev) => prev - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-md min-w-[180px] justify-center">
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{weekRange}</span>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setWeekOffset((prev) => prev + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          {weekOffset !== 0 && (
            <Button variant="ghost" onClick={() => setWeekOffset(0)}>
              Oggi
            </Button>
          )}
        </div>
      </div>

      {/* Tabs per visualizzazione */}
      <Tabs defaultValue="weekly" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="weekly">Vista Settimanale</TabsTrigger>
          <TabsTrigger value="groups">Per Gruppo</TabsTrigger>
        </TabsList>

        <TabsContent value="weekly" className="space-y-4">
          {/* Weekly Schedule Grid */}
          <div className="grid gap-4 md:grid-cols-5">
            {schedule.map((day) => (
              <Card key={day.dayOfWeek} className={day.sessions.length === 0 ? "opacity-70" : ""}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{day.dayName}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {new Date(startOfWeek.getTime() + (day.dayOfWeek - 1) * 24 * 60 * 60 * 1000).toLocaleDateString("it-IT", {
                      day: "numeric",
                      month: "short",
                    })}
                  </p>
                </CardHeader>
                <CardContent className="space-y-3">
                  {day.sessions.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Nessun allenamento
                    </p>
                  ) : (
                    day.sessions.map((session) => (
                      <div
                        key={session.id}
                        className="p-3 rounded-lg border bg-card hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <Badge className={getLevelColor(session.group?.level || "")}>
                            {getLevelLabel(session.group?.level || "")}
                          </Badge>
                          <span className="text-xs text-muted-foreground flex items-center">
                            <Clock className="mr-1 h-3 w-3" />
                            {session.time_slot}
                          </span>
                        </div>
                        <p className="font-medium text-sm">{session.group?.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {session.group?.macro_category === "male" ? "Maschile" : "Femminile"}
                        </p>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="groups" className="space-y-4 mt-4">
          {/* Groups List */}
          {!groups || groups.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">Nessun gruppo disponibile</p>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {groups.map((group) => (
                <Card key={group.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{group.name}</CardTitle>
                      <Badge className={getLevelColor(group.level)}>
                        {getLevelLabel(group.level)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {getCategoryLabel(group.macro_category)}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                      <span>{DAYS_OF_WEEK[group.day_of_week - 1] || "-"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{group.time_slot}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{group.athlete_count || 0} atleti iscritti</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>Via B. Longhena, 22 - Verona</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Legend */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <p className="text-sm font-medium mb-3">Legenda Livelli:</p>
          <div className="flex flex-wrap gap-3">
            <Badge className={getLevelColor("base")}>Base</Badge>
            <Badge className={getLevelColor("medium")}>Medio</Badge>
            <Badge className={getLevelColor("pro")}>Pro</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function getCategoryLabel(category: string): string {
  switch (category) {
    case "male":
      return "Maschile"
    case "female":
      return "Femminile"
    default:
      return category
  }
}
