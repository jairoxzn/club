'use client'

import { useState, useEffect } from 'react'
import {
  Coins,
  Sparkles,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  Clock,
  Filter,
  Search,
  CheckCircle2,
  Lock,
  Gift,
  RefreshCw,
} from 'lucide-react'
import { toast } from 'sonner'

interface PuntosData {
  points: {
    available: number
    total: number
    reserved: number
    redeemed: number
  }
  transactions: Array<{
    id: string
    type: string
    amount: number
    balanceBefore: number
    balanceAfter: number
    description: string
    createdAt: string
    service?: {
      id: string
      amount: number
      serviceDate: string
      referenceNumber: string | null
      category: {
        name: string
        color: string | null
      }
    } | null
    redemption?: {
      id: string
      status: string
      reward: {
        id: string
        name: string
      }
    } | null
  }>
}

export default function MisPuntosPage() {
  const [data, setData] = useState<PuntosData | null>(null)
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  const fetchPuntos = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/cliente/puntos')
      if (!res.ok) throw new Error('Error al cargar puntos')
      const json = await res.json()
      if (json.success) {
        setData(json)
      }
    } catch (err) {
      console.error(err)
      toast.error('No se pudo cargar el desglose de puntos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPuntos()
  }, [])

  const filteredTransactions = data?.transactions.filter((tx) => {
    if (filterType === 'EARNED' && tx.type !== 'EARNED') return false
    if (filterType === 'REDEEMED' && tx.type !== 'REDEEMED') return false
    if (
      filterType === 'RESERVED' &&
      tx.type !== 'RESERVED' &&
      tx.type !== 'RELEASED'
    )
      return false
    if (
      filterType === 'ADJUSTMENT' &&
      tx.type !== 'ADJUSTMENT_POS' &&
      tx.type !== 'ADJUSTMENT_NEG'
    )
      return false

    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase()
      const matchDesc = tx.description.toLowerCase().includes(query)
      const matchReward = tx.redemption?.reward.name.toLowerCase().includes(query)
      const matchCategory = tx.service?.category.name.toLowerCase().includes(query)
      if (!matchDesc && !matchReward && !matchCategory) return false
    }

    return true
  })

  const getTransactionBadge = (type: string, amount: number) => {
    switch (type) {
      case 'EARNED':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            Ganado por viaje
          </span>
        )
      case 'REDEEMED':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/30">
            Canje completado
          </span>
        )
      case 'RESERVED':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            Reserva de canje
          </span>
        )
      case 'RELEASED':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30">
            Puntos devueltos
          </span>
        )
      case 'ADJUSTMENT_POS':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            Ajuste administrativo (+)
          </span>
        )
      case 'ADJUSTMENT_NEG':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
            Ajuste administrativo (-)
          </span>
        )
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
            {type}
          </span>
        )
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-[#0B0F19] border border-amber-500/10 rounded-2xl" />
          ))}
        </div>
        <div className="h-96 bg-[#0B0F19] border border-amber-500/10 rounded-2xl" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-12 bg-[#0B0F19] border border-amber-500/20 rounded-2xl p-8">
        <p className="text-slate-400 mb-4">No se pudo cargar la información de puntos.</p>
        <button
          onClick={fetchPuntos}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-amber-500 to-amber-600 text-slate-950 font-bold rounded-xl text-sm hover:from-amber-400 hover:to-amber-500 shadow-md shadow-amber-500/20"
        >
          <RefreshCw className="w-4 h-4" /> Reintentar
        </button>
      </div>
    )
  }

  const { points } = data

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
          <Coins className="w-7 h-7 text-amber-400" />
          Mis Puntos
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Consulta tu saldo detallado y el registro de todas tus transacciones en <span className="text-amber-400 font-semibold">Luxuri Private Travel</span>.
        </p>
      </div>

      {/* Tarjetas de Saldo Black & Gold */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Disponibles (VIP Gold) */}
        <div className="p-5 rounded-2xl bg-linear-to-br from-amber-500 via-amber-600 to-yellow-600 text-slate-950 shadow-xl shadow-amber-500/15 relative overflow-hidden flex flex-col justify-between border border-amber-400">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-900/80">
              Disponibles
            </span>
            <div className="w-8 h-8 rounded-lg bg-slate-950/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-slate-950" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl sm:text-4xl font-black tracking-tight">
              {points.available.toLocaleString()}
            </span>
            <span className="text-xs font-black text-slate-900 ml-1.5 uppercase">PTS</span>
            <p className="text-[11px] font-bold text-slate-900/90 mt-1">Listos para canjear en premios</p>
          </div>
        </div>

        {/* Totales Acumulados */}
        <div className="p-5 rounded-2xl bg-[#0B0F19] border border-amber-500/20 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Histórico
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              {points.total.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-amber-400 ml-1.5 uppercase">PTS</span>
            <p className="text-[11px] text-slate-400 mt-1">Puntos acumulados de por vida</p>
          </div>
        </div>

        {/* Canjeados */}
        <div className="p-5 rounded-2xl bg-[#0B0F19] border border-amber-500/20 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Canjeados
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center">
              <Gift className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              {points.redeemed.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-purple-400 ml-1.5 uppercase">PTS</span>
            <p className="text-[11px] text-slate-400 mt-1">Utilizados en recompensas</p>
          </div>
        </div>

        {/* Reservados */}
        <div className="p-5 rounded-2xl bg-[#0B0F19] border border-amber-500/20 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              En Trámite
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              {points.reserved.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-amber-400 ml-1.5 uppercase">PTS</span>
            <p className="text-[11px] text-slate-400 mt-1">Reservados en canjes pendientes</p>
          </div>
        </div>
      </div>

      {/* Historial de Movimientos Black & Gold */}
      <div className="bg-[#0B0F19] rounded-2xl border border-amber-500/20 shadow-xl overflow-hidden">
        {/* Barra de Filtros y Búsqueda */}
        <div className="p-4 sm:p-5 border-b border-amber-500/10 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-[#070A11]/60">
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'ALL', label: 'Todos' },
              { id: 'EARNED', label: 'Ganados' },
              { id: 'REDEEMED', label: 'Canjeados' },
              { id: 'RESERVED', label: 'Reservados' },
              { id: 'ADJUSTMENT', label: 'Ajustes' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterType(f.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  filterType === f.id
                    ? 'bg-linear-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'bg-[#121827] text-slate-300 hover:text-amber-300 hover:bg-[#1A2234] border border-amber-500/10'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar movimiento..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-xs bg-[#121827] border border-amber-500/20 text-white placeholder-slate-500 rounded-lg w-full sm:w-56 focus:outline-hidden focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
            />
          </div>
        </div>

        {/* Lista de Transacciones */}
        {(!filteredTransactions || filteredTransactions.length === 0) ? (
          <div className="text-center py-16 px-4">
            <Coins className="w-10 h-10 text-amber-500/30 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-300">No se encontraron movimientos</p>
            <p className="text-xs text-slate-500 mt-1">
              Prueba cambiando los filtros o realizando un nuevo viaje.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-amber-500/10">
            {filteredTransactions.map((tx) => {
              const isPositive = tx.amount > 0
              return (
                <div
                  key={tx.id}
                  className="p-4 sm:p-5 hover:bg-[#121827]/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 border ${
                        isPositive
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                      }`}
                    >
                      {isPositive ? (
                        <ArrowDownLeft className="w-5 h-5" />
                      ) : (
                        <ArrowUpRight className="w-5 h-5" />
                      )}
                    </div>

                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-bold text-white leading-tight">
                          {tx.description}
                        </p>
                        {getTransactionBadge(tx.type, tx.amount)}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-amber-400/70" />
                          {new Date(tx.createdAt).toLocaleDateString('es-PE', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        <span>
                          Saldo: <strong className="text-slate-300 font-mono">{tx.balanceBefore}</strong> →{' '}
                          <strong className="text-amber-400 font-mono">{tx.balanceAfter} pts</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0 sm:pl-4">
                    <span
                      className={`text-base sm:text-lg font-black ${
                        isPositive ? 'text-emerald-400' : 'text-slate-200'
                      }`}
                    >
                      {isPositive ? `+${tx.amount}` : tx.amount} pts
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
