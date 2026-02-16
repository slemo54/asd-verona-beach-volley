import { useState } from "react"
import { useGroups, type GroupWithDetails } from "@/hooks/useGroups"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { GroupForm } from "@/components/admin/GroupForm"
import { Loader2, Plus, Users, Calendar, Clock, Edit, Trash2 } from "lucide-react"
import { getLevelLabel, getCategoryLabel, getLevelColor } from "@/hooks/useTrainingSessions"

const DAYS_OF_WEEK = ["", "Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì"]

export function GroupsPage() {
  const { groups, isLoading, error, createGroup, updateGroup, deleteGroup } = useGroups()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingGroup, setEditingGroup] = useState<GroupWithDetails | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleCreate = async (data: Parameters<typeof createGroup>[0]) => {
    setIsSubmitting(true)
    try {
      await createGroup(data)
      setIsFormOpen(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdate = async (data: Parameters<typeof updateGroup>[1]) => {
    if (!editingGroup) return
    setIsSubmitting(true)
    try {
      await updateGroup(editingGroup.id, data)
      setEditingGroup(null)
      setIsFormOpen(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (group: GroupWithDetails) => {
    if (!confirm(`Sei sicuro di voler eliminare il gruppo "${group.name}"?`)) {
      return
    }
    try {
      await deleteGroup(group.id)
    } catch (err) {
      alert("Errore durante l'eliminazione: " + (err instanceof Error ? err.message : "Errore sconosciuto"))
    }
  }

  const openEditForm = (group: GroupWithDetails) => {
    setEditingGroup(group)
    setIsFormOpen(true)
  }

  const openCreateForm = () => {
    setEditingGroup(null)
    setIsFormOpen(true)
  }

  const closeForm = () => {
    setIsFormOpen(false)
    setEditingGroup(null)
  }

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
        <p className="text-red-500">Errore nel caricamento dei gruppi: {error.message}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Riprova
        </Button>
      </div>
    )
  }

  return (
    <div className="py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gestione Gruppi</h1>
          <p className="text-muted-foreground">
            {groups.length} gruppi di allenamento attivi
          </p>
        </div>
        <Button onClick={openCreateForm}>
          <Plus className="mr-2 h-4 w-4" />
          Nuovo Gruppo
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-3xl font-bold">{groups.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Gruppi Totali</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-3xl font-bold">
              {groups.filter((g) => g.macro_category === "male").length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Gruppi Maschili</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-3xl font-bold">
              {groups.filter((g) => g.macro_category === "female").length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Gruppi Femminili</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-3xl font-bold">
              {groups.reduce((acc, g) => acc + (g.athlete_count || 0), 0)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Atleti Iscritti</p>
          </CardContent>
        </Card>
      </div>

      {/* Groups Table */}
      <Card>
        <CardHeader>
          <CardTitle>Elenco Gruppi</CardTitle>
        </CardHeader>
        <CardContent>
          {groups.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>Nessun gruppo creato.</p>
              <Button onClick={openCreateForm} variant="outline" className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Crea il primo gruppo
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Livello</TableHead>
                    <TableHead>Giorno/Orario</TableHead>
                    <TableHead>Atleti</TableHead>
                    <TableHead className="text-right">Azioni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groups.map((group) => (
                    <TableRow key={group.id}>
                      <TableCell className="font-medium">{group.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getCategoryLabel(group.macro_category)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getLevelColor(group.level)}>
                          {getLevelLabel(group.level)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span className="flex items-center text-sm">
                            <Calendar className="mr-1 h-3 w-3" />
                            {DAYS_OF_WEEK[group.day_of_week]}
                          </span>
                          <span className="flex items-center text-sm text-muted-foreground">
                            <Clock className="mr-1 h-3 w-3" />
                            {group.time_slot}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="flex items-center">
                          <Users className="mr-1 h-4 w-4 text-muted-foreground" />
                          {group.athlete_count || 0}/{group.max_athletes}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditForm(group)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(group)}
                            className="text-red-500 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Group Form Modal */}
      <GroupForm
        group={editingGroup}
        isOpen={isFormOpen}
        onClose={closeForm}
        onSubmit={editingGroup ? handleUpdate : handleCreate}
        isLoading={isSubmitting}
      />
    </div>
  )
}
