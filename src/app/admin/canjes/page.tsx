'use client'

import React, { useState, useEffect } from 'react'
import {
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  User,
  Gift,
  RefreshCw,
  X,
  AlertTriangle,
  QrCode,
  ShieldCheck,
  Crown,
} from 'lucide-react'
import { toast } from 'sonner'
import { formatCurrency, formatPoints, formatDate } from '@/lib/utils'

export default function AdminCanjesPage() {
  const [redemptions, setRedemptions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [searchTerm, setSearchTerm] = useState('')

  // Modal Rechazar
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [selectedRedemption, setSelectedRedemption] = useState<any>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [isRejecting, setIsRejecting] = useState(false)

  // Estado de aprobación
  const [approvingId, setApprovingId] = useState<string | null>(null)

  const fetchRedemptions = () => {
    setIsLoading(true)
    let url = '/api/admin/canjes'
    if (statusFilter !== 'ALL') {
      url += `?status=${statusFilter}`
    }

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.redemptions) {
          setRedemptions(data.redemptions)
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    fetchRedemptions()
  }, [statusFilter])

  const handleApprove = async (redemption: any) => {
    if (
      !confirm(
        `¿Aprobar canje de "${redemption.reward?.name}" para ${redemption.customer?.firstName} ${redemption.customer?.lastName}?`
      )
    ) {
      return
    }

    setApprovingId(redemption.id)
    try {
      const res = await fetch(`/api/admin/canjes/${redemption.id}/aprobar`, {
        method: 'POST',
      })
      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Error al aprobar canje')
        return
      }

      toast.success(
        `¡Canje aprobado! Se generó el código de entrega: ${data.validationCode}`
      )
      fetchRedemptions()
    } catch {
      toast.error('Error de conexión')
    } finally {
      setApprovingId(null)
    }
  }

  const handleOpenReject = (redemption: any) => {
    setSelectedRedemption(redemption)
    setRejectReason('')
    setShowRejectModal(true)
  }

  const handleConfirmReject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!rejectReason.trim()) {
      toast.error('El motivo del rechazo es estrictamente obligatorio')
      return
    }

    setIsRejecting(true)
    try {
      const res = await fetch(`/api/admin/canjes/${selectedRedemption.id}/rechazar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectReason.trim() }),
      })
      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Error al rechazar canje')
        return
      }

      toast.success(
        `Canje rechazado. Se liberaron los ${selectedRedemption.pointsUsed} puntos reservados.`
      )
      setShowRejectModal(false)
      fetchRedemptions()
    } catch {
      toast.error('Error al conectar')
    } finally {
      setIsRejecting(false)
    }
  }

  const filteredRedemptions = redemptions.filter((r) => {
    if (!searchTerm) return true
    const term = searchTerm.toLowerCase()
    const name = `${r.customer?.firstName} ${r.customer?.lastName}`.toLowerCase()
    const code = (r.customer?.customerCode || '').toLowerCase()
    const rewardName = (r.reward?.name || '').toLowerCase()
    const valCode = (r.validationCode || '').toLowerCase()
    return name.includes(term) || code.includes(term) || rewardName.includes(term) || valCode.includes(term)
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Award className="w-7 h-7 text-amber-400" />
            Solicitudes de Canje de Premios
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Aprueba o rechaza solicitudes de recompensas y valida códigos de entrega física en <span className="text-amber-400 font-semibold">Luxuri Private Travel</span>.
          </p>
        </div>

        <button
          onClick={fetchRedemptions}
          className="inline-flex items-center gap-1.5 text-xs font-bold bg-[#0B0F19] border border-amber-500/20 text-slate-200 hover:text-amber-300 px-4 py-2 rounded-xl hover:bg-[#121827] shadow-lg transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
          Actualizar
        </button>
      </div>

      {/* Filtros Black & Gold */}
      <div className="bg-[#0B0F19] rounded-2xl p-4 border border-amber-500/20 shadow-xl flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por cliente, premio o código de entrega..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-[#121827] border border-amber-500/20 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          {['ALL', 'PENDING', 'APPROVED', 'COMPLETED', 'REJECTED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                statusFilter === st
                  ? 'bg-linear-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-[#121827] text-slate-300 hover:text-amber-300 hover:bg-[#1A2234] border border-amber-500/10'
              }`}
            >
              {st === 'ALL'
                ? 'Todos'
                : st === 'PENDING'
                ? 'Pendientes'
                : st === 'APPROVED'
                ? 'Aprobados'
                : st === 'COMPLETED'
                ? 'Completados'
                : 'Rechazados'}
            </button>
          ))}
        </div>
      </div>

      {/* Tabla de Solicitudes Black & Gold */}
      <div className="bg-[#0B0F19] rounded-2xl border border-amber-500/20 shadow-xl overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400 text-sm flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
            Cargando solicitudes...
          </div>
        ) : filteredRedemptions.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            No se encontraron solicitudes de canje en este estado.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm text-slate-300">
              <thead className="bg-[#121827] text-xs uppercase font-bold text-slate-400 border-b border-amber-500/10">
                <tr>
                  <th className="px-5 py-3.5">Fecha</th>
                  <th className="px-5 py-3.5">Cliente</th>
                  <th className="px-5 py-3.5">Recompensa Solicitada</th>
                  <th className="px-5 py-3.5">Puntos</th>
                  <th className="px-5 py-3.5">Código Validación</th>
                  <th className="px-5 py-3.5">Estado</th>
                  <th className="px-5 py-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-500/10">
                {filteredRedemptions.map((r) => (
                  <tr key={r.id} className="hover:bg-[#121827]/70 transition-colors">
                    <td className="px-5 py-4 text-xs text-slate-400 whitespace-nowrap">
                      {formatDate(r.requestedAt || r.createdAt)}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="font-bold text-white block">
                        {r.customer?.firstName} {r.customer?.lastName}
                      </span>
                      <span className="font-mono text-xs text-amber-400/80">
                        {r.customer?.customerCode}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-bold text-slate-200">
                      {r.reward?.name}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap font-black text-amber-400">
                      {r.pointsUsed} pts
                    </td>
                    <td className="px-5 py-4 font-mono text-xs whitespace-nowrap">
                      {r.validationCode ? (
                        <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/50 px-2.5 py-1 rounded-md font-black shadow-xs">
                          {r.validationCode}
                        </span>
                      ) : (
                        <span className="text-slate-500">-</span>
                      )}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full font-bold border ${
                          r.status === 'PENDING'
                            ? 'bg-amber-500/10 text-amber-300 border-amber-500/30 animate-pulse'
                            : r.status === 'APPROVED'
                            ? 'bg-blue-500/10 text-blue-300 border-blue-500/30'
                            : r.status === 'COMPLETED'
                            ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                            : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                        }`}
                      >
                        {r.status === 'PENDING'
                          ? 'Pendiente'
                          : r.status === 'APPROVED'
                          ? 'Aprobado (Listo)'
                          : r.status === 'COMPLETED'
                          ? 'Entregado'
                          : 'Rechazado'}
                      </span>
                      {r.rejectionReason && (
                        <span className="block text-[11px] text-rose-400 mt-1 max-w-xs truncate" title={r.rejectionReason}>
                          Motivo: {r.rejectionReason}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      {r.status === 'PENDING' && (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleApprove(r)}
                            disabled={approvingId === r.id}
                            className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-md transition-colors flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {approvingId === r.id ? 'Aprobando...' : 'Aprobar'}
                          </button>
                          <button
                            onClick={() => handleOpenReject(r)}
                            className="bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors border border-rose-500/30"
                          >
                            Rechazar
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Rechazar Canje Black & Gold */}
      {showRejectModal && selectedRedemption && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="bg-[#0B0F19] rounded-2xl max-w-md w-full p-6 shadow-2xl border border-amber-500/30 text-white">
            <div className="flex items-center justify-between pb-4 border-b border-amber-500/10">
              <h3 className="font-black text-white text-base">Rechazar Solicitud de Canje</h3>
              <button onClick={() => setShowRejectModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmReject} className="space-y-4 pt-4">
              <div className="bg-amber-500/10 p-3 rounded-xl border border-amber-500/20 text-xs text-amber-300">
                <p>
                  Al rechazar esta solicitud, los <strong>{selectedRedemption.pointsUsed} puntos</strong> reservados se devolverán de inmediato al saldo de {selectedRedemption.customer?.firstName}.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Motivo Obligatorio del Rechazo *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Explica el motivo (ej: Stock agotado en agencia, premio temporalmente no disponible, etc.)"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-[#121827] border border-amber-500/20 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRejectModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white rounded-xl hover:bg-[#121827]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isRejecting}
                  className="px-5 py-2 text-xs font-black bg-rose-600 hover:bg-rose-500 text-white rounded-xl shadow-md transition-all"
                >
                  {isRejecting ? 'Rechazando...' : 'Confirmar Rechazo y Devolver Puntos'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
