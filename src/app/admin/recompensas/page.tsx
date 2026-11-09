'use client'

import React, { useState, useEffect } from 'react'
import {
  Gift,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  X,
  RefreshCw,
  Calendar,
  Layers,
  Award,
  Crown,
  Sparkles,
} from 'lucide-react'
import { toast } from 'sonner'
import { formatCurrency, formatPoints, formatDate } from '@/lib/utils'

export default function AdminRecompensasPage() {
  const [rewards, setRewards] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingReward, setEditingReward] = useState<any>(null)

  const [form, setForm] = useState({
    name: '',
    description: '',
    imageUrl: '',
    pointsRequired: '100',
    stock: '',
    startDate: '',
    endDate: '',
    conditions: '',
    isActive: true,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchRewards = () => {
    setIsLoading(true)
    fetch('/api/admin/recompensas')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.rewards) {
          setRewards(data.rewards)
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    fetchRewards()
  }, [])

  const handleOpenCreate = () => {
    setEditingReward(null)
    setForm({
      name: '',
      description: '',
      imageUrl: '',
      pointsRequired: '100',
      stock: '',
      startDate: '',
      endDate: '',
      conditions: '',
      isActive: true,
    })
    setShowModal(true)
  }

  const handleOpenEdit = (reward: any) => {
    setEditingReward(reward)
    setForm({
      name: reward.name,
      description: reward.description || '',
      imageUrl: reward.imageUrl || '',
      pointsRequired: String(reward.pointsRequired),
      stock: reward.stock !== null && reward.stock !== undefined ? String(reward.stock) : '',
      startDate: reward.startDate ? new Date(reward.startDate).toISOString().split('T')[0] : '',
      endDate: reward.endDate ? new Date(reward.endDate).toISOString().split('T')[0] : '',
      conditions: reward.conditions || '',
      isActive: reward.isActive !== false,
    })
    setShowModal(true)
  }

  const handleDelete = async (reward: any) => {
    if (!confirm(`¿Eliminar la recompensa "${reward.name}"?`)) return

    try {
      const res = await fetch(`/api/admin/recompensas/${reward.id}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'No se pudo eliminar la recompensa')
        return
      }
      toast.success('Recompensa eliminada')
      fetchRewards()
    } catch {
      toast.error('Error al eliminar')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) {
      toast.error('El nombre de la recompensa es obligatorio')
      return
    }

    if (!form.pointsRequired || Number(form.pointsRequired) <= 0) {
      toast.error('Los puntos requeridos deben ser mayores a 0')
      return
    }

    setIsSubmitting(true)
    try {
      const url = editingReward
        ? `/api/admin/recompensas/${editingReward.id}`
        : '/api/admin/recompensas'
      const method = editingReward ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          description: form.description.trim() || undefined,
          imageUrl: form.imageUrl.trim() || undefined,
          pointsRequired: Number(form.pointsRequired),
          stock: form.stock ? Number(form.stock) : null,
          startDate: form.startDate ? new Date(form.startDate).toISOString() : null,
          endDate: form.endDate ? new Date(form.endDate).toISOString() : null,
          conditions: form.conditions.trim() || undefined,
          isActive: form.isActive,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Error al guardar recompensa')
        return
      }

      toast.success(editingReward ? 'Recompensa actualizada' : 'Recompensa creada con éxito')
      setShowModal(false)
      fetchRewards()
    } catch {
      toast.error('Error de conexión')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Gift className="w-7 h-7 text-amber-400" />
            Catálogo de Recompensas
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Crea y administra los beneficios, traslados gratuitos y premios VIP en <span className="text-amber-400 font-semibold">Luxuri Private Travel</span>.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-amber-500/20 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4 text-slate-950" />
          Nueva Recompensa
        </button>
      </div>

      {/* Grid de Recompensas Black & Gold */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full p-12 text-center text-slate-400 text-sm flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
            Cargando catálogo...
          </div>
        ) : rewards.length === 0 ? (
          <div className="col-span-full p-12 text-center text-slate-500 text-sm">
            No hay recompensas registradas.
          </div>
        ) : (
          rewards.map((r) => (
            <div
              key={r.id}
              className="bg-[#0B0F19] rounded-2xl border border-amber-500/20 shadow-xl overflow-hidden flex flex-col justify-between hover:border-amber-400 transition-all"
            >
              <div className="p-6">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <span className="text-xl font-black text-amber-400 bg-amber-500/10 px-3 py-1 rounded-xl border border-amber-500/20">
                    {r.pointsRequired} pts
                  </span>
                  <span
                    className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold border ${
                      r.isActive
                        ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {r.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </div>

                <h3 className="font-bold text-white text-lg mb-2">{r.name}</h3>
                <p className="text-xs text-slate-400 mb-4 line-clamp-3">
                  {r.description || 'Sin descripción'}
                </p>

                {r.conditions && (
                  <div className="bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20 text-[11px] text-amber-300 mb-4">
                    <strong>Condiciones:</strong> {r.conditions}
                  </div>
                )}
              </div>

              <div className="px-6 py-4 bg-[#121827] border-t border-amber-500/10 flex items-center justify-between text-xs text-slate-400">
                <span className="font-medium">
                  Stock:{' '}
                  <strong className="text-amber-400 font-bold">
                    {r.stock !== null ? `${r.stock} unid.` : 'Ilimitado'}
                  </strong>
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(r)}
                    className="p-1.5 text-amber-400 hover:text-amber-300 hover:bg-[#1A2234] rounded-lg transition-colors font-bold flex items-center gap-1"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Editar
                  </button>
                  <button
                    onClick={() => handleDelete(r)}
                    className="p-1.5 text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Crear / Editar Black & Gold */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="bg-[#0B0F19] rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-amber-500/30 text-white max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-amber-500/10">
              <h3 className="font-black text-white text-base">
                {editingReward ? 'Editar Recompensa' : 'Nueva Recompensa VIP'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Nombre del Premio *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Traslado Aeropuerto Gratis, Descuento S/50..."
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-[#121827] border border-amber-500/20 rounded-xl text-white focus:outline-hidden focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Puntos Necesarios *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={form.pointsRequired}
                  onChange={(e) => setForm({ ...form, pointsRequired: e.target.value })}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-[#121827] border border-amber-500/20 rounded-xl text-white focus:outline-hidden focus:border-amber-400 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Stock Disponible (Opcional)
                </label>
                <input
                  type="number"
                  placeholder="Vacío para stock ilimitado"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-[#121827] border border-amber-500/20 rounded-xl text-white focus:outline-hidden focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Descripción
                </label>
                <textarea
                  rows={2}
                  placeholder="Detalles de la recompensa..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-[#121827] border border-amber-500/20 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Condiciones y Restricciones
                </label>
                <textarea
                  rows={2}
                  placeholder="Ej: Sujeto a disponibilidad de flota con 24h de anticipación..."
                  value={form.conditions}
                  onChange={(e) => setForm({ ...form, conditions: e.target.value })}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-[#121827] border border-amber-500/20 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isActiveReward"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="w-4 h-4 accent-amber-500 rounded"
                />
                <label htmlFor="isActiveReward" className="text-xs text-slate-300 font-bold cursor-pointer">
                  Recompensa visible y disponible para canje
                </label>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white rounded-xl hover:bg-[#121827]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-black bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl shadow-md shadow-amber-500/20"
                >
                  {isSubmitting ? 'Guardando...' : editingReward ? 'Guardar Cambios' : 'Crear Recompensa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
