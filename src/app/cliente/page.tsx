'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Sparkles,
  QrCode,
  Gift,
  History,
  TrendingUp,
  Copy,
  Check,
  ChevronRight,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Compass,
  Award,
  Clock,
  TicketCheck,
  Crown,
  Car,
  Plane,
} from 'lucide-react'
import { toast } from 'sonner'
import { formatCurrency, formatDate } from '@/lib/utils'

interface DashboardData {
  profile: {
    id: string
    firstName: string
    lastName: string
    customerCode: string
    availablePoints: number
    totalPoints: number
    reservedPoints: number
    redeemedPoints: number
  }
  nextReward: {
    id: string
    name: string
    description: string | null
    imageUrl: string | null
    pointsRequired: number
    missingPoints: number
    progressPercent: number
    alreadyReached: boolean
  } | null
  recentTransactions: Array<{
    id: string
    type: string
    amount: number
    balanceAfter: number
    description: string
    createdAt: string
  }>
  recentServices: Array<{
    id: string
    amount: number
    currency: string
    serviceDate: string
    status: string
    pointsAwarded: number
    category: {
      name: string
      color: string | null
    }
  }>
}

export default function ClienteDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [copiedCode, setCopiedCode] = useState(false)

  const fetchDashboard = async () => {
    try {
      const res = await fetch('/api/cliente/dashboard')
      if (res.ok) {
        const json = await res.json()
        setData(json)
      } else {
        toast.error('No se pudo cargar la información del panel')
      }
    } catch (err) {
      console.error(err)
      toast.error('Error de conexión al cargar datos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboard()
  }, [])

  const copyCustomerCode = () => {
    if (data?.profile?.customerCode) {
      navigator.clipboard.writeText(data.profile.customerCode)
      setCopiedCode(true)
      toast.success('Código de socio copiado')
      setTimeout(() => setCopiedCode(false), 2000)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-44 bg-slate-900 border border-slate-800 rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-48 bg-slate-900 border border-slate-800 rounded-3xl" />
          <div className="h-48 bg-slate-900 border border-slate-800 rounded-3xl" />
        </div>
      </div>
    )
  }

  if (!data) return null

  const { profile, nextReward, recentTransactions, recentServices } = data

  return (
    <div className="space-y-6">
      {/* Saludo y Tarjeta Principal VIP */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-950/60 via-[#0B0F19] to-[#0F172A] border border-amber-500/30 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold mb-3">
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span>SOCIO CLUB LUXURI REWARDS</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              ¡Hola, {profile.firstName} {profile.lastName}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              Bienvenido a tu panel de fidelización. Presenta tu código QR en cada traslado de aeropuerto o viaje interprovincial para seguir acumulando beneficios VIP.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-400">Código de socio:</span>
              <button
                onClick={copyCustomerCode}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 border border-slate-700 hover:border-amber-500/50 text-white font-mono text-xs font-bold transition-colors"
                title="Copiar código"
              >
                <span>{profile.customerCode}</span>
                {copiedCode ? (
                  <Check className="w-3 h-3 text-emerald-400" />
                ) : (
                  <Copy className="w-3 h-3 text-slate-400" />
                )}
              </button>
            </div>
          </div>

          {/* Saldo de Puntos VIP */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-4 p-5 rounded-2xl bg-[#070A11]/80 border border-amber-500/30 backdrop-blur-md">
            <div>
              <span className="text-xs font-bold text-amber-300/80 uppercase tracking-wider block">
                Puntos Disponibles
              </span>
              <div className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 mt-0.5">
                {profile.availablePoints.toLocaleString()} <span className="text-sm font-bold text-amber-400">PTS</span>
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Total acumulado: {profile.totalPoints.toLocaleString()} pts
              </span>
            </div>

            <Link
              href="/cliente/mi-qr"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black px-5 py-2.5 rounded-xl text-xs transition-all shadow-lg shadow-amber-500/20 active:scale-95"
            >
              <QrCode className="w-4 h-4" />
              <span>Mostrar mi QR al chofer</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Grid: Próxima Recompensa & Accesos Rápidos */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Próxima Recompensa con barra de progreso */}
        <div className="lg:col-span-7 bg-[#0B0F19] border border-slate-800 hover:border-amber-500/30 rounded-3xl p-6 transition-all shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
                <Gift className="w-4 h-4" />
              </div>
              <h2 className="font-bold text-white text-base">Meta de Próximo Premio</h2>
            </div>
            <Link
              href="/cliente/recompensas"
              className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1"
            >
              Ver catálogo <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {nextReward ? (
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-lg text-white mb-1">{nextReward.name}</h3>
                <p className="text-xs text-slate-400 line-clamp-2">
                  {nextReward.description || 'Canjea tus puntos acumulados por este beneficio exclusivo de transporte.'}
                </p>
              </div>

              {/* Barra de progreso de puntos */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-slate-400">
                    Progreso: <strong>{profile.availablePoints}</strong> de <strong>{nextReward.pointsRequired} pts</strong>
                  </span>
                  <span className="font-bold text-amber-400">
                    {nextReward.progressPercent}%
                  </span>
                </div>
                <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(nextReward.progressPercent, 100)}%` }}
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                {nextReward.alreadyReached ? (
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                    <Check className="w-4 h-4" /> ¡Puntos suficientes! Ya puedes canjearlo
                  </span>
                ) : (
                  <span className="text-xs text-amber-300/80">
                    Te faltan sólo <strong>{nextReward.missingPoints} puntos</strong> para desbloquearlo
                  </span>
                )}
                <Link
                  href="/cliente/recompensas"
                  className="bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 font-bold px-4 py-2 rounded-xl text-xs border border-amber-500/30 transition-colors"
                >
                  Solicitar Canje
                </Link>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-slate-400 text-xs">
              <p>¡Felicidades! Tienes puntos suficientes para canjear cualquier recompensa del catálogo.</p>
              <Link
                href="/cliente/recompensas"
                className="mt-3 inline-block bg-amber-500 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs"
              >
                Explorar Premios
              </Link>
            </div>
          )}
        </div>

        {/* 4 Accesos Rápidos */}
        <div className="lg:col-span-5 grid grid-cols-2 gap-3">
          <Link
            href="/cliente/mi-qr"
            className="p-5 rounded-3xl bg-[#0B0F19] border border-slate-800 hover:border-amber-500/40 transition-all flex flex-col justify-between group"
          >
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-white text-sm block mt-4 group-hover:text-amber-400 transition-colors">
                Mi Código QR
              </span>
              <span className="text-[11px] text-slate-400">Escanear en viaje</span>
            </div>
          </Link>

          <Link
            href="/cliente/mis-puntos"
            className="p-5 rounded-3xl bg-[#0B0F19] border border-slate-800 hover:border-amber-500/40 transition-all flex flex-col justify-between group"
          >
            <div className="w-10 h-10 rounded-2xl bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-white text-sm block mt-4 group-hover:text-yellow-400 transition-colors">
                Mis Puntos
              </span>
              <span className="text-[11px] text-slate-400">Ver movimientos</span>
            </div>
          </Link>

          <Link
            href="/cliente/historial"
            className="p-5 rounded-3xl bg-[#0B0F19] border border-slate-800 hover:border-amber-500/40 transition-all flex flex-col justify-between group"
          >
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-white text-sm block mt-4 group-hover:text-blue-400 transition-colors">
                Mis Viajes
              </span>
              <span className="text-[11px] text-slate-400">Historial de rutas</span>
            </div>
          </Link>

          <Link
            href="/cliente/canjes"
            className="p-5 rounded-3xl bg-[#0B0F19] border border-slate-800 hover:border-amber-500/40 transition-all flex flex-col justify-between group"
          >
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
              <TicketCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-white text-sm block mt-4 group-hover:text-emerald-400 transition-colors">
                Mis Canjes
              </span>
              <span className="text-[11px] text-slate-400">Códigos de entrega</span>
            </div>
          </Link>
        </div>
      </div>

      {/* Grid: Últimos Movimientos y Servicios Recientes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Últimos Movimientos de Puntos */}
        <div className="bg-[#0B0F19] border border-slate-800 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              Últimos Movimientos de Puntos
            </h3>
            <Link
              href="/cliente/mis-puntos"
              className="text-xs text-amber-400 hover:text-amber-300 font-bold"
            >
              Ver todos →
            </Link>
          </div>

          {recentTransactions.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">
              No tienes movimientos de puntos aún. Realiza tu primer viaje para ganar puntos.
            </p>
          ) : (
            <div className="divide-y divide-slate-800/80">
              {recentTransactions.map((tx) => (
                <div key={tx.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold ${
                        tx.amount > 0
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {tx.amount > 0 ? '+' : ''}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white leading-tight">
                        {tx.description}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {formatDate(tx.createdAt)}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`font-mono text-sm font-black ${
                      tx.amount > 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {tx.amount > 0 ? `+${tx.amount}` : tx.amount} pts
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Últimos Servicios de Transporte */}
        <div className="bg-[#0B0F19] border border-slate-800 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Car className="w-4 h-4 text-amber-400" />
              Últimos Viajes Realizados
            </h3>
            <Link
              href="/cliente/historial"
              className="text-xs text-amber-400 hover:text-amber-300 font-bold"
            >
              Ver todos →
            </Link>
          </div>

          {recentServices.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">
              No registras servicios aún. Pide tu traslado o viaje al 92 28 95 355.
            </p>
          ) : (
            <div className="divide-y divide-slate-800/80">
              {recentServices.map((srv) => (
                <div key={srv.id} className="py-3 flex items-center justify-between">
                  <div>
                    <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20 mb-1">
                      {srv.category?.name || 'Transporte'}
                    </span>
                    <p className="text-xs font-bold text-white">
                      {formatCurrency(srv.amount)}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {formatDate(srv.serviceDate)}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-xs font-black text-amber-400 block">
                      +{srv.pointsAwarded} pts
                    </span>
                    <span className="text-[10px] text-emerald-400 font-semibold">
                      Completado
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
