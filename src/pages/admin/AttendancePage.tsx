import { useState } from "react"
import { useGroups } from "@/hooks/useGroups"
import { useTrainingSessions } from "@/hooks/useTrainingSessions"
import { useGroupAthletes } from "@/hooks/useGroups"
import { useAttendance } from "@/hooks/useAttendance"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Save } from "lucide-react"
import { formatDateShort } from "@/lib/utils"


export function AttendancePage() {
  const { groups } = useGroups()
  const [selectedGroupId, setSelectedGroupId] = useState<string>("")
  const [selectedSessionId, setSelectedSessionId] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [attendanceMap, setAttendanceMap] = useState<Record<string, {
    is_present: boolean
    needs_recovery: boolean
    notes: string
  }>>({})

  const groupId = selectedGroupId ? parseInt(selectedGroupId) : undefined
  const sessionId = selectedSessionId ? parseInt(selectedSessionId) : undefined

  const { sessions } = useTrainingSessions(groupId)
  const { groupAthletes } = useGroupAthletes(groupId)
  const { attendances, bulkRecordAttendance } = useAttendance(sessionId)

  // Inizializza attendanceMap quando cambiano gli atleti o le presenze
  useEffect(() => {
    const initialMap: Record<string, {
      is_present: boolean
      needs_recovery: boolean
      notes: string
    }> = {}

    groupAthletes.forEach((ga) => {
      const existingAttendance = attendances.find(
        (a) => a.athlete_id === ga.athlete_id
      )

      initialMap[ga.athlete_id] = {
        is_present: existingAttendance?.is_present ?? true,
        needs_recovery: existingAttendance?.needs_recovery ?? false,
        notes: existingAttendance?.notes ?? "",
      }
    })

    setAttendanceMap(initialMap)
  }, [groupAthletes, attendances])

  const handleSave = async () => {
    if (!sessionId) return

    setIsSubmitting(true)
    try {
      const attendanceData = Object.entries(attendanceMap).map(([athleteId, data]) => ({
        athlete_id: athleteId,
        ...data,
      }))

      await bulkRecordAttendance(sessionId, attendanceData)
      alert("Presenze salvate con successo!")
    } catch (error) {
      alert("Errore durante il salvataggio: " + (error instanceof Error ? error.message : "Errore"))
    } finally {
      setIsSubmitting(false)
    }
  }

  const updateAttendance = (athleteId: string, updates: Partial<typeof attendanceMap[string]>) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [athleteId]: {
        ...prev[athleteId],
        ...updates,
      },
    }))
  }

  const selectedGroup = groups.find((g) => g.id === groupId)
  const selectedSession = sessions.find((s) => s.id === sessionId)

  return (
    <div className="py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Registrazione Presenze</h1>
        <p className="text-muted-foreground">
          Registra le presenze per una sessione di allenamento
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Gruppo</Label>
              <Select
                value={selectedGroupId}
                onValueChange={(value) => {
                  setSelectedGroupId(value)
                  setSelectedSessionId("")
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona un gruppo" />
                </SelectTrigger>
                <SelectContent>
                  {groups.map((group) => (
                    <SelectItem key={group.id} value={String(group.id)}>
                      {group.name} ({group.level})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Sessione</Label>
              <Select
                value={selectedSessionId}
                onValueChange={setSelectedSessionId}
                disabled={!selectedGroupId || sessions.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={sessions.length === 0 ? "Nessuna sessione" : "Seleziona una sessione"} />
                </SelectTrigger>
                <SelectContent>
                  {sessions.map((session) => (
                    <SelectItem key={session.id} value={String(session.id)}>
                      {formatDateShort(session.session_date)} - {session.time_slot}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Sheet */}
      {selectedSessionId && selectedGroup && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Presenze: {selectedGroup.name}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {selectedSession ? `${formatDateShort(selectedSession.session_date)} - ${selectedSession.time_slot}` : "-"}
              </p>
            </div>
            <Button onClick={handleSave} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvataggio...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Salva Presenze
                </>
              )}
            </Button>
          </CardHeader>
          <CardContent>
            {groupAthletes.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nessun atleta iscritto a questo gruppo.
              </p>
            ) : (
              <div className="space-y-4">
                {groupAthletes.map((ga) => {
                  const attendance = attendanceMap[ga.athlete_id]
                  if (!attendance) return null

                  return (
                    <div
                      key={ga.id}
                      className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{ga.athlete?.full_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {ga.athlete?.email}
                        </p>
                      </div>

                      <div className="flex items-center gap-6">
                        {/* Presente */}
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id={`present-${ga.athlete_id}`}
                            checked={attendance.is_present}
                            onCheckedChange={(checked) =>
                              updateAttendance(ga.athlete_id, {
                                is_present: checked as boolean,
                                needs_recovery: checked ? false : attendance.needs_recovery,
                              })
                            }
                          />
                          <Label htmlFor={`present-${ga.athlete_id}`} className="cursor-pointer">
                            Presente
                          </Label>
                        </div>

                        {/* Da recuperare (solo se assente) */}
                        {!attendance.is_present && (
                          <div className="flex items-center gap-2">
                            <Checkbox
                              id={`recovery-${ga.athlete_id}`}
                              checked={attendance.needs_recovery}
                              onCheckedChange={(checked) =>
                                updateAttendance(ga.athlete_id, {
                                  needs_recovery: checked as boolean,
                                })
                              }
                            />
                            <Label htmlFor={`recovery-${ga.athlete_id}`} className="cursor-pointer text-red-600">
                              Da recuperare
                            </Label>
                          </div>
                        )}

                        {/* Note */}
                        <Textarea
                          placeholder="Note..."
                          value={attendance.notes}
                          onChange={(e) =>
                            updateAttendance(ga.athlete_id, { notes: e.target.value })
                          }
                          className="w-48 h-9 min-h-[36px]"
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Stats Summary */}
      {selectedSessionId && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold">
                {groupAthletes.length}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Atleti totali</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold text-green-600">
                {Object.values(attendanceMap).filter((a) => a.is_present).length}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Presenti</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold text-red-600">
                {Object.values(attendanceMap).filter((a) => !a.is_present).length}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Assenti</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold text-yellow-600">
                {Object.values(attendanceMap).filter((a) => !a.is_present && a.needs_recovery).length}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Da recuperare</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

// Import mancante
import { useEffect } from "react"
