'use client'

import React, { useState, useEffect } from 'react'
import QRScanner from '@/components/qr/QRScanner'
import {
  Search,
  User,
  Bus,
  CheckCircle2,
  AlertTriangle,
  Phone,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  Crown,
} from 'lucide-react'
import { formatCurrency, formatPhone } from '@/lib/utils'
import { toast } from 'sonner'
import Link from 'next/link'

export default function AdminEscanearPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [customer, setCustomer] = useState<any>(null)
  const [categories, setCategories] = useState<any[]>([])

  // Formulario
  const [selectedCategory, setSelectedCategory] = useState('')
  const [amount, setAmount] = useState('')
  const [referenceNumber, setReferenceNumber] = useState('')
  const [notes, setNotes] = useState('')
  const [estimatedPoints, setEstimatedPoints] = useState<number | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successService, setSuccessService] = useState<any>(null)

  useEffect(() => {
    fetch('/api/admin/categorias')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.categories) {
          const active = data.categories.filter((c: any) => c.isActive)
          setCategories(active)
          if (active.length > 0) setSelectedCategory(active[0].id)
        }
      })
      .catch((err) => console.error(err))
  }, [])

  // Cálculo de puntos
  useEffect(() => {
    if (!selectedCategory || !amount || Number(amount) <= 0) {
      setEstimatedPoints(null)
      return
    }

    const timer = setTimeout(() => {
      setIsCalculating(true)
      fetch('/api/servicios/calcular-puntos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryId: selectedCategory,
          amount: Number(amount),
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data && data.points !== undefined) {
            setEstimatedPoints(data.points)
          } else {
            setEstimatedPoints(0)
          }
        })
        .catch(() => setEstimatedPoints(0))
        .finally(() => setIsCalculating(false))
    }, 300)

    return () => clearTimeout(timer)
  }, [selectedCategory, amount])

  // Buscar cliente
  const handleIdentifyCustomer = async (query: string) => {
    if (!query.trim()) return
    setIsSearching(true)
    setCustomer(null)
    setSuccessService(null)

    try {
      const res = await fetch('/api/clientes/buscar-qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qrToken: query,
          customerCode: query,
          phone: query,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Cliente no encontrado')
        return
      }

      setCustomer(data.customer)
      toast.success(`Cliente identificado: ${data.customer.firstName} ${data.customer.lastName}`)
    } catch {
      toast.error('Error al consultar cliente')
    } finally {
      setIsSearching(false)
    }
  }

  // Enviar servicio
  const handleSubmitService = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!customer) {
      toast.error('Primero debes identificar a un cliente')
      return
    }

    if (!selectedCategory || !amount || Number(amount) <= 0) {
      toast.error('Ingresa un monto válido')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/servicios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: customer.id,
          categoryId: selectedCategory,
          amount: Number(amount),
          referenceNumber: referenceNumber.trim() || undefined,
          notes: notes.trim() || undefined,
          serviceDate: new Date().toISOString(),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Error al registrar servicio')
        return
      }

      toast.success(`¡Servicio registrado! Se acreditaron ${data.pointsAwarded} puntos.`)
      setSuccessService({
        ...data.service,
        pointsAwarded: data.pointsAwarded,
      })
      setCustomer((prev: any) => ({
        ...prev,
        availablePoints: prev.availablePoints + data.pointsAwarded,
        totalPoints: prev.totalPoints + data.pointsAwarded,
      }))
      setAmount('')
      setReferenceNumber('')
      setNotes('')
      setEstimatedPoints(null)
    } catch {
      toast.error('Error al registrar servicio')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
          <Crown className="w-7 h-7 text-amber-400" />
          Escanear QR de Pasajero
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Identifica al cliente mediante su QR o búsqueda manual para registrar su traslado en <span className="text-amber-400 font-semibold">Luxuri Private Travel</span>.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Columna Izquierda: Escáner QR */}
        <div className="space-y-6">
          <QRScanner onScanSuccess={(code) => handleIdentifyCustomer(code)} />

          <div className="bg-[#0B0F19] rounded-2xl p-6 border border-amber-500/20 shadow-xl">
            <h3 className="font-bold text-white text-sm mb-2 flex items-center gap-2">
              <Search className="w-4 h-4 text-amber-400" />
              Búsqueda Manual
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Ingresa el número de celular o código de cliente VIP si no tiene el código QR a mano.
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Celular o código VIP..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleIdentifyCustomer(searchQuery)}
                className="flex-1 px-4 py-2.5 text-xs sm:text-sm bg-[#121827] border border-amber-500/20 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400 font-mono"
              />
              <button
                type="button"
                onClick={() => handleIdentifyCustomer(searchQuery)}
                disabled={isSearching || !searchQuery.trim()}
                className="bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 text-slate-950 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all shadow-md shadow-amber-500/20"
              >
                {isSearching ? 'Buscando...' : 'Buscar'}
              </button>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Tarjeta & Formulario */}
        <div className="space-y-6">
          {customer ? (
            <div className={`bg-[#0B0F19] rounded-2xl border p-6 shadow-xl transition-all ${
              !customer.user?.isActive ? 'border-rose-500/50 bg-rose-950/20' : 'border-amber-500/30'
            }`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-linear-to-br from-amber-500 to-amber-600 text-slate-950 rounded-2xl flex items-center justify-center font-black text-lg border border-amber-400 shadow-md">
                    {customer.firstName[0]}{customer.lastName[0]}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">
                      {customer.firstName} {customer.lastName}
                    </h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3 text-amber-400" /> {formatPhone(customer.phone)}
                    </p>
                  </div>
                </div>

                <span className="font-mono text-xs font-black bg-[#121827] text-amber-400 px-2.5 py-1 rounded-lg border border-amber-500/30">
                  {customer.customerCode}
                </span>
              </div>

              {!customer.user?.isActive ? (
                <div className="mt-4 p-3 bg-rose-950/40 border border-rose-500/40 rounded-xl flex items-center gap-2 text-xs text-rose-300 font-bold">
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                  <span>CUENTA BLOQUEADA: No se pueden registrar servicios a este cliente.</span>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-amber-500/10">
                  <div className="bg-[#121827] p-3 rounded-xl border border-amber-500/20">
                    <span className="text-xs text-slate-400 block mb-0.5">Puntos Disponibles</span>
                    <span className="text-xl font-black text-amber-400">
                      {customer.availablePoints} pts
                    </span>
                  </div>
                  <div className="bg-[#121827] p-3 rounded-xl border border-amber-500/20">
                    <span className="text-xs text-slate-400 block mb-0.5">Total Acumulado</span>
                    <span className="text-xl font-black text-white">
                      {customer.totalPoints} pts
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-[#0B0F19] rounded-2xl border border-dashed border-amber-500/20 p-8 text-center text-slate-400">
              <User className="w-12 h-12 mx-auto mb-2 text-amber-500/40" />
              <p className="text-sm font-bold text-slate-300">Ningún cliente identificado</p>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                Escanea el código QR del cliente o búscalo manualmente para registrar un servicio.
              </p>
            </div>
          )}

          {/* Formulario Black & Gold */}
          <div className="bg-[#0B0F19] rounded-2xl p-6 border border-amber-500/20 shadow-xl">
            <h3 className="font-bold text-white text-base mb-4 flex items-center gap-2">
              <Bus className="w-5 h-5 text-amber-400" />
              Registrar Servicio
            </h3>

            <form onSubmit={handleSubmitService} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Categoría de Transporte *
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  disabled={!customer || !customer.user?.isActive}
                  className="w-full px-4 py-2.5 text-xs sm:text-sm bg-[#121827] border border-amber-500/20 rounded-xl text-white focus:outline-hidden focus:border-amber-400"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Monto Pagado (S/) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-400 font-black text-sm">
                    S/
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.10"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    disabled={!customer || !customer.user?.isActive}
                    className="w-full pl-9 pr-4 py-2.5 text-xs sm:text-sm font-black bg-[#121827] border border-amber-500/20 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400"
                  />
                </div>
              </div>

              {amount && Number(amount) > 0 && (
                <div className="p-3 bg-linear-to-r from-amber-500/10 to-amber-600/10 border border-amber-500/30 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span className="text-xs text-amber-300 font-bold">
                      Puntos a acreditar:
                    </span>
                  </div>
                  <span className="font-black text-amber-400 text-base">
                    {isCalculating ? 'Calculando...' : `+${estimatedPoints || 0} pts`}
                  </span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  N° de Boleto / Factura (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ej: B001-000492"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  disabled={!customer || !customer.user?.isActive}
                  className="w-full px-4 py-2 text-xs sm:text-sm bg-[#121827] border border-amber-500/20 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400 font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !customer || !customer.user?.isActive || !amount || Number(amount) <= 0}
                className="w-full bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 text-slate-950 font-black py-3 rounded-xl transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 text-xs sm:text-sm active:scale-98"
              >
                <CheckCircle2 className="w-5 h-5 text-slate-950" />
                {isSubmitting ? 'Procesando...' : 'Confirmar Servicio y Acreditar Puntos'}
              </button>
            </form>

            {successService && (
              <div className="mt-4 p-4 bg-emerald-950/40 border border-emerald-400/50 rounded-xl text-emerald-200">
                <p className="font-bold text-sm text-white">
                  ¡Servicio registrado con éxito!
                </p>
                <p className="text-xs text-slate-300 mt-0.5">
                  Se acreditaron <strong className="text-amber-400">+{successService.pointsAwarded} puntos</strong> al cliente.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
