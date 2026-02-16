import { useState } from "react"
import { usePayments, usePaymentStats, getPaymentStatusColor, getPaymentStatusLabel, formatCurrency, getSemaphoreVariant, calculateProgress } from "@/hooks/usePayments"
import { useAllProfiles } from "@/hooks/useProfile"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Loader2, Plus } from "lucide-react"

const PAYMENT_METHODS = [
  { value: "cash", label: "Contanti" },
  { value: "bank_transfer", label: "Bonifico" },
  { value: "card", label: "Carta" },
  { value: "check", label: "Assegno" },
]

export function PaymentsPage() {
  const currentYear = new Date().getFullYear().toString()
  const [season, setSeason] = useState(currentYear)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPayment, setSelectedPayment] = useState<ReturnType<typeof usePayments>["payments"][0] | null>(null)
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false)
  const [transactionAmount, setTransactionAmount] = useState("")
  const [transactionMethod, setTransactionMethod] = useState("cash")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { payments, isLoading, addTransaction } = usePayments(undefined, season)
  const { stats } = usePaymentStats(season)
  useAllProfiles() // prefetch profiles

  const filteredPayments = payments.filter(
    (p) =>
      p.athlete?.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.athlete?.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleAddTransaction = async () => {
    if (!selectedPayment || !transactionAmount) return

    setIsSubmitting(true)
    try {
      await addTransaction({
        payment_id: selectedPayment.id,
        amount: parseFloat(transactionAmount),
        method: transactionMethod,
      })

      setIsTransactionDialogOpen(false)
      setTransactionAmount("")
      setSelectedPayment(null)
    } catch (error) {
      alert("Errore: " + (error instanceof Error ? error.message : "Errore"))
    } finally {
      setIsSubmitting(false)
    }
  }

  const openTransactionDialog = (payment: typeof selectedPayment) => {
    setSelectedPayment(payment)
    setTransactionAmount(payment ? String(payment.balance_due) : "")
    setIsTransactionDialogOpen(true)
  }

  return (
    <div className="py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Gestione Pagamenti</h1>
          <p className="text-muted-foreground">Monitoraggio quote stagionali</p>
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Cerca atleta..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64"
            
          />
          <Select value={season} onValueChange={setSeason}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={currentYear}>{currentYear}</SelectItem>
              <SelectItem value={String(parseInt(currentYear) - 1)}>
                {parseInt(currentYear) - 1}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-3xl font-bold text-green-600">
                {stats.paidCount}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Pagati</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-3xl font-bold text-yellow-600">
                {stats.partialCount}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Parziali</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-3xl font-bold text-red-600">
                {stats.overdueCount}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">In ritardo</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-3xl font-bold">
                {formatCurrency(stats.collectedAmount)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                di {formatCurrency(stats.totalAmount)}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Global Progress */}
      {stats && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Avanzamento riscossioni</span>
              <span className="text-sm text-muted-foreground">
                {calculateProgress(stats.collectedAmount, stats.totalAmount)}%
              </span>
            </div>
            <Progress
              value={calculateProgress(stats.collectedAmount, stats.totalAmount)}
              className="h-2"
            />
          </CardContent>
        </Card>
      )}

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Elenco Pagamenti</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : filteredPayments.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nessun pagamento trovato.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Atleta</TableHead>
                    <TableHead>Stato</TableHead>
                    <TableHead>Quota Stagione</TableHead>
                    <TableHead>Quota Assoc.</TableHead>
                    <TableHead>Pagato</TableHead>
                    <TableHead>Saldo</TableHead>
                    <TableHead>Progresso</TableHead>
                    <TableHead className="text-right">Azioni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment) => {
                    const total = payment.total_season_fee + payment.association_fee
                    const progress = calculateProgress(payment.amount_paid, total)

                    return (
                      <TableRow key={payment.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{payment.athlete?.full_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {payment.athlete?.email}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={getSemaphoreVariant(payment.status)}
                            className={getPaymentStatusColor(payment.status)}
                          >
                            {getPaymentStatusLabel(payment.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatCurrency(payment.total_season_fee)}</TableCell>
                        <TableCell>{formatCurrency(payment.association_fee)}</TableCell>
                        <TableCell className="text-green-600">
                          {formatCurrency(payment.amount_paid)}
                        </TableCell>
                        <TableCell className={payment.balance_due > 0 ? "text-red-600" : ""}>
                          {formatCurrency(payment.balance_due)}
                        </TableCell>
                        <TableCell>
                          <div className="w-24">
                            <Progress value={progress} className="h-2" />
                            <span className="text-xs text-muted-foreground">{progress}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {payment.balance_due > 0 && (
                            <Button
                              size="sm"
                              onClick={() => openTransactionDialog(payment)}
                            >
                              <Plus className="mr-1 h-3 w-3" />
                              Pagamento
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transaction Dialog */}
      <Dialog open={isTransactionDialogOpen} onOpenChange={setIsTransactionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registra Pagamento</DialogTitle>
            <DialogDescription>
              {selectedPayment && (
                <>
                  Atleta: <strong>{selectedPayment.athlete?.full_name}</strong>
                  <br />
                  Saldo dovuto: <strong>{formatCurrency(selectedPayment.balance_due)}</strong>
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Importo (€)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={transactionAmount}
                onChange={(e) => setTransactionAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label>Metodo di pagamento</Label>
              <Select value={transactionMethod} onValueChange={setTransactionMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((method) => (
                    <SelectItem key={method.value} value={method.value}>
                      {method.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsTransactionDialogOpen(false)}
            >
              Annulla
            </Button>
            <Button
              onClick={handleAddTransaction}
              disabled={isSubmitting || !transactionAmount}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvataggio...
                </>
              ) : (
                "Registra Pagamento"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
