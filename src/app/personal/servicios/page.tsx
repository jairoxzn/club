'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  Bus,
  Search,
  Calendar,
  Filter,
  CheckCircle2,
  FileSpreadsheet,
  RefreshCw,
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

export default function ServiciosPersonalPage() {
  const [services, setServices] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  const fetchServices = useCallback(() => {
    setIsLoading(true)
    let url = '/api/servicios'
    const params = new URLSearchParams()
    if (selectedCategory) params.append('categoryId', selectedCategory)
    if (params.toString()) url += `?${params.toString()}`

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.services) {
          setServices(data.services)
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false))
  }, [selectedCategory])

  useEffect(() => {
    fetch('/api/admin/categorias')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.categories) setCategories(data.categories)
      })
      .catch((err) => console.error(err))
  }, [])

  useEffect(() => {
    fetchServices()
  }, [fetchServices])

  const filteredServices = services.filter((s) => {
    if (!searchTerm) return true
    const term = searchTerm.toLowerCase()
    const customerName = `${s.customer?.firstName} ${s.customer?.lastName}`.toLowerCase()
    const customerCode = (s.customer?.customerCode || '').toLowerCase()
    const ref = (s.referenceNumber || '').toLowerCase()
    return customerName.includes(term) || customerCode.includes(term) || ref.includes(term)
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <Bus className="w-7 h-7 text-amber-400" />
            Servicios Registrados
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Consulta los traslados procesados y acreditados en <span className="text-amber-400 font-semibold">Luxuri Private Travel</span>.
          </p>
        </div>
        <button
          onClick={fetchServices}
          className="inline-flex items-center gap-2 text-xs font-bold bg-[#0B0F19] border border-amber-500/20 text-slate-200 hover:text-amber-300 px-4 py-2.5 rounded-xl hover:bg-[#121827] shadow-lg transition-all"
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
            placeholder="Buscar por cliente, código VIP o referencia..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-[#121827] border border-amber-500/20 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
          />
        </div>

        <div className="w-full sm:w-64">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-4 py-2 text-xs sm:text-sm bg-[#121827] border border-amber-500/20 rounded-xl text-white focus:outline-hidden focus:border-amber-400"
          >
            <option value="">Todas las categorías</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabla de Resultados Black & Gold */}
      <div className="bg-[#0B0F19] rounded-2xl border border-amber-500/20 shadow-xl overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            Cargando servicios de transporte...
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            No se encontraron servicios registrados con los filtros aplicados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm text-slate-300">
              <thead className="bg-[#121827] text-xs uppercase font-bold text-slate-400 border-b border-amber-500/10">
                <tr>
                  <th className="px-5 py-3.5">Fecha</th>
                  <th className="px-5 py-3.5">Cliente</th>
                  <th className="px-5 py-3.5">Categoría</th>
                  <th className="px-5 py-3.5">Boleto / Ref.</th>
                  <th className="px-5 py-3.5">Monto Pagado</th>
                  <th className="px-5 py-3.5">Puntos</th>
                  <th className="px-5 py-3.5">Operador</th>
                  <th className="px-5 py-3.5">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-500/10">
                {filteredServices.map((service) => (
                  <tr key={service.id} className="hover:bg-[#121827]/70 transition-colors">
                    <td className="px-5 py-4 text-xs text-slate-400 whitespace-nowrap">
                      {formatDate(service.serviceDate || service.createdAt)}
                    </td>
                    <td className="px-5 py-4 font-bold text-white whitespace-nowrap">
                      {service.customer?.firstName} {service.customer?.lastName}
                      <span className="block text-[11px] font-mono text-amber-400/80">
                        {service.customer?.customerCode}
                      </span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                        {service.category?.name || 'Transporte'}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-slate-300 whitespace-nowrap">
                      {service.referenceNumber || '-'}
                    </td>
                    <td className="px-5 py-4 font-black text-white whitespace-nowrap">
                      {formatCurrency(service.amount)}
                    </td>
                    <td className="px-5 py-4 font-black text-amber-400 whitespace-nowrap">
                      +{service.pointsAwarded} pts
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-400 whitespace-nowrap">
                      {service.staff?.username || service.staff?.email || 'Sistema'}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30 font-bold">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        Completado
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
