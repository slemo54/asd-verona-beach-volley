import { useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { useCertificates, getCertificateStatusColor, getCertificateStatusLabel } from "@/hooks/useCertificates"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2, Upload, FileText, AlertTriangle } from "lucide-react"
import { formatDate } from "@/lib/utils"

export function CertificatesPage() {
  const { user } = useAuth()
  const { certificates, uploadCertificate } = useCertificates(user?.id)
  const [isUploading, setIsUploading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [certType, setCertType] = useState<"agonistico" | "non_agonistico">("non_agonistico")
  const [expiryDate, setExpiryDate] = useState("")

  const handleUpload = async () => {
    if (!file || !user?.id || !expiryDate) return
    setIsUploading(true)
    try {
      await uploadCertificate(file, {
        athlete_id: user.id,
        type: certType,
        expiry_date: expiryDate,
      })
      setFile(null)
      setExpiryDate("")
      alert("Certificato caricato con successo!")
    } catch (error) {
      alert("Errore durante il caricamento")
    } finally {
      setIsUploading(false)
    }
  }

  const latestCertificate = certificates[0]

  return (
    <div className="py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Certificato Medico</h1>
        <p className="text-muted-foreground">Gestisci il tuo certificato medico sportivo</p>
      </div>

      {/* Status Card */}
      {latestCertificate && (
        <Card className={latestCertificate.status === "expired" ? "border-red-500" : ""}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Stato Certificato</CardTitle>
              <Badge className={getCertificateStatusColor(latestCertificate.status)}>
                {getCertificateStatusLabel(latestCertificate.status)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <FileText className="h-10 w-10 text-muted-foreground" />
              <div>
                <p className="font-medium">Tipo: {latestCertificate.type === "agonistico" ? "Agonistico" : "Non agonistico"}</p>
                <p className="text-sm text-muted-foreground">
                  Scadenza: {formatDate(latestCertificate.expiry_date)}
                </p>
              </div>
            </div>
            {latestCertificate.status === "expired" && (
              <div className="flex items-center gap-2 p-4 bg-red-50 text-red-700 rounded-lg">
                <AlertTriangle className="h-5 w-5" />
                <p className="text-sm">Il tuo certificato è scaduto. Carica un nuovo certificato per continuare ad allenarti.</p>
              </div>
            )}
            {latestCertificate.status === "expiring" && (
              <div className="flex items-center gap-2 p-4 bg-yellow-50 text-yellow-700 rounded-lg">
                <AlertTriangle className="h-5 w-5" />
                <p className="text-sm">Il tuo certificato scadrà a breve. Ricorda di rinnovarlo.</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Upload Form */}
      <Card>
        <CardHeader>
          <CardTitle>Carica Nuovo Certificato</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Tipo Certificato</Label>
            <Select value={certType} onValueChange={(v) => setCertType(v as typeof certType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="non_agonistico">Non Agonistico</SelectItem>
                <SelectItem value="agonistico">Agonistico</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Data Scadenza</Label>
            <Input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>File Certificato (PDF/JPG/PNG)</Label>
            <Input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </div>

          <Button
            onClick={handleUpload}
            disabled={isUploading || !file || !expiryDate}
            className="w-full"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Caricamento...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Carica Certificato
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* History */}
      {certificates.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Cronologia Certificati</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {certificates.slice(1).map((cert) => (
                <div key={cert.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{cert.type === "agonistico" ? "Agonistico" : "Non agonistico"}</p>
                    <p className="text-sm text-muted-foreground">
                      Scadenza: {formatDate(cert.expiry_date)}
                    </p>
                  </div>
                  <Badge className={getCertificateStatusColor(cert.status)}>
                    {getCertificateStatusLabel(cert.status)}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
