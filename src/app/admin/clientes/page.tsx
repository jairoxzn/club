'use client'

import React, { useState, useEffect } from 'react'
import {
  Users,
  Search,
  Plus,
  QrCode,
  ShieldAlert,
  ShieldCheck,
  Coins,
  History,
  MoreVertical,
  X,
  CheckCircle2,
  AlertCircle,
  Phone,
  Mail,
  Calendar,
  Lock,
  Unlock,
  RefreshCw,
  Eye,
  Crown,
} from 'lucide-react'
import { formatCurrency, formatPoints, formatDate, formatPhone } from '@/lib/utils'
import { toast } from 'sonner'
import QRCode from 'qrcode'

export default function AdminClientesPage() {
  const [clientes, setClientes] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  
  // Modales
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showAdjustModal, setShowAdjustModal] = useState(false)
  
  // Cliente seleccionado
  const [selectedClient, setSelectedClient] = useState<any>(null)
  const [clientQrDataUrl, setClientQrDataUrl] = useState<string>('')
  
  // Formulario de creación manual
  const [createForm, setCreateForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    birthDate: '',
    initialPoints: 0,
  })
  const [isCreating, setIsCreating] = useState(false)

  // Formulario de ajuste de puntos
  const [adjustForm, setAdjustForm] = useState({
    amount: '',
    type: 'add', // 'add' | 'subtract'
    description: '',
  })
  const [isAdjusting, setIsAdjusting] = useState(false)

  const fetchClientes = () => {
    setIsLoading(true)
    const url = searchTerm
      ? `/api/admin/clientes?search=${encodeURIComponent(searchTerm)}`
      : '/api/admin/clientes'

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.customers) {
          setClientes(data.customers)
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchClientes()
    }, 300)
    return () => clearTimeout(delayDebounce)
  }, [searchTerm])

  // Ver detalle y generar QR
  const handleViewDetail = async (client: any) => {
    setSelectedClient(client)
    try {
      const qrData = client.qrCode || `LUXURI-VIP-${client.customerCode}`
      const url = await QRCode.toDataURL(qrData, {
        width: 300,
        margin: 2,
        color: {
          dark: '#070A11',
          light: '#FFFFFF',
        },
      })
      setClientQrDataUrl(url)
      setShowDetailModal(true)
    } catch {
      toast.error('Error al generar código QR')
    }
  }

  // Abrir modal de ajuste de puntos
  const handleOpenAdjust = (client: any) => {
    setSelectedClient(client)
    setAdjustForm({
      amount: '',
      type: 'add',
      description: '',
    })
    setShowAdjustModal(true)
  }

  // Bloquear / Desbloquear cuenta
  const handleToggleStatus = async (client: any) => {
    const isCurrentlyActive = client.user?.isActive !== false
    const actionText = isCurrentlyActive ? 'bloquear' : 'reactivar'

    if (!confirm(`¿Estás seguro de que deseas ${actionText} la cuenta de ${client.firstName} ${client.lastName}?`)) {
      return
    }

    try {
      const res = await fetch(`/api/admin/clientes/${client.id}/estado`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isCurrentlyActive }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Error al cambiar estado')
        return
      }

      toast.success(`Cuenta de cliente ${isCurrentlyActive ? 'bloqueada' : 'reactivada'} correctamente`)
      fetchClientes()
    } catch {
      toast.error('Error al procesar la solicitud')
    }
  }

  // Crear cliente manualmente
  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!createForm.firstName || !createForm.lastName || !createForm.phone) {
      toast.error('Nombres, apellidos y celular son obligatorios')
      return
    }

    setIsCreating(true)
    try {
      const res = await fetch('/api/admin/clientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createForm),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Error al registrar cliente')
        return
      }

      toast.success('Cliente registrado exitosamente (PIN por defecto: 1234)')
      setShowCreateModal(false)
      setCreateForm({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        birthDate: '',
        initialPoints: 0,
      })
      fetchClientes()
    } catch {
      toast.error('Error al registrar cliente')
    } finally {
      setIsCreating(false)
    }
  }

  // Confirmar ajuste de puntos
  const handleAdjustPoints = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!adjustForm.amount || Number(adjustForm.amount) <= 0) {
      toast.error('Ingresa una cantidad de puntos válida')
      return
    }

    if (!adjustForm.description.trim()) {
      toast.error('El motivo del ajuste es estrictamente obligatorio')
      return
    }

    const pointsValue =
      adjustForm.type === 'subtract'
        ? -Math.abs(Number(adjustForm.amount))
        : Math.abs(Number(adjustForm.amount))

    setIsAdjusting(true)
    try {
      const res = await fetch(`/api/admin/clientes/${selectedClient.id}/ajustar-puntos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: pointsValue,
          description: adjustForm.description.trim(),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Error al ajustar puntos')
        return
      }

      toast.success('Ajuste de puntos aplicado exitosamente')
      setShowAdjustModal(false)
      fetchClientes()
    } catch {
      toast.error('Error al aplicar ajuste')
    } finally {
      setIsAdjusting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Black & Gold */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Users className="w-7 h-7 text-amber-400" />
            Gestión de Clientes VIP
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Consulta, registra, bloquea cuentas y realiza ajustes de puntos autorizados en <span className="text-amber-400 font-semibold">Luxuri Private Travel</span>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-amber-500/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 text-slate-950" />
            Registrar Cliente Manualmente
          </button>
        </div>
      </div>

      {/* Buscador y Filtros Black & Gold */}
      <div className="bg-[#0B0F19] rounded-2xl p-4 border border-amber-500/20 shadow-xl flex items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nombre, apellido, celular o código VIP..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-[#121827] border border-amber-500/20 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
          />
        </div>
        <span className="text-xs text-amber-400/80 font-bold hidden sm:inline whitespace-nowrap">
          {clientes.length} cliente(s) registrados
        </span>
      </div>

      {/* Tabla de Clientes Black & Gold */}
      <div className="bg-[#0B0F19] rounded-2xl border border-amber-500/20 shadow-xl overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400 text-sm flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
            Cargando clientes...
          </div>
        ) : clientes.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            No se encontraron clientes registrados con ese criterio.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm text-slate-300">
              <thead className="bg-[#121827] text-xs uppercase font-bold text-slate-400 border-b border-amber-500/10">
                <tr>
                  <th className="px-5 py-3.5">Cliente</th>
                  <th className="px-5 py-3.5">Celular</th>
                  <th className="px-5 py-3.5">Código VIP</th>
                  <th className="px-5 py-3.5">Puntos Disp.</th>
                  <th className="px-5 py-3.5">Total Acumulado</th>
                  <th className="px-5 py-3.5">Estado</th>
                  <th className="px-5 py-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-500/10">
                {clientes.map((c) => {
                  const isActive = c.user?.isActive !== false
                  return (
                    <tr key={c.id} className="hover:bg-[#121827]/70 transition-colors">
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-linear-to-br from-amber-500 to-amber-600 text-slate-950 font-black text-xs flex items-center justify-center border border-amber-400 shadow-xs">
                            {c.firstName?.[0]}{c.lastName?.[0]}
                          </div>
                          <div>
                            <span className="font-bold text-white block">
                              {c.firstName} {c.lastName}
                            </span>
                            <span className="text-[11px] text-slate-400">{c.email || 'Sin email'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 font-mono text-xs text-slate-300 whitespace-nowrap">
                        {formatPhone(c.phone)}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="font-mono text-xs font-black bg-[#121827] text-amber-400 px-2.5 py-1 rounded-lg border border-amber-500/30">
                          {c.customerCode}
                        </span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap font-black text-amber-400">
                        {formatPoints(c.availablePoints)} pts
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap font-bold text-white">
                        {formatPoints(c.totalPoints)} pts
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full font-bold border ${
                            isActive
                              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                              : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                          }`}
                        >
                          {isActive ? (
                            <>
                              <ShieldCheck className="w-3 h-3 text-emerald-400" /> Activo
                            </>
                          ) : (
                            <>
                              <ShieldAlert className="w-3 h-3 text-rose-400" /> Bloqueado
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right whitespace-nowrap space-x-1">
                        <button
                          onClick={() => handleViewDetail(c)}
                          className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-[#121827] rounded-lg transition-colors"
                          title="Ver Detalle y QR"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenAdjust(c)}
                          className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-[#121827] rounded-lg transition-colors"
                          title="Ajuste Manual de Puntos"
                        >
                          <Coins className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(c)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            isActive
                              ? 'text-slate-400 hover:text-rose-400 hover:bg-[#121827]'
                              : 'text-slate-400 hover:text-emerald-400 hover:bg-[#121827]'
                          }`}
                          title={isActive ? 'Bloquear cuenta' : 'Desbloquear cuenta'}
                        >
                          {isActive ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal 1: Registro Manual de Cliente Black & Gold */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="bg-[#0B0F19] rounded-2xl max-w-md w-full p-6 shadow-2xl border border-amber-500/30 text-white">
            <div className="flex items-center justify-between pb-4 border-b border-amber-500/10">
              <h3 className="font-black text-white text-base">Registrar Nuevo Cliente VIP</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Nombres *
                  </label>
                  <input
                    type="text"
                    required
                    value={createForm.firstName}
                    onChange={(e) => setCreateForm({ ...createForm, firstName: e.target.value })}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-[#121827] border border-amber-500/20 rounded-xl text-white focus:outline-hidden focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Apellidos *
                  </label>
                  <input
                    type="text"
                    required
                    value={createForm.lastName}
                    onChange={(e) => setCreateForm({ ...createForm, lastName: e.target.value })}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-[#121827] border border-amber-500/20 rounded-xl text-white focus:outline-hidden focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Número Celular * (9 dígitos)
                </label>
                <input
                  type="tel"
                  required
                  maxLength={9}
                  placeholder="987654321"
                  value={createForm.phone}
                  onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-[#121827] border border-amber-500/20 rounded-xl text-white focus:outline-hidden focus:border-amber-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Correo Electrónico (Opcional)
                </label>
                <input
                  type="email"
                  placeholder="cliente@email.com"
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-[#121827] border border-amber-500/20 rounded-xl text-white focus:outline-hidden focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Puntos Iniciales de Bienvenida
                </label>
                <input
                  type="number"
                  min="0"
                  value={createForm.initialPoints}
                  onChange={(e) => setCreateForm({ ...createForm, initialPoints: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-[#121827] border border-amber-500/20 rounded-xl text-white focus:outline-hidden focus:border-amber-400"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white rounded-xl hover:bg-[#121827]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-5 py-2 text-xs font-black bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl shadow-md shadow-amber-500/20"
                >
                  {isCreating ? 'Guardando...' : 'Crear Cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Detalle del Cliente y QR Black & Gold */}
      {showDetailModal && selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="bg-[#0B0F19] rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-amber-500/30 text-white">
            <div className="flex items-center justify-between pb-4 border-b border-amber-500/10">
              <div>
                <h3 className="font-bold text-white text-base">
                  {selectedClient.firstName} {selectedClient.lastName}
                </h3>
                <span className="text-xs font-mono text-amber-400">
                  Código: {selectedClient.customerCode}
                </span>
              </div>
              <button onClick={() => setShowDetailModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-4">
              {/* QR en Alta Resolución */}
              <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-amber-500/20">
                {clientQrDataUrl ? (
                  <img src={clientQrDataUrl} alt="QR Cliente" className="w-48 h-48 rounded-xl shadow-md" />
                ) : (
                  <div className="w-48 h-48 flex items-center justify-center text-xs text-slate-400">
                    Cargando QR...
                  </div>
                )}
                <span className="font-mono text-xs font-black text-slate-900 mt-2 bg-amber-400 px-3 py-1 rounded-full shadow-xs">
                  {selectedClient.customerCode}
                </span>
              </div>

              {/* Métricas de Puntos */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-[#121827] p-2.5 rounded-xl border border-amber-500/20">
                  <span className="text-[10px] uppercase font-bold text-amber-400 block">Disponibles</span>
                  <span className="text-base font-black text-white">{selectedClient.availablePoints}</span>
                </div>
                <div className="bg-[#121827] p-2.5 rounded-xl border border-amber-500/20">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Reservados</span>
                  <span className="text-base font-black text-amber-300">{selectedClient.reservedPoints || 0}</span>
                </div>
                <div className="bg-[#121827] p-2.5 rounded-xl border border-amber-500/20">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Acumulados</span>
                  <span className="text-base font-black text-white">{selectedClient.totalPoints}</span>
                </div>
              </div>

              {/* Información Personal */}
              <div className="text-xs space-y-1.5 text-slate-300 bg-[#121827] p-3.5 rounded-xl border border-amber-500/10">
                <p><strong>Celular:</strong> {formatPhone(selectedClient.phone)}</p>
                <p><strong>Email:</strong> {selectedClient.email || 'No registrado'}</p>
                <p><strong>Cumpleaños:</strong> {formatDate(selectedClient.birthDate)}</p>
                <p><strong>Registrado el:</strong> {formatDate(selectedClient.createdAt)}</p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowDetailModal(false)}
                className="px-5 py-2 text-xs font-bold bg-[#121827] hover:bg-[#1A2234] border border-amber-500/20 text-slate-200 rounded-xl"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: Ajuste Manual de Puntos con Motivo Obligatorio Black & Gold */}
      {showAdjustModal && selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="bg-[#0B0F19] rounded-2xl max-w-md w-full p-6 shadow-2xl border border-amber-500/30 text-white">
            <div className="flex items-center justify-between pb-4 border-b border-amber-500/10">
              <div>
                <h3 className="font-bold text-white text-base">Ajuste Manual de Puntos</h3>
                <span className="text-xs text-amber-400">
                  Cliente: {selectedClient.firstName} {selectedClient.lastName}
                </span>
              </div>
              <button onClick={() => setShowAdjustModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdjustPoints} className="space-y-4 pt-4">
              <div className="bg-amber-500/10 p-3 rounded-xl border border-amber-500/20 text-xs text-amber-300">
                Saldo actual: <strong>{selectedClient.availablePoints} puntos disponibles</strong>.
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Tipo de Ajuste *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustForm({ ...adjustForm, type: 'add' })}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                      adjustForm.type === 'add'
                        ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                        : 'bg-[#121827] text-slate-300 border-amber-500/15'
                    }`}
                  >
                    + Sumar Puntos
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustForm({ ...adjustForm, type: 'subtract' })}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                      adjustForm.type === 'subtract'
                        ? 'bg-rose-600 text-white border-rose-500 shadow-md'
                        : 'bg-[#121827] text-slate-300 border-amber-500/15'
                    }`}
                  >
                    - Restar Puntos
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Cantidad de Puntos *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  placeholder="Ej: 50"
                  value={adjustForm.amount}
                  onChange={(e) => setAdjustForm({ ...adjustForm, amount: e.target.value })}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-[#121827] border border-amber-500/20 rounded-xl text-white focus:outline-hidden focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Motivo Obligatorio del Ajuste *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Explica detalladamente la razón (ej: Bonificación por fidelidad, corrección por error en boleto #123, etc.)"
                  value={adjustForm.description}
                  onChange={(e) => setAdjustForm({ ...adjustForm, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-[#121827] border border-amber-500/20 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Este motivo se guardará permanentemente en el libro de auditoría y movimientos.
                </p>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAdjustModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white rounded-xl hover:bg-[#121827]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isAdjusting}
                  className="px-5 py-2 text-xs font-black bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl shadow-md shadow-amber-500/20"
                >
                  {isAdjusting ? 'Aplicando...' : 'Confirmar Ajuste'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
