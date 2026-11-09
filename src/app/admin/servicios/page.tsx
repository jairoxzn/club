'use client'

import React, { useState, useEffect } from 'react'
import {
  Bus,
  Search,
  Filter,
  Calendar,
  CheckCircle2,
  FileSpreadsheet,
  RefreshCw,
  Plus,
  Eye,
  User,
  ArrowRight,
  TrendingUp,
  Crown,
} from 'lucide-react'
import { formatCurrency, formatPoints, formatDate } from '@/lib/utils'
import Link from 'next/link'

export default function AdminServiciosPage() {
  const [services, setServices] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const fetchServices = () => {
    setIsLoading(true)
    let url = '/api/servicios'
    const params = new URLSearchParams()
    if (selectedCategory) params.append('categoryId', selectedCategory)
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)
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
  }

  useEffect(() => {
    fetch('/api/admin/categorias')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.categories) setCategories(data.categories)
      })
    fetchServices()
  }, [selectedCategory, startDate, endDate])

  const filteredServices = services.filter((s) => {
    if (!searchTerm) return true
    const term = searchTerm.toLowerCase()
    const customerName = `${s.customer?.firstName} ${s.customer?.lastName}`.toLowerCase()
    const customerCode = (s.customer?.customerCode || '').toLowerCase()
    const ref = (s.referenceNumber || '').toLowerCase()
    return customerName.includes(term) || customerCode.includes(term) || ref.includes(term)
  })

  const totalAmount = filteredServices.reduce((sum, s) => sum + Number(s.amount || 0), 0)
  const totalPoints = filteredServices.reduce((sum, s) => sum + Number(s.pointsAwarded || 0), 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Bus className="w-7 h-7 text-amber-400" />
            Servicios de Transporte
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Registro histórico de traslados, cálculo de puntos y asignación por operador en <span className="text-amber-400 font-semibold">Luxuri Private Travel</span>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/escanear"
            className="inline-flex items-center gap-2 bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-amber-500/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 text-slate-950" />
            Nuevo Servicio
          </Link>
          <button
            onClick={fetchServices}
            className="p-2.5 bg-[#0B0F19] border border-amber-500/20 text-slate-300 hover:text-amber-400 hover:bg-[#121827] rounded-xl shadow-lg transition-colors"
            title="Actualizar lista"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Resumen Superior Rápido Black & Gold */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#0B0F19] p-4 rounded-2xl border border-amber-500/20 shadow-xl">
          <span className="text-xs text-slate-400 block mb-1 font-bold uppercase">Servicios Filtrados</span>
          <span className="text-2xl font-black text-white">{filteredServices.length}</span>
        </div>
        <div className="bg-[#0B0F19] p-4 rounded-2xl border border-amber-500/20 shadow-xl">
          <span className="text-xs text-slate-400 block mb-1 font-bold uppercase">Monto Total Facturado</span>
          <span className="text-2xl font-black text-emerald-400">{formatCurrency(totalAmount)}</span>
        </div>
        <div className="bg-[#0B0F19] p-4 rounded-2xl border border-amber-500/20 shadow-xl">
          <span className="text-xs text-slate-400 block mb-1 font-bold uppercase">Puntos Acreditados</span>
          <span className="text-2xl font-black text-amber-400">{formatPoints(totalPoints)} pts</span>
        </div>
      </div>

      {/* Filtros Black & Gold */}
      <div className="bg-[#0B0F19] rounded-2xl p-4 border border-amber-500/20 shadow-xl space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por cliente, código o boleto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-[#121827] border border-amber-500/20 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400 font-medium"
            />
          </div>

          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-[#121827] border border-amber-500/20 rounded-xl text-white focus:outline-hidden focus:border-amber-400"
            >
              <option value="">Todas las categorías</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-2 py-2 text-xs bg-[#121827] border border-amber-500/20 rounded-xl text-white focus:outline-hidden focus:border-amber-400"
              title="Fecha inicial"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-2 py-2 text-xs bg-[#121827] border border-amber-500/20 rounded-xl text-white focus:outline-hidden focus:border-amber-400"
              title="Fecha final"
            />
          </div>
        </div>
      </div>

      {/* Tabla de Servicios Black & Gold */}
      <div className="bg-[#0B0F19] rounded-2xl border border-amber-500/20 shadow-xl overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400 text-sm flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
            Cargando servicios...
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            No se encontraron servicios registrados con los filtros seleccionados.
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
                  <th className="px-5 py-3.5">Monto</th>
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
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="font-bold text-white block">
                        {service.customer?.firstName} {service.customer?.lastName}
                      </span>
                      <span className="font-mono text-xs text-amber-400/80">
                        {service.customer?.customerCode}
                      </span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                        {service.category?.name}
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
                      {service.staff?.username || service.staff?.email || 'Admin'}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/30 font-bold">
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
