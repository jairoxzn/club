'use client'

import { useState, useEffect } from 'react'
import {
  Gift,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  Search,
  Filter,
  ArrowRight,
  ShieldAlert,
  Loader2,
  X,
  Compass,
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

interface RewardItem {
  id: string
  name: string
  description: string | null
  imageUrl: string | null
  pointsRequired: number
  stock: number | null
  hasStock: boolean
  startDate: string | null
  endDate: string | null
  conditions: string | null
  canRedeem: boolean
  missingPoints: number
}

export default function RecompensasPage() {
  const [rewards, setRewards] = useState<RewardItem[]>([])
  const [availablePoints, setAvailablePoints] = useState(0)
  const [loading, setLoading] = useState(true)
  const [filterOnlyRedeemable, setFilterOnlyRedeemable] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedReward, setSelectedReward] = useState<RewardItem | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const fetchRewards = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/cliente/recompensas')
      if (!res.ok) throw new Error('Error al cargar catálogo')
      const json = await res.json()
      if (json.success) {
        setRewards(json.rewards)
        setAvailablePoints(json.availablePoints)
      }
    } catch (err) {
      console.error(err)
      toast.error('No se pudo cargar el catálogo de recompensas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRewards()
  }, [])

  const handleRedeem = async () => {
    if (!selectedReward) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/cliente/canjes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rewardId: selectedReward.id }),
      })

      const json = await res.json()
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'No se pudo procesar la solicitud de canje')
      }

      toast.success('¡Solicitud de canje enviada con éxito!')
      setSelectedReward(null)
      await fetchRewards()
    } catch (err: any) {
      toast.error(err.message || 'Error al solicitar canje')
    } finally {
      setSubmitting(false)
    }
  }

  const filteredRewards = rewards.filter((r) => {
    if (filterOnlyRedeemable && !r.canRedeem) return false
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase()
      const matchName = r.name.toLowerCase().includes(q)
      const matchDesc = r.description?.toLowerCase().includes(q)
      if (!matchName && !matchDesc) return false
    }
    return true
  })

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-20 bg-[#0B0F19] border border-amber-500/10 rounded-2xl w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-80 bg-[#0B0F19] border border-amber-500/10 rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Encabezado y Saldo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Gift className="w-7 h-7 text-amber-400" />
            Catálogo de Recompensas
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Elige tu premio exclusivo y canjéalo con tus puntos en <span className="text-amber-400 font-semibold">Luxuri Private Travel</span>.
          </p>
        </div>

        <div className="bg-[#0B0F19] border border-amber-500/20 rounded-2xl px-4 py-2.5 flex items-center gap-3 shadow-lg shrink-0">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 fill-amber-400" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Tus Puntos Disponibles
            </p>
            <p className="text-xl font-black text-amber-400 leading-none mt-0.5">
              {availablePoints.toLocaleString()} <span className="text-xs font-bold text-amber-200">PTS</span>
            </p>
          </div>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="bg-[#0B0F19] p-4 rounded-2xl border border-amber-500/20 shadow-lg flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterOnlyRedeemable(!filterOnlyRedeemable)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              filterOnlyRedeemable
                ? 'bg-linear-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-[#121827] text-slate-300 hover:text-amber-300 border border-amber-500/10'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Solo Canjeables con mis Puntos
          </button>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar premio..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-3 py-2 text-xs bg-[#121827] border border-amber-500/20 rounded-xl w-full sm:w-64 text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
          />
        </div>
      </div>

      {/* Grid de Recompensas */}
      {filteredRewards.length === 0 ? (
        <div className="bg-[#0B0F19] rounded-2xl border border-amber-500/20 p-12 text-center">
          <Gift className="w-12 h-12 text-amber-500/30 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">
            No se encontraron recompensas
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {filterOnlyRedeemable
              ? 'No tienes puntos suficientes para los premios actuales o no hay premios disponibles con tu saldo.'
              : 'No hay recompensas que coincidan con tu búsqueda.'}
          </p>
          {filterOnlyRedeemable && (
            <button
              onClick={() => setFilterOnlyRedeemable(false)}
              className="mt-4 px-4 py-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl text-xs font-bold hover:bg-amber-500/20"
            >
              Ver todas las recompensas
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRewards.map((reward) => (
            <div
              key={reward.id}
              className={`bg-[#0B0F19] rounded-2xl border transition-all flex flex-col justify-between overflow-hidden shadow-xl hover:shadow-amber-500/5 ${
                reward.canRedeem
                  ? 'border-amber-400/40 hover:border-amber-400'
                  : 'border-amber-500/15 opacity-90'
              }`}
            >
              {/* Imagen o Banner */}
              <div className="relative h-44 bg-[#070A11] flex items-center justify-center overflow-hidden border-b border-amber-500/10">
                {reward.imageUrl ? (
                  <img
                    src={reward.imageUrl}
                    alt={reward.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-amber-400/40">
                    <Gift className="w-12 h-12 mb-1 text-amber-400/60" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400/70">
                      Recompensa Exclusiva
                    </span>
                  </div>
                )}

                {/* Badge de Puntos Requeridos */}
                <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-slate-950/90 backdrop-blur-md text-amber-400 text-xs font-black shadow-lg flex items-center gap-1 border border-amber-400/30">
                  <Sparkles className="w-3.5 h-3.5 fill-amber-400" />
                  {reward.pointsRequired.toLocaleString()} PTS
                </div>

                {/* Stock Badge */}
                <div className="absolute bottom-3 left-3">
                  {!reward.hasStock ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-600/90 text-white shadow-xs">
                      Agotado
                    </span>
                  ) : reward.stock !== null ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-950/80 text-amber-300 backdrop-blur-xs border border-amber-500/20">
                      {reward.stock} disponibles
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-600/90 text-white shadow-xs">
                      Stock disponible
                    </span>
                  )}
                </div>
              </div>

              {/* Contenido */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h3 className="font-extrabold text-white text-base leading-snug">
                    {reward.name}
                  </h3>
                  {reward.description && (
                    <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                      {reward.description}
                    </p>
                  )}

                  {reward.conditions && (
                    <p className="text-[11px] text-amber-400/70 italic pt-1">
                      * {reward.conditions}
                    </p>
                  )}
                </div>

                {/* Botón de Canje o Estado de Puntos */}
                <div className="pt-2 border-t border-amber-500/10">
                  {reward.canRedeem ? (
                    <button
                      onClick={() => setSelectedReward(reward)}
                      className="w-full py-2.5 rounded-xl bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-500/20 active:scale-98 transition-all flex items-center justify-center gap-1.5"
                    >
                      <Gift className="w-4 h-4 text-slate-950" />
                      <span>Solicitar Canje</span>
                    </button>
                  ) : !reward.hasStock ? (
                    <button
                      disabled
                      className="w-full py-2.5 rounded-xl bg-[#121827] text-slate-500 font-bold text-xs cursor-not-allowed border border-amber-500/10"
                    >
                      Premio Agotado
                    </button>
                  ) : (
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[11px] text-slate-400 font-medium">
                        <span>Te faltan {reward.missingPoints.toLocaleString()} pts</span>
                        <span className="text-amber-400 font-bold">
                          {Math.round((availablePoints / reward.pointsRequired) * 100)}%
                        </span>
                      </div>
                      <div className="w-full bg-[#121827] rounded-full h-1.5 overflow-hidden border border-amber-500/10">
                        <div
                          className="bg-linear-to-r from-amber-500 to-amber-400 h-1.5 rounded-full"
                          style={{
                            width: `${Math.min(100, (availablePoints / reward.pointsRequired) * 100)}%`,
                          }}
                        />
                      </div>
                      <button
                        disabled
                        className="w-full mt-2 py-2 rounded-xl bg-[#121827] text-slate-500 font-semibold text-xs cursor-not-allowed border border-amber-500/10"
                      >
                        Puntos Insuficientes
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Confirmación de Canje Black & Gold */}
      {selectedReward && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#0B0F19] border border-amber-500/30 rounded-3xl p-6 sm:p-7 space-y-5 shadow-2xl relative text-white">
            <button
              onClick={() => setSelectedReward(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-[#121827]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-1">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-2 shadow-lg">
                <Gift className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-black text-white">
                Confirmar Solicitud de Canje
              </h3>
              <p className="text-xs text-slate-400">
                Verifica los detalles antes de solicitar tu recompensa.
              </p>
            </div>

            {/* Resumen */}
            <div className="bg-[#121827] rounded-2xl p-4 border border-amber-500/20 space-y-3">
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase">Recompensa</p>
                <p className="text-sm font-bold text-white">{selectedReward.name}</p>
              </div>

              <div className="pt-2 border-t border-amber-500/10 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400">Puntos a utilizar:</span>
                  <p className="font-extrabold text-amber-400">
                    -{selectedReward.pointsRequired.toLocaleString()} pts
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">Saldo restante:</span>
                  <p className="font-bold text-slate-200">
                    {(availablePoints - selectedReward.pointsRequired).toLocaleString()} pts
                  </p>
                </div>
              </div>
            </div>

            <div className="text-xs text-amber-300/90 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex gap-2">
              <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                Tu solicitud pasará a estado <strong>Pendiente de Aprobación</strong>. Una vez
                aprobada por Luxuri, recibirás un <strong>Código de Validación</strong> para reclamar tu premio.
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedReward(null)}
                disabled={submitting}
                className="py-2.5 rounded-xl border border-amber-500/20 text-slate-300 font-bold text-xs sm:text-sm hover:bg-[#121827] transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleRedeem}
                disabled={submitting}
                className="py-2.5 rounded-xl bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Procesando...</span>
                  </>
                ) : (
                  <span>Confirmar Canje</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
