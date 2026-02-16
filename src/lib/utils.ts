import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combina classi Tailwind in modo intelligente, risolvendo i conflitti
 * @param inputs - Classi CSS da combinare
 * @returns Stringa di classi CSS unite e deduplicate
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formatta una data in formato italiano
 * @param date - Data da formattare
 * @returns Stringa formattata (es: "13 febbraio 2026")
 */
export function formatDate(date: Date | string | number): string {
  const d = new Date(date)
  return d.toLocaleDateString("it-IT", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

/**
 * Formatta una data in formato breve italiano
 * @param date - Data da formattare
 * @returns Stringa formattata (es: "13/02/2026")
 */
export function formatDateShort(date: Date | string | number): string {
  const d = new Date(date)
  return d.toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

/**
 * Formatta un importo in euro
 * @param amount - Importo in centesimi o euro
 * @param inCents - Se true, amount è in centesimi
 * @returns Stringa formattata (es: "480,00 €")
 */
export function formatCurrency(amount: number, inCents = false): string {
  const euros = inCents ? amount / 100 : amount
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
  }).format(euros)
}

/**
 * Tronca una stringa se supera la lunghezza massima
 * @param str - Stringa da troncare
 * @param maxLength - Lunghezza massima
 * @returns Stringa troncata con "..." se necessario
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength - 3) + "..."
}

/**
 * Genera le iniziali da un nome completo
 * @param name - Nome completo
 * @returns Iniziali (es: "Mario Rossi" -> "MR")
 */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

/**
 * Verifica se una data è scaduta
 * @param date - Data da verificare
 * @returns true se la data è passata
 */
export function isExpired(date: Date | string | number): boolean {
  const expiryDate = new Date(date)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return expiryDate < today
}

/**
 * Verifica se una data scade entro N giorni
 * @param date - Data da verificare
 * @param days - Numero di giorni
 * @returns true se la data scade entro N giorni
 */
export function expiresWithin(date: Date | string | number, days: number): boolean {
  const expiryDate = new Date(date)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diffTime = expiryDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays <= days && diffDays >= 0
}

/**
 * Genera un ID univoco semplice
 * @returns ID univoco
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}
