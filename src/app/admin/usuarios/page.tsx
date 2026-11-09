'use client'

import React, { useState, useEffect } from 'react'
import {
  UserCheck,
  Plus,
  Search,
  Shield,
  ShieldCheck,
  Lock,
  Unlock,
  KeyRound,
  Edit2,
  X,
  RefreshCw,
  Mail,
  User,
  Crown,
} from 'lucide-react'
import { toast } from 'sonner'
import { formatDate } from '@/lib/utils'

export default function AdminUsuariosPage() {
  const [users, setUsers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState<any>(null)

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    role: 'STAFF',
    isActive: true,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchUsers = () => {
    setIsLoading(true)
    fetch('/api/admin/usuarios')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.users) {
          setUsers(data.users)
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleOpenCreate = () => {
    setEditingUser(null)
    setForm({
      username: '',
      email: '',
      password: '',
      role: 'STAFF',
      isActive: true,
    })
    setShowModal(true)
  }

  const handleOpenEdit = (user: any) => {
    setEditingUser(user)
    setForm({
      username: user.username || '',
      email: user.email || '',
      password: '',
      role: user.role,
      isActive: user.isActive !== false,
    })
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.username.trim() || !form.email.trim()) {
      toast.error('Nombre de usuario y correo son obligatorios')
      return
    }

    if (!editingUser && !form.password) {
      toast.error('La contraseña es obligatoria para nuevos usuarios')
      return
    }

    setIsSubmitting(true)
    try {
      const url = editingUser
        ? `/api/admin/usuarios/${editingUser.id}`
        : '/api/admin/usuarios'
      const method = editingUser ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: form.username.trim(),
          email: form.email.trim(),
          password: form.password || undefined,
          role: form.role,
          isActive: form.isActive,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Error al guardar usuario')
        return
      }

      toast.success(editingUser ? 'Usuario actualizado' : 'Trabajador registrado exitosamente')
      setShowModal(false)
      fetchUsers()
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
            <UserCheck className="w-7 h-7 text-amber-400" />
            Gestión de Personal & Operadores
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Crea operadores y administradores, asigna roles y gestiona credenciales de acceso en <span className="text-amber-400 font-semibold">Luxuri Private Travel</span>.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-amber-500/20 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4 text-slate-950" />
          Nuevo Trabajador
        </button>
      </div>

      {/* Tabla de Usuarios Black & Gold */}
      <div className="bg-[#0B0F19] rounded-2xl border border-amber-500/20 shadow-xl overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400 text-sm flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
            Cargando trabajadores...
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            No hay trabajadores registrados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm text-slate-300">
              <thead className="bg-[#121827] text-xs uppercase font-bold text-slate-400 border-b border-amber-500/10">
                <tr>
                  <th className="px-5 py-3.5">Usuario</th>
                  <th className="px-5 py-3.5">Correo</th>
                  <th className="px-5 py-3.5">Rol de Sistema</th>
                  <th className="px-5 py-3.5">Estado</th>
                  <th className="px-5 py-3.5">Último Acceso</th>
                  <th className="px-5 py-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-500/10">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-[#121827]/70 transition-colors">
                    <td className="px-5 py-4 font-bold text-white whitespace-nowrap">
                      {u.username}
                    </td>
                    <td className="px-5 py-4 text-xs font-mono text-slate-300 whitespace-nowrap">
                      {u.email}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full font-bold border ${
                          u.role === 'ADMIN'
                            ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                            : 'bg-blue-500/10 text-blue-300 border-blue-500/30'
                        }`}
                      >
                        <Shield className="w-3 h-3" />
                        {u.role === 'ADMIN' ? 'Administrador' : 'Personal Operativo'}
                      </span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full font-bold border ${
                          u.isActive
                            ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                            : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                        }`}
                      >
                        {u.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-400 whitespace-nowrap">
                      {formatDate(u.lastLoginAt)}
                    </td>
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleOpenEdit(u)}
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

      {/* Modal Crear / Editar Black & Gold */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="bg-[#0B0F19] rounded-2xl max-w-md w-full p-6 shadow-2xl border border-amber-500/30 text-white">
            <div className="flex items-center justify-between pb-4 border-b border-amber-500/10">
              <h3 className="font-black text-white text-base">
                {editingUser ? 'Editar Trabajador' : 'Nuevo Trabajador'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Nombre de Usuario *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: operador2"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-[#121827] border border-amber-500/20 rounded-xl text-white focus:outline-hidden focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Correo Electrónico *
                </label>
                <input
                  type="email"
                  required
                  placeholder="operador@luxurycarstravel.pe"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-[#121827] border border-amber-500/20 rounded-xl text-white focus:outline-hidden focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  {editingUser ? 'Nueva Contraseña (dejar vacío para mantener)' : 'Contraseña *'}
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  required={!editingUser}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-[#121827] border border-amber-500/20 rounded-xl text-white focus:outline-hidden focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Rol y Permisos *
                </label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-[#121827] border border-amber-500/20 rounded-xl text-white focus:outline-hidden focus:border-amber-400"
                >
                  <option value="STAFF">Personal Operativo (Escanear QR y registrar traslados)</option>
                  <option value="ADMIN">Administrador (Control total del sistema)</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="userActive"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="w-4 h-4 accent-amber-500 rounded"
                />
                <label htmlFor="userActive" className="text-xs text-slate-300 font-bold cursor-pointer">
                  Cuenta activa
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
                  {isSubmitting ? 'Guardando...' : editingUser ? 'Guardar Cambios' : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
