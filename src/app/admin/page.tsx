'use client'

import React, { useEffect, useState } from 'react'
import {
  Users,
  Bus,
  Coins,
  Gift,
  Award,
  TrendingUp,
  Calendar,
  ArrowUpRight,
  Filter,
  RefreshCw,
  Clock,
  Sparkles,
  Crown,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from 'recharts'
import { formatCurrency, formatPoints, formatDate } from '@/lib/utils'
import Link from 'next/link'

const COLORS = ['#F59E0B', '#D4AF37', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899']

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [dateFilter, setDateFilter] = useState('all')

  const fetchStats = () => {
    setIsLoading(true)
    fetch('/api/admin/stats')
      .then((res) => res.json())
      .then((data) => {
        if (data) setStats(data)
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    fetchStats()
  }, [])

  if (isLoading || !stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin text-amber-400 mb-3" />
        <p className="text-sm font-bold text-slate-300">Cargando métricas de Luxuri Private Travel...</p>
      </div>
    )
  }

  const kpis = [
    {
      title: 'Total de Clientes',
      value: stats.totalCustomers || 0,
      subValue: `${stats.activeCustomers || 0} activos`,
      icon: <Users className="w-5 h-5 text-amber-400" />,
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
    },
    {
      title: 'Servicios Realizados',
      value: stats.totalServices || 0,
      subValue: `${stats.monthlyServices || 0} este mes`,
      icon: <Bus className="w-5 h-5 text-amber-400" />,
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
    },
    {
      title: 'Puntos Emitidos',
      value: formatPoints(stats.totalPointsIssued || 0),
      subValue: 'Acumulación total',
      icon: <Coins className="w-5 h-5 text-amber-400" />,
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
    },
    {
      title: 'Puntos Canjeados',
      value: formatPoints(stats.totalPointsRedeemed || 0),
      subValue: 'Redimidos en premios',
      icon: <Gift className="w-5 h-5 text-purple-400" />,
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/20',
    },
    {
      title: 'Solicitudes Pendientes',
      value: stats.pendingRedemptions || 0,
      subValue: 'Canjes por aprobar',
      icon: <Award className="w-5 h-5 text-rose-400" />,
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/20',
      highlight: (stats.pendingRedemptions || 0) > 0,
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header Dashboard Black & Gold */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Crown className="w-7 h-7 text-amber-400" />
            Dashboard Administrativo
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Métricas de fidelización, operaciones de traslados y comportamiento de clientes en <span className="text-amber-400 font-semibold">Luxuri Private Travel</span>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchStats}
            className="inline-flex items-center gap-1.5 text-xs font-bold bg-[#0B0F19] border border-amber-500/20 text-slate-200 hover:text-amber-300 px-4 py-2 rounded-xl hover:bg-[#121827] shadow-lg transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
            Actualizar
          </button>
        </div>
      </div>

      {/* Tarjetas Estadísticas Principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {kpis.map((kpi, idx) => (
          <div
            key={idx}
            className={`bg-[#0B0F19] rounded-2xl p-5 border ${kpi.border} shadow-xl flex flex-col justify-between transition-all hover:border-amber-400 ${
              kpi.highlight ? 'ring-2 ring-rose-500/50' : ''
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{kpi.title}</span>
              <div className={`w-9 h-9 rounded-xl ${kpi.bg} flex items-center justify-center border border-amber-500/20`}>
                {kpi.icon}
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-white tracking-tight">
                {kpi.value}
              </div>
              <div className="text-xs text-slate-400 mt-1 flex items-center justify-between">
                <span>{kpi.subValue}</span>
                {kpi.highlight && (
                  <Link
                    href="/admin/canjes"
                    className="text-xs text-rose-400 font-bold hover:underline"
                  >
                    Resolver →
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Fila de Gráficos 1: Servicios por Categoría y Puntos Acumulados */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico 1: Servicios por Categoría */}
        <div className="bg-[#0B0F19] rounded-2xl p-6 border border-amber-500/20 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-white text-base">
                Servicios por Categoría
              </h3>
              <p className="text-xs text-slate-400">Distribución de servicios y recaudación</p>
            </div>
          </div>

          <div className="h-72 w-full">
            {stats.servicesByCategory && stats.servicesByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.servicesByCategory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1E293B" />
                  <XAxis dataKey="category" tick={{ fontSize: 11, fill: '#94A3B8' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0B0F19', borderRadius: 12, border: '1px solid #D4AF37', fontSize: 12, color: '#FFFFFF' }}
                    formatter={(val: any, name: any) => [val, name === 'count' ? 'Servicios' : 'Monto (S/)']}
                  />
                  <Bar dataKey="count" name="Servicios" fill="#F59E0B" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                Sin datos suficientes para graficar
              </div>
            )}
          </div>
        </div>

        {/* Gráfico 2: Evolución de Puntos por Mes */}
        <div className="bg-[#0B0F19] rounded-2xl p-6 border border-amber-500/20 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-white text-base">
                Puntos Emitidos vs Canjeados
              </h3>
              <p className="text-xs text-slate-400">Flujo de puntos mensual</p>
            </div>
          </div>

          <div className="h-72 w-full">
            {stats.pointsByMonth && stats.pointsByMonth.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.pointsByMonth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorIssued" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorRedeemed" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1E293B" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#0B0F19', borderRadius: 12, border: '1px solid #D4AF37', fontSize: 12, color: '#FFFFFF' }} />
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10, color: '#94A3B8' }} />
                  <Area
                    type="monotone"
                    dataKey="issued"
                    name="Puntos Emitidos"
                    stroke="#F59E0B"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorIssued)"
                  />
                  <Area
                    type="monotone"
                    dataKey="redeemed"
                    name="Puntos Canjeados"
                    stroke="#10B981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRedeemed)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                Sin datos suficientes para graficar
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fila de Gráficos 2: Clientes Frecuentes y Recompensas Populares */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Clientes más frecuentes */}
        <div className="bg-[#0B0F19] rounded-2xl p-6 border border-amber-500/20 shadow-xl lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-white text-base">
                Clientes VIP Más Frecuentes
              </h3>
              <p className="text-xs text-slate-400">Pasajeros con mayor cantidad de traslados y puntos</p>
            </div>
            <Link
              href="/admin/clientes"
              className="text-xs text-amber-400 hover:text-amber-300 font-bold"
            >
              Ver todos →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm text-slate-300">
              <thead className="bg-[#121827] text-[11px] uppercase font-bold text-slate-400 border-b border-amber-500/10">
                <tr>
                  <th className="px-4 py-2.5 rounded-l-lg">Cliente</th>
                  <th className="px-4 py-2.5">Código VIP</th>
                  <th className="px-4 py-2.5">Viajes</th>
                  <th className="px-4 py-2.5">Puntos Disp.</th>
                  <th className="px-4 py-2.5 rounded-r-lg">Total Acumulado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-500/10">
                {stats.topCustomers && stats.topCustomers.length > 0 ? (
                  stats.topCustomers.map((cust: any, i: number) => (
                    <tr key={cust.id} className="hover:bg-[#121827]/70 transition-colors">
                      <td className="px-4 py-3 font-bold text-white flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-black text-xs flex items-center justify-center">
                          {i + 1}
                        </span>
                        <span>{cust.firstName} {cust.lastName}</span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-amber-400/80">
                        {cust.customerCode}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-300">
                        {cust.servicesCount || 0}
                      </td>
                      <td className="px-4 py-3 font-black text-amber-400">
                        {cust.availablePoints} pts
                      </td>
                      <td className="px-4 py-3 font-bold text-white">
                        {cust.totalPoints} pts
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-xs text-slate-500">
                      No hay datos de clientes frecuentes disponibles aún.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recompensas más solicitadas */}
        <div className="bg-[#0B0F19] rounded-2xl p-6 border border-amber-500/20 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-white text-base">
                Premios Populares
              </h3>
              <p className="text-xs text-slate-400">Recompensas más canjeadas</p>
            </div>
            <Link
              href="/admin/recompensas"
              className="text-xs text-amber-400 hover:text-amber-300 font-bold"
            >
              Catálogo →
            </Link>
          </div>

          <div className="space-y-3">
            {stats.popularRewards && stats.popularRewards.length > 0 ? (
              stats.popularRewards.map((reward: any) => (
                <div
                  key={reward.id}
                  className="p-3.5 bg-[#121827] rounded-xl border border-amber-500/20 flex items-center justify-between"
                >
                  <div className="truncate mr-2">
                    <p className="text-xs font-bold text-white truncate">
                      {reward.name}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {reward.pointsRequired} pts • {reward.redemptionsCount || 0} canjes
                    </p>
                  </div>
                  <span className="text-xs font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                    {reward.redemptionsCount || 0}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 text-center py-8">
                No hay canjes registrados aún
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
