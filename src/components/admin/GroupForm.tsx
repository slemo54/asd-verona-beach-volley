import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import type { GroupFormData } from "@/hooks/useGroups"
import type { Group } from "@/types/database"

interface GroupFormProps {
  group?: Group | null
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: GroupFormData) => Promise<void>
  isLoading?: boolean
}

const DAYS_OF_WEEK = [
  { value: "1", label: "Lunedì" },
  { value: "2", label: "Martedì" },
  { value: "3", label: "Mercoledì" },
  { value: "4", label: "Giovedì" },
  { value: "5", label: "Venerdì" },
]

const TIME_SLOTS = [
  { value: "18:30-20:00", label: "18:30 - 20:00" },
  { value: "20:00-21:30", label: "20:00 - 21:30" },
]

const LEVELS = [
  { value: "base", label: "Base" },
  { value: "medium", label: "Medio" },
  { value: "pro", label: "Pro" },
]

const CATEGORIES = [
  { value: "male", label: "Maschile" },
  { value: "female", label: "Femminile" },
]

export function GroupForm({
  group,
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}: GroupFormProps) {
  const [formData, setFormData] = useState<GroupFormData>({
    name: group?.name || "",
    macro_category: (group?.macro_category as "male" | "female") || "male",
    level: (group?.level as "base" | "medium" | "pro") || "base",
    day_of_week: group?.day_of_week || 1,
    time_slot: (group?.time_slot as "18:30-20:00" | "20:00-21:30") || "18:30-20:00",
    max_athletes: group?.max_athletes || 12,
    coach_id: group?.coach_id || null,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(formData)
    if (!group) {
      // Reset form se è una creazione
      setFormData({
        name: "",
        macro_category: "male",
        level: "base",
        day_of_week: 1,
        time_slot: "18:30-20:00",
        max_athletes: 12,
        coach_id: null,
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {group ? "Modifica Gruppo" : "Nuovo Gruppo"}
          </DialogTitle>
          <DialogDescription>
            {group
              ? "Modifica i dettagli del gruppo di allenamento."
              : "Crea un nuovo gruppo di allenamento."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome Gruppo</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="es. U18 Femminile Base"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select
                value={formData.macro_category}
                onValueChange={(value: "male" | "female") =>
                  setFormData((prev) => ({ ...prev, macro_category: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Livello</Label>
              <Select
                value={formData.level}
                onValueChange={(value: "base" | "medium" | "pro") =>
                  setFormData((prev) => ({ ...prev, level: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LEVELS.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Giorno</Label>
              <Select
                value={String(formData.day_of_week)}
                onValueChange={(value: string) =>
                  setFormData((prev) => ({ ...prev, day_of_week: parseInt(value) }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DAYS_OF_WEEK.map((day) => (
                    <SelectItem key={day.value} value={day.value}>
                      {day.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Orario</Label>
              <Select
                value={formData.time_slot}
                onValueChange={(value: "18:30-20:00" | "20:00-21:30") =>
                  setFormData((prev) => ({ ...prev, time_slot: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIME_SLOTS.map((slot) => (
                    <SelectItem key={slot.value} value={slot.value}>
                      {slot.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="max_athletes">Numero Massimo Atleti</Label>
            <Input
              id="max_athletes"
              type="number"
              min={1}
              max={30}
              value={formData.max_athletes}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  max_athletes: parseInt(e.target.value) || 12,
                }))
              }
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Annulla
            </Button>
            <Button type="submit" disabled={isLoading || !formData.name}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvataggio...
                </>
              ) : group ? (
                "Salva Modifiche"
              ) : (
                "Crea Gruppo"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
