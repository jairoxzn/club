'use client'

import { useState, useEffect } from 'react'
import {
  Compass,
  Calendar,
  CreditCard,
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  Bus,
  RefreshCw,
} from 'lucide-react'
import { toast } from 'sonner'

interface ServiceItem {
  id: string
  amount: number
  currency: string
  serviceDate: string
  referenceNumber: string | null
  notes: string | null
  status: 'COMPLETED' | 'PENDING' | 'CANCELLED'
  pointsAwarded: number
  category: {
    id: string
    name: string
    color: string | null
    icon: string | null
  }
}

export default function HistorialViajesPage() {
  const [services, setServices] = useState<ServiceItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL')
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  const fetchServices = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/cliente/servicios')
      if (!res.ok) throw new Error('Error al cargar servicios')
      const json = await res.json()
      if (json.success) {
        setServices(json.services)
      }
    } catch (err) {
      console.error(err)
      toast.error('No se pudo cargar el historial de viajes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchServices()
  }, [])

  // Extraer categorías únicas para filtro
  const categories = Array.from(
    new Set(services.map((s) => s.category?.name).filter(Boolean))
  )

  const filteredServices = services.filter((srv) => {
    if (selectedStatus !== 'ALL' && srv.status !== selectedStatus) return false
    if (selectedCategory !== 'ALL' && srv.category?.name !== selectedCategory)
      return false
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase()
      const matchCat = srv.category?.name?.toLowerCase().includes(q)
      const matchRef = srv.referenceNumber?.toLowerCase().includes(q)
      const matchNotes = srv.notes?.toLowerCase().includes(q)
      if (!matchCat && !matchRef && !matchNotes) return false
    }
    return true
  })

  // Estadísticas rápidas
  const totalViajes = services.length
  const totalGasto = services.reduce((acc, s) => acc + Number(s.amount), 0)
  const totalPuntos = services.reduce((acc, s) => acc + s.pointsAwarded, 0)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" /> Completado
          </span>
        )
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <Clock className="w-3.5 h-3.5" /> Pendiente
          </span>
        )
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
            <XCircle className="w-3.5 h-3.5" /> Cancelado
          </span>
        )
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-[#0B0F19] border border-amber-500/10 rounded-2xl" />
          ))}
        </div>
        <div className="h-96 bg-[#0B0F19] border border-amber-500/10 rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
          <Bus className="w-7 h-7 text-amber-400" />
          Historial de Viajes
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Registro completo de tus traslados y puntos acumulados en <span className="text-amber-400 font-semibold">Luxuri Private Travel</span>.
        </p>
      </div>

      {/* Tarjetas de Resumen Black & Gold */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-[#0B0F19] border border-amber-500/20 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Viajes Realizados
            </span>
            <p className="text-2xl sm:text-3xl font-black text-white mt-1">
              {totalViajes}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
            <Bus className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0B0F19] border border-amber-500/20 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Invertido
            </span>
            <p className="text-2xl sm:text-3xl font-black text-white mt-1">
              S/ {totalGasto.toFixed(2)}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-linear-to-br from-amber-500 via-amber-600 to-yellow-600 text-slate-950 border border-amber-400 shadow-xl shadow-amber-500/15 flex items-center justify-between">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-slate-900/80">
              Puntos Generados
            </span>
            <p className="text-2xl sm:text-3xl font-black text-slate-950 mt-1">
              +{totalPuntos.toLocaleString()} pts
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-950/20 flex items-center justify-center text-slate-950">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Contenedor de Viajes Black & Gold */}
      <div className="bg-[#0B0F19] rounded-2xl border border-amber-500/20 shadow-xl overflow-hidden">
        {/* Filtros */}
        <div className="p-4 sm:p-5 border-b border-amber-500/10 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between bg-[#070A11]/60">
          <div className="flex flex-wrap items-center gap-2">
            {/* Estado */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-1.5 text-xs font-bold bg-[#121827] border border-amber-500/20 rounded-lg text-slate-200 focus:outline-hidden focus:border-amber-400"
            >
              <option value="ALL">Todos los Estados</option>
              <option value="COMPLETED">Completados</option>
              <option value="PENDING">Pendientes</option>
              <option value="CANCELLED">Cancelados</option>
            </select>

            {/* Categoría */}
            {categories.length > 0 && (
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-1.5 text-xs font-bold bg-[#121827] border border-amber-500/20 rounded-lg text-slate-200 focus:outline-hidden focus:border-amber-400"
              >
                <option value="ALL">Todas las Categorías</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por referencia o notas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-xs bg-[#121827] border border-amber-500/20 text-white placeholder-slate-500 rounded-lg w-full md:w-60 focus:outline-hidden focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
            />
          </div>
        </div>

        {/* Listado */}
        {filteredServices.length === 0 ? (
          <div className="text-center py-16 px-4">
            <Bus className="w-10 h-10 text-amber-500/30 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-300">No hay viajes registrados</p>
            <p className="text-xs text-slate-500 mt-1">
              Tus viajes aparecerán aquí una vez que el personal de Luxuri registre tu traslado.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-amber-500/10">
            {filteredServices.map((srv) => (
              <div
                key={srv.id}
                className="p-4 sm:p-5 hover:bg-[#121827]/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-md mt-0.5 border border-amber-500/30"
                    style={{ backgroundColor: srv.category?.color || '#D97706' }}
                  >
                    <Compass className="w-5 h-5 text-slate-950" />
                  </div>

                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-sm sm:text-base text-white leading-tight">
                        {srv.category?.name || 'Servicio de Transporte'}
                      </h3>
                      {getStatusBadge(srv.status)}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                      <span className="flex items-center gap-1 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-amber-400/80" />
                        {new Date(srv.serviceDate).toLocaleDateString('es-PE', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>

                      {srv.referenceNumber && (
                        <span className="flex items-center gap-1 font-mono text-slate-300">
                          <FileText className="w-3.5 h-3.5 text-amber-400/80" />
                          Ref: {srv.referenceNumber}
                        </span>
                      )}
                    </div>

                    {srv.notes && (
                      <p className="text-xs text-slate-400 italic">{srv.notes}</p>
                    )}
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-amber-500/10 shrink-0">
                  <span className="text-sm sm:text-base font-extrabold text-white">
                    {srv.currency === 'PEN' ? 'S/' : srv.currency}{' '}
                    {Number(srv.amount).toFixed(2)}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-amber-400 mt-0.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />+{srv.pointsAwarded} pts
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
