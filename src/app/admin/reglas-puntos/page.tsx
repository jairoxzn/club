'use client'

import React, { useState, useEffect } from 'react'
import {
  Coins,
  Plus,
  Bus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  X,
  RefreshCw,
  Calculator,
  Sparkles,
  ArrowRight,
  Info,
  Crown,
} from 'lucide-react'
import { toast } from 'sonner'
import { formatCurrency, formatDate } from '@/lib/utils'

export default function AdminReglasPuntosPage() {
  const [rules, setRules] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingRule, setEditingRule] = useState<any>(null)

  // Formulario
  const [form, setForm] = useState({
    categoryId: '',
    pointsPerUnit: '1',
    amountBase: '10',
    roundingMode: 'FLOOR',
    minEligibleAmount: '0',
    maxPointsPerService: '',
    validFrom: '',
    validUntil: '',
    isActive: true,
    notes: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Simulador interactivo
  const [simCategory, setSimCategory] = useState('')
  const [simAmount, setSimAmount] = useState('100')
  const [simResult, setSimResult] = useState<any>(null)
  const [isSimulating, setIsSimulating] = useState(false)

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [resRules, resCats] = await Promise.all([
        fetch('/api/admin/reglas-puntos'),
        fetch('/api/admin/categorias'),
      ])
      const dataRules = await resRules.json()
      const dataCats = await resCats.json()

      if (dataRules && dataRules.rules) setRules(dataRules.rules)
      if (dataCats && dataCats.categories) {
        setCategories(dataCats.categories)
        if (dataCats.categories.length > 0 && !simCategory) {
          setSimCategory(dataCats.categories[0].id)
        }
      }
    } catch (err) {
      console.error(err)
      toast.error('Error al cargar reglas')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Ejecutar simulador en tiempo real
  useEffect(() => {
    if (!simCategory || !simAmount || Number(simAmount) <= 0) {
      setSimResult(null)
      return
    }

    const timer = setTimeout(() => {
      setIsSimulating(true)
      fetch('/api/servicios/calcular-puntos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryId: simCategory,
          amount: Number(simAmount),
        }),
      })
        .then((res) => res.json())
        .then((data) => setSimResult(data))
        .catch(() => setSimResult(null))
        .finally(() => setIsSimulating(false))
    }, 250)

    return () => clearTimeout(timer)
  }, [simCategory, simAmount])

  const handleOpenCreate = () => {
    setEditingRule(null)
    setForm({
      categoryId: categories[0]?.id || '',
      pointsPerUnit: '1',
      amountBase: '10',
      roundingMode: 'FLOOR',
      minEligibleAmount: '0',
      maxPointsPerService: '',
      validFrom: new Date().toISOString().split('T')[0],
      validUntil: '',
      isActive: true,
      notes: '',
    })
    setShowModal(true)
  }

  const handleOpenEdit = (rule: any) => {
    setEditingRule(rule)
    setForm({
      categoryId: rule.categoryId,
      pointsPerUnit: String(rule.pointsPerUnit),
      amountBase: String(rule.amountBase),
      roundingMode: rule.roundingMode || 'FLOOR',
      minEligibleAmount: String(rule.minEligibleAmount || 0),
      maxPointsPerService: rule.maxPointsPerService ? String(rule.maxPointsPerService) : '',
      validFrom: rule.validFrom ? new Date(rule.validFrom).toISOString().split('T')[0] : '',
      validUntil: rule.validUntil ? new Date(rule.validUntil).toISOString().split('T')[0] : '',
      isActive: rule.isActive !== false,
      notes: rule.notes || '',
    })
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.categoryId) {
      toast.error('Selecciona una categoría')
      return
    }

    setIsSubmitting(true)
    try {
      const url = editingRule
        ? `/api/admin/reglas-puntos/${editingRule.id}`
        : '/api/admin/reglas-puntos'
      const method = editingRule ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryId: form.categoryId,
          pointsPerUnit: Number(form.pointsPerUnit),
          amountBase: Number(form.amountBase),
          roundingMode: form.roundingMode,
          minEligibleAmount: Number(form.minEligibleAmount || 0),
          maxPointsPerService: form.maxPointsPerService ? Number(form.maxPointsPerService) : null,
          validFrom: form.validFrom ? new Date(form.validFrom).toISOString() : new Date().toISOString(),
          validUntil: form.validUntil ? new Date(form.validUntil).toISOString() : null,
          isActive: form.isActive,
          notes: form.notes || undefined,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Error al guardar regla')
        return
      }

      toast.success(editingRule ? 'Regla actualizada' : 'Regla creada con éxito')
      setShowModal(false)
      fetchData()
    } catch {
      toast.error('Error al conectar')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Coins className="w-7 h-7 text-amber-400" />
            Motor de Acumulación de Puntos
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Configura la tasa de emisión, montos base, redondeo y topes para cada tipo de traslado en <span className="text-amber-400 font-semibold">Luxuri Private Travel</span>.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-amber-500/20 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4 text-slate-950" />
          Nueva Regla de Puntos
        </button>
      </div>

      {/* Simulador Interactivo Black & Gold */}
      <div className="bg-[#0B0F19] rounded-2xl p-6 text-white shadow-xl border border-amber-500/30 relative overflow-hidden">
        <div className="flex items-center gap-2 mb-3">
          <Calculator className="w-5 h-5 text-amber-400" />
          <h3 className="font-bold text-base text-white">Simulador del Motor de Puntos</h3>
          <span className="text-[11px] bg-amber-500/10 text-amber-300 font-bold px-2.5 py-0.5 rounded-full border border-amber-500/30">
            Tiempo Real
          </span>
        </div>
        <p className="text-xs text-slate-400 mb-4 max-w-2xl">
          Comprueba de inmediato cómo el sistema calcula los puntos aplicando las reglas activas de cada categoría.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
          <div>
            <label className="block text-[11px] uppercase font-bold tracking-wider text-slate-400 mb-1">
              Categoría
            </label>
            <select
              value={simCategory}
              onChange={(e) => setSimCategory(e.target.value)}
              className="w-full bg-[#121827] text-white text-xs sm:text-sm px-3 py-2 rounded-xl border border-amber-500/20 focus:outline-hidden focus:border-amber-400"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] uppercase font-bold tracking-wider text-slate-400 mb-1">
              Monto Pagado (S/)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400 text-xs font-black">
                S/
              </span>
              <input
                type="number"
                value={simAmount}
                onChange={(e) => setSimAmount(e.target.value)}
                className="w-full bg-[#121827] text-white text-xs sm:text-sm pl-8 pr-3 py-2 rounded-xl border border-amber-500/20 focus:outline-hidden focus:border-amber-400 font-black"
              />
            </div>
          </div>

          <div className="bg-[#121827] rounded-xl p-3 border border-amber-500/20 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-400 block font-bold">Puntos Calculados</span>
              <span className="text-2xl font-black text-amber-400">
                {isSimulating ? '...' : `+${simResult?.points || 0} pts`}
              </span>
            </div>
            <Sparkles className="w-6 h-6 text-amber-400 fill-amber-400" />
          </div>
        </div>
      </div>

      {/* Lista de Reglas Configuradas Black & Gold */}
      <div className="bg-[#0B0F19] rounded-2xl border border-amber-500/20 shadow-xl overflow-hidden">
        <div className="p-5 border-b border-amber-500/10 flex items-center justify-between bg-[#070A11]/60">
          <h3 className="font-bold text-white text-base">Reglas Configuradas por Categoría</h3>
          <span className="text-xs text-amber-400/80 font-bold">{rules.length} regla(s) activas</span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-slate-400 text-sm flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
            Cargando reglas...
          </div>
        ) : rules.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            No hay reglas configuradas. Crea una para comenzar a acumular puntos.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm text-slate-300">
              <thead className="bg-[#121827] text-xs uppercase font-bold text-slate-400 border-b border-amber-500/10">
                <tr>
                  <th className="px-5 py-3.5">Categoría</th>
                  <th className="px-5 py-3.5">Fórmula de Puntos</th>
                  <th className="px-5 py-3.5">Redondeo</th>
                  <th className="px-5 py-3.5">Mínimo Elegible</th>
                  <th className="px-5 py-3.5">Tope Máx.</th>
                  <th className="px-5 py-3.5">Estado</th>
                  <th className="px-5 py-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-500/10">
                {rules.map((rule) => (
                  <tr key={rule.id} className="hover:bg-[#121827]/70 transition-colors">
                    <td className="px-5 py-4 font-bold text-white whitespace-nowrap">
                      {rule.category?.name}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="font-black text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20 text-xs">
                        {rule.pointsPerUnit} pt(s) por cada S/{rule.amountBase}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs font-mono text-slate-300 whitespace-nowrap">
                      {rule.roundingMode === 'FLOOR'
                        ? 'Hacia abajo (Floor)'
                        : rule.roundingMode === 'CEIL'
                        ? 'Hacia arriba (Ceil)'
                        : 'Matemático (Round)'}
                    </td>
                    <td className="px-5 py-4 text-xs font-bold text-white whitespace-nowrap">
                      {formatCurrency(rule.minEligibleAmount)}
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-300 whitespace-nowrap">
                      {rule.maxPointsPerService ? `${rule.maxPointsPerService} pts` : 'Sin límite'}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full font-bold border ${
                          rule.isActive
                            ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {rule.isActive ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleOpenEdit(rule)}
                        className="text-xs text-amber-400 hover:text-amber-300 font-bold p-1.5 hover:bg-[#121827] rounded-lg transition-colors"
                      >
                        Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Crear / Editar Regla Black & Gold */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="bg-[#0B0F19] rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-amber-500/30 text-white">
            <div className="flex items-center justify-between pb-4 border-b border-amber-500/10">
              <h3 className="font-black text-white text-base">
                {editingRule ? 'Editar Regla de Puntos' : 'Configurar Regla de Acumulación'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Categoría de Transporte *
                </label>
                <select
                  value={form.categoryId}
                  onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-[#121827] border border-amber-500/20 rounded-xl text-white focus:outline-hidden focus:border-amber-400"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Puntos Emitidos *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={form.pointsPerUnit}
                    onChange={(e) => setForm({ ...form, pointsPerUnit: e.target.value })}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-[#121827] border border-amber-500/20 rounded-xl text-white focus:outline-hidden focus:border-amber-400 font-bold"
                  />
                  <p className="text-[11px] text-slate-400 mt-0.5">Ej: 1, 2, 5 puntos</p>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Por Cada Monto Base (S/) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.10"
                    required
                    value={form.amountBase}
                    onChange={(e) => setForm({ ...form, amountBase: e.target.value })}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-[#121827] border border-amber-500/20 rounded-xl text-white focus:outline-hidden focus:border-amber-400 font-bold"
                  />
                  <p className="text-[11px] text-slate-400 mt-0.5">Ej: 10.00 = S/10</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Modo de Redondeo
                  </label>
                  <select
                    value={form.roundingMode}
                    onChange={(e) => setForm({ ...form, roundingMode: e.target.value })}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-[#121827] border border-amber-500/20 rounded-xl text-white focus:outline-hidden focus:border-amber-400"
                  >
                    <option value="FLOOR">Hacia abajo (Floor)</option>
                    <option value="ROUND">Matemático (Round)</option>
                    <option value="CEIL">Hacia arriba (Ceil)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Monto Mínimo Elegible (S/)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.minEligibleAmount}
                    onChange={(e) => setForm({ ...form, minEligibleAmount: e.target.value })}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-[#121827] border border-amber-500/20 rounded-xl text-white focus:outline-hidden focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Tope Máximo de Puntos por Servicio (Opcional)
                </label>
                <input
                  type="number"
                  placeholder="Vacío para sin límite"
                  value={form.maxPointsPerService}
                  onChange={(e) => setForm({ ...form, maxPointsPerService: e.target.value })}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-[#121827] border border-amber-500/20 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Notas / Justificación
                </label>
                <textarea
                  rows={2}
                  placeholder="Ej: Tasa promocional temporada alta..."
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-[#121827] border border-amber-500/20 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="ruleActive"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="w-4 h-4 accent-amber-500 rounded"
                />
                <label htmlFor="ruleActive" className="text-xs text-slate-300 font-bold cursor-pointer">
                  Regla activa para aplicar a nuevos traslados
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
                  {isSubmitting ? 'Guardando...' : editingRule ? 'Guardar Cambios' : 'Crear Regla'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
