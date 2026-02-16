import { useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { useBookings, TIME_SLOTS, COURT_NAMES } from "@/hooks/useBookings"
import { useProfile } from "@/hooks/useProfile"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatDateShort } from "@/lib/utils"
import { Calendar, MapPin, AlertCircle } from "lucide-react"

const isSaturday = (date: string) => new Date(date).getDay() === 6

export function BookingPage() {
  const { user } = useAuth()
  const { profile } = useProfile(user?.id)
  const [selectedDate, setSelectedDate] = useState("")
  const { bookings, createBooking, cancelBooking } = useBookings(selectedDate)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleBooking = async (courtName: string, timeSlot: string) => {
    if (!user?.id || !selectedDate) return
    setIsSubmitting(true)
    try {
      await createBooking({
        court_name: courtName,
        booking_date: selectedDate,
        time_slot: timeSlot,
        booked_by: user.id,
        status: "confirmed",
        notes: null,
      })
      alert("Prenotazione confermata!")
    } catch (error) {
      alert("Errore durante la prenotazione")
    } finally {
      setIsSubmitting(false)
    }
  }

  const isSlotBooked = (courtName: string, timeSlot: string) => {
    return bookings.some(
      (b) => b.court_name === courtName && b.time_slot === timeSlot && b.status === "confirmed"
    )
  }

  const myBookings = bookings.filter((b) => b.booked_by === user?.id && b.status === "confirmed")

  return (
    <div className="py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Prenotazione Campi</h1>
        <p className="text-muted-foreground">Prenota un campo per il sabato</p>
      </div>

      {/* Moroso Warning */}
      {profile?.is_moroso && (
        <div className="flex items-center gap-2 p-4 bg-red-50 text-red-700 rounded-lg">
          <AlertCircle className="h-5 w-5" />
          <p className="text-sm">Non puoi prenotare campi perché risulti moroso. Contatta la segreteria.</p>
        </div>
      )}

      {/* Date Selection */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <Label>Seleziona Data (Solo Sabato)</Label>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
            />
            {selectedDate && !isSaturday(selectedDate) && (
              <p className="text-sm text-red-600">Seleziona un sabato</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Booking Grid */}
      {selectedDate && isSaturday(selectedDate) && !profile?.is_moroso && (
        <div className="space-y-4">
          {COURT_NAMES.map((court) => (
            <Card key={court}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  {court}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {TIME_SLOTS.map((slot) => {
                    const booked = isSlotBooked(court, slot)
                    return (
                      <Button
                        key={slot}
                        variant={booked ? "secondary" : "outline"}
                        disabled={booked || isSubmitting}
                        onClick={() => handleBooking(court, slot)}
                        className={booked ? "opacity-50" : ""}
                      >
                        {booked ? "Occupato" : slot}
                      </Button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* My Bookings */}
      {myBookings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Le Mie Prenotazioni</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {myBookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{booking.court_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDateShort(booking.booking_date)} - {booking.time_slot}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => cancelBooking(booking.id)}
                  >
                    Annulla
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
