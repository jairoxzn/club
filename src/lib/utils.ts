import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string | null): string {
  if (!date) return '-'
  return format(new Date(date), 'dd/MM/yyyy', { locale: es })
}

export function formatDateTime(date: Date | string | null): string {
  if (!date) return '-'
  return format(new Date(date), 'dd/MM/yyyy HH:mm', { locale: es })
}

export function formatRelativeTime(date: Date | string | null): string {
  if (!date) return '-'
  return formatDistanceToNow(new Date(date), { locale: es, addSuffix: true })
}

export function formatPoints(points: number): string {
  return new Intl.NumberFormat('es-PE').format(points)
}

export function formatCurrency(amount: number | string, currency = 'PEN'): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(num)
}

export function formatPhone(phone: string): string {
  if (!phone) return ''
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 9) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`
  }
  return phone
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PENDING: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    COMPLETED: 'text-green-600 bg-green-50 border-green-200',
    CANCELLED: 'text-gray-600 bg-gray-50 border-gray-200',
    APPROVED: 'text-blue-600 bg-blue-50 border-blue-200',
    REJECTED: 'text-red-600 bg-red-50 border-red-200',
    ACTIVE: 'text-green-600 bg-green-50 border-green-200',
    INACTIVE: 'text-gray-600 bg-gray-50 border-gray-200',
    BLOCKED: 'text-red-600 bg-red-50 border-red-200',
  }
  return colors[status] ?? 'text-gray-600 bg-gray-50 border-gray-200'
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    PENDING: 'Pendiente',
    COMPLETED: 'Completado',
    CANCELLED: 'Cancelado',
    APPROVED: 'Aprobado',
    REJECTED: 'Rechazado',
    ACTIVE: 'Activo',
    INACTIVE: 'Inactivo',
    BLOCKED: 'Bloqueado',
    EARNED: 'Puntos ganados',
    REDEEMED: 'Puntos canjeados',
    ADJUSTMENT_POS: 'Ajuste positivo',
    ADJUSTMENT_NEG: 'Ajuste negativo',
    RESERVED: 'Reserva',
    RELEASED: 'Liberación',
    EXPIRED: 'Vencido',
    REVERSAL: 'Reversión',
  }
  return labels[status] ?? status
}
