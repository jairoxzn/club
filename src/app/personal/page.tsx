'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  QrCode,
  Bus,
  CheckCircle2,
  Gift,
  ArrowRight,
  TrendingUp,
  UserCheck,
  Search,
  Clock,
  ShieldCheck,
  Crown,
  Sparkles,
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { toast } from 'sonner'

export default function PersonalDashboardPage() {
  const [stats, setStats] = useState({
    todayServices: 0,
    todayAmount: 0,
    recentServices: [] as any[],
  })
  const [validationCode, setValidationCode] = useState('')
  const [isValidating, setIsValidating] = useState(false)
  const [validationResult, setValidationResult] = useState<any>(null)

  useEffect(() => {
    fetch('/api/servicios?limit=5')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.services) {
          const totalAmount = data.services.reduce(
            (acc: number, curr: any) => acc + Number(curr.amount || 0),
            0
          )
          setStats({
            todayServices: data.services.length,
            todayAmount: totalAmount,
            recentServices: data.services.slice(0, 5),
          })
        }
      })
      .catch((err) => console.error(err))
  }, [])

  const handleValidateRedemption = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validationCode.trim()) return

    setIsValidating(true)
    setValidationResult(null)

    try {
      const res = await fetch('/api/canjes/validar-entrega', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ validationCode: validationCode.trim() }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Código inválido o ya canjeado')
        return
      }

      toast.success('¡Recompensa validada y entregada con éxito!')
      setValidationResult(data.redemption)
      setValidationCode('')
    } catch {
      toast.error('Error al conectar con el servidor')
    } finally {
      setIsValidating(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Bienvenida y Acciones Rápidas Black & Gold */}
      <div className="bg-linear-to-r from-[#0B0F19] via-[#121827] to-[#0B0F19] border border-amber-500/30 rounded-3xl p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-3xl relative z-10">
          <div className="inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs px-3 py-1 rounded-full font-bold mb-3">
            <Crown className="w-3.5 h-3.5" />
            Terminal Operativa Luxuri
          </div>
          <h1 className="text-2xl sm:text-3xl font-black mb-2 tracking-tight">
            Panel de Operaciones & Asignación de Puntos
          </h1>
          <p className="text-slate-300 text-sm leading-relaxed mb-6">
            Escanea el código QR del cliente o búscalo por celular para registrar su servicio de traslado y acreditar sus puntos al instante.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/personal/escanear"
              className="inline-flex items-center gap-2 bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black px-6 py-3 rounded-xl shadow-lg shadow-amber-500/20 transition-all text-sm active:scale-95"
            >
              <QrCode className="w-5 h-5 text-slate-950" />
              Escanear Cliente & Registrar Traslado
            </Link>
            <Link
              href="/personal/servicios"
              className="inline-flex items-center gap-2 bg-[#121827] hover:bg-[#1A2234] text-slate-200 hover:text-white font-bold px-5 py-3 rounded-xl border border-amber-500/20 transition-all text-sm"
            >
              <Bus className="w-4 h-4 text-amber-400" />
              Ver Servicios
            </Link>
          </div>
        </div>
      </div>

      {/* Grid de Métricas y Validación Black & Gold */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tarjeta 1: Servicios Registrados */}
        <div className="bg-[#0B0F19] rounded-2xl p-6 border border-amber-500/20 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Actividad del Turno
            </span>
            <div className="w-9 h-9 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl flex items-center justify-center">
              <Bus className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-white mb-1">
              {stats.todayServices}
            </div>
            <p className="text-xs text-slate-400">Servicios procesados hoy</p>
          </div>
          <div className="mt-4 pt-3 border-t border-amber-500/10 text-xs text-slate-400 flex justify-between">
            <span>Monto acumulado:</span>
            <span className="font-bold text-amber-400">{formatCurrency(stats.todayAmount)}</span>
          </div>
        </div>

        {/* Tarjeta 2: Validador de Recompensas */}
        <div className="bg-[#0B0F19] rounded-2xl p-6 border border-amber-500/20 shadow-xl lg:col-span-2">
          <div className="flex items-center gap-2 mb-2">
            <Gift className="w-5 h-5 text-amber-400" />
            <h2 className="font-black text-white text-base">
              Validar Entrega Física de Recompensa
            </h2>
          </div>
          <p className="text-xs text-slate-400 mb-4">
            Cuando el cliente presente su código de validación aprobado, ingrésalo aquí para registrar la entrega física del premio.
          </p>

          <form onSubmit={handleValidateRedemption} className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="Ej: VAL-XXXX-XXXX"
              value={validationCode}
              onChange={(e) => setValidationCode(e.target.value.toUpperCase())}
              className="flex-1 px-4 py-2.5 text-xs sm:text-sm bg-[#121827] border border-amber-500/20 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400 focus:ring-1 focus:ring-amber-400 font-mono uppercase tracking-wider"
            />
            <button
              type="submit"
              disabled={isValidating || !validationCode.trim()}
              className="bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 text-slate-950 font-black px-6 py-2.5 rounded-xl text-xs sm:text-sm transition-all shadow-md shadow-amber-500/20 flex items-center justify-center gap-2"
            >
              {isValidating ? 'Validando...' : 'Confirmar Entrega'}
            </button>
          </form>

          {validationResult && (
            <div className="mt-4 p-4 bg-emerald-950/40 border border-emerald-400/50 rounded-xl flex items-start gap-3 text-emerald-200">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-black text-sm text-white mb-1">
                  ¡Premio entregado exitosamente!
                </p>
                <p><strong>Premio:</strong> {validationResult.reward?.name}</p>
                <p><strong>Cliente:</strong> {validationResult.customer?.firstName} {validationResult.customer?.lastName}</p>
                <p><strong>Puntos canjeados:</strong> {validationResult.pointsUsed} pts</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabla de Servicios Recientes Black & Gold */}
      <div className="bg-[#0B0F19] rounded-2xl border border-amber-500/20 shadow-xl overflow-hidden">
        <div className="p-5 border-b border-amber-500/10 flex items-center justify-between bg-[#070A11]/60">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-white text-sm">
              Últimos Servicios Registrados
            </h3>
          </div>
          <Link
            href="/personal/servicios"
            className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1"
          >
            Ver todos <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {stats.recentServices.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            No se han registrado traslados en este turno todavía.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm text-slate-300">
              <thead className="bg-[#121827] text-xs uppercase font-bold text-slate-400 border-b border-amber-500/10">
                <tr>
                  <th className="px-5 py-3">Fecha</th>
                  <th className="px-5 py-3">Cliente</th>
                  <th className="px-5 py-3">Categoría</th>
                  <th className="px-5 py-3">Monto</th>
                  <th className="px-5 py-3">Puntos</th>
                  <th className="px-5 py-3">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-500/10">
                {stats.recentServices.map((service: any) => (
                  <tr key={service.id} className="hover:bg-[#121827]/70 transition-colors">
                    <td className="px-5 py-3.5 text-xs text-slate-400">
                      {formatDate(service.serviceDate || service.createdAt)}
                    </td>
                    <td className="px-5 py-3.5 font-bold text-white">
                      {service.customer?.firstName} {service.customer?.lastName}
                      <span className="block text-[11px] font-mono text-amber-400/80">
                        {service.customer?.customerCode}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                        {service.category?.name || 'Transporte'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-black text-white">
                      {formatCurrency(service.amount)}
                    </td>
                    <td className="px-5 py-3.5 font-black text-amber-400">
                      +{service.pointsAwarded} pts
                    </td>
                    <td className="px-5 py-3.5">
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
