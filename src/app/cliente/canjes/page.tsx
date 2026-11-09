'use client'

import { useState, useEffect } from 'react'
import {
  TicketCheck,
  Clock,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  AlertTriangle,
  Gift,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

interface RedemptionItem {
  id: string
  pointsUsed: number
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED' | 'CANCELLED'
  requestedAt: string
  reviewedAt: string | null
  rejectionReason: string | null
  validationCode: string | null
  validatedAt: string | null
  notes: string | null
  reward: {
    id: string
    name: string
    description: string | null
    imageUrl: string | null
    pointsRequired: number
    conditions: string | null
  }
}

export default function MisCanjesPage() {
  const [redemptions, setRedemptions] = useState<RedemptionItem[]>([])
  const [loading, setLoading] = useState(true)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('ALL')

  const fetchRedemptions = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/cliente/canjes')
      if (!res.ok) throw new Error('Error al cargar canjes')
      const json = await res.json()
      if (json.success) {
        setRedemptions(json.redemptions)
      }
    } catch (err) {
      console.error(err)
      toast.error('No se pudo cargar el historial de canjes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRedemptions()
  }, [])

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    toast.success('Código de validación copiado')
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const filtered = redemptions.filter((r) => {
    if (filterStatus !== 'ALL' && r.status !== filterStatus) return false
    return true
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <Clock className="w-3.5 h-3.5" /> En Revisión
          </span>
        )
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/50 animate-pulse">
            <CheckCircle2 className="w-3.5 h-3.5" /> ¡Aprobado para Entrega!
          </span>
        )
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30">
            <ShieldCheck className="w-3.5 h-3.5" /> Premio Entregado
          </span>
        )
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
            <XCircle className="w-3.5 h-3.5" /> Solicitud Rechazada
          </span>
        )
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-400 border border-slate-700">
            Cancelado
          </span>
        )
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-20 bg-[#0B0F19] border border-amber-500/10 rounded-2xl w-full" />
        <div className="h-44 bg-[#0B0F19] border border-amber-500/10 rounded-2xl w-full" />
        <div className="h-44 bg-[#0B0F19] border border-amber-500/10 rounded-2xl w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <TicketCheck className="w-7 h-7 text-amber-400" />
            Mis Solicitudes de Canje
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Revisa el estado de tus recompensas y obtén tu código de reclamo en <span className="text-amber-400 font-semibold">Luxuri Private Travel</span>.
          </p>
        </div>

        <Link
          href="/cliente/recompensas"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-500/20 active:scale-95 transition-all self-start sm:self-auto"
        >
          <Gift className="w-4 h-4 text-slate-950" />
          <span>Nuevo Canje</span>
        </Link>
      </div>

      {/* Filtros de Estado */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'ALL', label: 'Todos' },
          { id: 'APPROVED', label: 'Aprobados' },
          { id: 'PENDING', label: 'Pendientes' },
          { id: 'COMPLETED', label: 'Entregados' },
          { id: 'REJECTED', label: 'Rechazados' },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilterStatus(f.id)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterStatus === f.id
                ? 'bg-linear-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-[#0B0F19] border border-amber-500/20 text-slate-300 hover:text-amber-300 hover:bg-[#121827]'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Listado */}
      {filtered.length === 0 ? (
        <div className="bg-[#0B0F19] rounded-2xl border border-amber-500/20 p-12 text-center">
          <TicketCheck className="w-12 h-12 text-amber-500/30 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">
            No tienes solicitudes de canje {filterStatus !== 'ALL' ? 'con este filtro' : 'aún'}
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Acumula puntos en cada viaje y cámbialos por increíbles premios de nuestro catálogo.
          </p>
          <Link
            href="/cliente/recompensas"
            className="inline-block mt-4 px-5 py-2.5 bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs shadow-lg shadow-amber-500/20 transition-all"
          >
            Explorar Catálogo de Premios
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className={`bg-[#0B0F19] rounded-2xl border shadow-xl overflow-hidden transition-all ${
                item.status === 'APPROVED'
                  ? 'border-amber-400 ring-1 ring-amber-400/40'
                  : 'border-amber-500/20'
              }`}
            >
              <div className="p-5 sm:p-6 space-y-4">
                {/* Cabecera de la solicitud */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-500/10 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                      <Gift className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
                        {item.reward?.name}
                      </h3>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3.5 h-3.5 text-amber-400/70" />
                        Solicitado el{' '}
                        {new Date(item.requestedAt).toLocaleDateString('es-PE', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-start sm:self-auto">
                    <span className="text-sm font-black text-amber-400 bg-amber-500/10 px-3 py-1 rounded-lg border border-amber-500/20">
                      {item.pointsUsed.toLocaleString()} PTS
                    </span>
                    {getStatusBadge(item.status)}
                  </div>
                </div>

                {/* Si está APROBADO: Caja VIP del Código de Validación */}
                {item.status === 'APPROVED' && (
                  <div className="rounded-2xl bg-linear-to-r from-emerald-950/60 via-slate-900 to-emerald-950/60 border-2 border-emerald-400/70 p-5 text-center sm:text-left flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg shadow-emerald-500/10">
                    <div className="space-y-1">
                      <span className="text-[11px] font-black uppercase tracking-widest text-emerald-400 flex items-center justify-center sm:justify-start gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" /> Código de Validación para Reclamar
                      </span>
                      <p className="text-xs text-slate-300">
                        Presenta este código al personal de Luxuri Private Travel para recibir tu recompensa:
                      </p>
                      <p className="font-mono text-2xl sm:text-3xl font-black text-emerald-300 tracking-widest pt-1 drop-shadow-md">
                        {item.validationCode || 'VAL-EN-PROCESO'}
                      </p>
                    </div>

                    {item.validationCode && (
                      <button
                        onClick={() => copyCode(item.validationCode!)}
                        className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-emerald-600/30 active:scale-95 transition-all flex items-center justify-center gap-2 self-center sm:self-auto shrink-0"
                      >
                        {copiedCode === item.validationCode ? (
                          <>
                            <Check className="w-4 h-4" />
                            <span>¡Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            <span>Copiar Código</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                )}

                {/* Si fue RECHAZADO: Motivo de rechazo */}
                {item.status === 'REJECTED' && (
                  <div className="rounded-xl bg-rose-950/40 border border-rose-500/30 p-4 flex gap-3 text-xs text-rose-300">
                    <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-rose-200">Motivo del rechazo:</p>
                      <p className="mt-0.5 text-rose-300/90">
                        {item.rejectionReason || 'No se especificó un motivo. Tus puntos han sido devueltos a tu cuenta.'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Si está PENDIENTE: Mensaje de espera */}
                {item.status === 'PENDING' && (
                  <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-3.5 flex gap-2.5 text-xs text-amber-300">
                    <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>
                      Tus puntos están temporalmente reservados. El equipo administrativo de Luxuri revisará tu solicitud
                      en breve y te generará el código de canje correspondiente.
                    </span>
                  </div>
                )}

                {/* Si está COMPLETADO: Información de entrega */}
                {item.status === 'COMPLETED' && (
                  <div className="rounded-xl bg-blue-500/10 border border-blue-500/20 p-3.5 flex gap-2.5 text-xs text-blue-300">
                    <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                    <span>
                      ¡Premio entregado satisfactoriamente! Gracias por viajar con Luxuri Private Travel.
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
