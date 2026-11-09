'use client'

import React, { useState, useEffect } from 'react'
import {
  Tag,
  Plus,
  Bus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  X,
  RefreshCw,
  FolderPlus,
  Sparkles,
  Crown,
} from 'lucide-react'
import { toast } from 'sonner'
import { formatDate } from '@/lib/utils'

export default function AdminCategoriasPage() {
  const [categories, setCategories] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<any>(null)

  const [form, setForm] = useState({
    name: '',
    description: '',
    color: '#D4AF37',
    isActive: true,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchCategories = () => {
    setIsLoading(true)
    fetch('/api/admin/categorias')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.categories) {
          setCategories(data.categories)
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const handleOpenCreate = () => {
    setEditingCategory(null)
    setForm({
      name: '',
      description: '',
      color: '#D4AF37',
      isActive: true,
    })
    setShowModal(true)
  }

  const handleOpenEdit = (category: any) => {
    setEditingCategory(category)
    setForm({
      name: category.name,
      description: category.description || '',
      color: category.color || '#D4AF37',
      isActive: category.isActive !== false,
    })
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) {
      toast.error('El nombre de la categoría es obligatorio')
      return
    }

    setIsSubmitting(true)
    try {
      const url = editingCategory
        ? `/api/admin/categorias/${editingCategory.id}`
        : '/api/admin/categorias'
      const method = editingCategory ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Error al guardar categoría')
        return
      }

      toast.success(
        editingCategory ? 'Categoría actualizada' : 'Categoría creada con éxito'
      )
      setShowModal(false)
      fetchCategories()
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
            <Tag className="w-7 h-7 text-amber-400" />
            Categorías de Transporte
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Administra los tipos de servicios de traslados en <span className="text-amber-400 font-semibold">Luxuri Private Travel</span>.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-amber-500/20 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4 text-slate-950" />
          Nueva Categoría
        </button>
      </div>

      {/* Grid de Categorías Black & Gold */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          <div className="col-span-full p-12 text-center text-slate-400 text-sm flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
            Cargando categorías...
          </div>
        ) : categories.length === 0 ? (
          <div className="col-span-full p-12 text-center text-slate-500 text-sm">
            No hay categorías registradas.
          </div>
        ) : (
          categories.map((cat) => (
            <div
              key={cat.id}
              className="bg-[#0B0F19] rounded-2xl p-5 border border-amber-500/20 shadow-xl flex flex-col justify-between hover:border-amber-400 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-950 font-black shadow-md border border-amber-400/50"
                    style={{ backgroundColor: cat.color || '#D4AF37' }}
                  >
                    <Bus className="w-5 h-5 text-slate-950" />
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-bold border ${
                      cat.isActive
                        ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {cat.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </div>

                <h3 className="font-bold text-white text-base mb-1">{cat.name}</h3>
                <p className="text-xs text-slate-400 mb-4 line-clamp-2">
                  {cat.description || 'Sin descripción'}
                </p>
              </div>

              <div className="pt-3 border-t border-amber-500/10 flex items-center justify-between text-xs text-slate-400">
                <span>{cat._count?.services || 0} servicios</span>
                <button
                  onClick={() => handleOpenEdit(cat)}
                  className="p-1.5 text-amber-400 hover:text-amber-300 hover:bg-[#121827] rounded-lg transition-colors font-bold flex items-center gap-1"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Editar
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Crear / Editar Black & Gold */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="bg-[#0B0F19] rounded-2xl max-w-md w-full p-6 shadow-2xl border border-amber-500/30 text-white">
            <div className="flex items-center justify-between pb-4 border-b border-amber-500/10">
              <h3 className="font-black text-white text-base">
                {editingCategory ? 'Editar Categoría' : 'Nueva Categoría de Transporte'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Nombre de la Categoría *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Traslado de Aeropuerto, Tours Turísticos..."
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-[#121827] border border-amber-500/20 rounded-xl text-white focus:outline-hidden focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Descripción
                </label>
                <textarea
                  rows={2}
                  placeholder="Detalles del alcance o servicio..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-[#121827] border border-amber-500/20 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Color Identificador (UI)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={form.color}
                    onChange={(e) => setForm({ ...form, color: e.target.value })}
                    className="w-10 h-10 rounded-xl cursor-pointer border border-amber-500/20 bg-transparent"
                  />
                  <input
                    type="text"
                    value={form.color}
                    onChange={(e) => setForm({ ...form, color: e.target.value })}
                    className="flex-1 px-3 py-2 text-xs font-mono bg-[#121827] border border-amber-500/20 text-white rounded-xl uppercase"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="w-4 h-4 accent-amber-500 rounded"
                />
                <label htmlFor="isActive" className="text-xs text-slate-300 font-bold cursor-pointer">
                  Categoría activa para nuevos servicios
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
                  {isSubmitting ? 'Guardando...' : editingCategory ? 'Guardar Cambios' : 'Crear Categoría'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
