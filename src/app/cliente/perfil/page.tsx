'use client'

import { useState, useEffect } from 'react'
import {
  User,
  Phone,
  Mail,
  Calendar,
  Lock,
  Save,
  CheckCircle2,
  Sparkles,
  Shield,
  Bell,
  RefreshCw,
  Loader2,
  Award,
} from 'lucide-react'
import { toast } from 'sonner'

interface ProfileData {
  id: string
  firstName: string
  lastName: string
  phone: string
  email: string | null
  birthDate: string | null
  customerCode: string
  acceptedTerms: boolean
  acceptedDataProcessing: boolean
  acceptedPromotions: boolean
  availablePoints: number
  totalPoints: number
  createdAt: string
}

export default function MiPerfilPage() {
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Form state
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [acceptedPromotions, setAcceptedPromotions] = useState(false)

  const fetchProfile = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/cliente/perfil')
      if (!res.ok) throw new Error('Error al cargar datos del perfil')
      const json = await res.json()
      if (json.success && json.profile) {
        const p = json.profile
        setProfile(p)
        setFirstName(p.firstName || '')
        setLastName(p.lastName || '')
        setEmail(p.email || '')
        setBirthDate(p.birthDate ? p.birthDate.split('T')[0] : '')
        setAcceptedPromotions(Boolean(p.acceptedPromotions))
      }
    } catch (err) {
      console.error(err)
      toast.error('No se pudo cargar la información de tu perfil')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!firstName.trim() || !lastName.trim()) {
      toast.error('Nombre y Apellido son obligatorios')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/cliente/perfil', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          email: email.trim() || null,
          birthDate: birthDate ? new Date(birthDate).toISOString() : null,
          acceptedPromotions,
        }),
      })

      const json = await res.json()
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'No se pudo actualizar el perfil')
      }

      toast.success('¡Perfil actualizado con éxito!')
      if (json.profile) {
        setProfile((prev) => (prev ? { ...prev, ...json.profile } : null))
      }
    } catch (err: any) {
      toast.error(err.message || 'Error al guardar los cambios')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-pulse">
        <div className="h-32 bg-[#0B0F19] border border-amber-500/10 rounded-3xl" />
        <div className="h-96 bg-[#0B0F19] border border-amber-500/10 rounded-3xl" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="max-w-md mx-auto py-12 text-center bg-[#0B0F19] border border-amber-500/20 rounded-2xl p-8">
        <p className="text-slate-400 mb-4">No se pudo cargar el perfil.</p>
        <button
          onClick={fetchProfile}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-amber-500 to-amber-600 text-slate-950 font-black rounded-xl text-sm shadow-lg shadow-amber-500/20"
        >
          <RefreshCw className="w-4 h-4" /> Reintentar
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
          <User className="w-7 h-7 text-amber-400" />
          Mi Perfil
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Gestiona tu información personal y membresía VIP en <span className="text-amber-400 font-semibold">Luxuri Private Travel</span>.
        </p>
      </div>

      {/* Tarjeta de Resumen VIP del Usuario */}
      <div className="bg-[#0B0F19] rounded-3xl border border-amber-500/20 p-6 sm:p-7 shadow-xl flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
        <div className="w-20 h-20 rounded-2xl bg-linear-to-br from-amber-500 to-amber-600 text-slate-950 flex items-center justify-center text-3xl font-black shadow-lg shadow-amber-500/20 shrink-0 border border-amber-400">
          {profile.firstName.charAt(0)}
          {profile.lastName.charAt(0)}
        </div>

        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h2 className="text-xl font-black text-white">
              {profile.firstName} {profile.lastName}
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
              Cliente VIP Verificado
            </span>
          </div>

          <p className="text-xs text-slate-400">
            Miembro de Luxuri desde{' '}
            {new Date(profile.createdAt).toLocaleDateString('es-PE', {
              month: 'long',
              year: 'numeric',
            })}
          </p>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-2 text-xs">
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="font-semibold text-slate-400">Código:</span>
              <span className="font-mono font-black text-amber-400 bg-[#121827] px-2 py-0.5 rounded border border-amber-500/20">
                {profile.customerCode}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-amber-400 font-bold">
              <Sparkles className="w-3.5 h-3.5 fill-amber-400" />
              <span>{profile.availablePoints.toLocaleString()} puntos disponibles</span>
            </div>
          </div>
        </div>
      </div>

      {/* Formulario de Edición Black & Gold */}
      <form onSubmit={handleSubmit} className="bg-[#0B0F19] rounded-3xl border border-amber-500/20 p-6 sm:p-8 shadow-xl space-y-6">
        <div className="border-b border-amber-500/10 pb-3">
          <h3 className="font-black text-base text-white">
            Datos Personales
          </h3>
          <p className="text-xs text-slate-400">
            Mantén tus datos actualizados para recibir beneficios y notificaciones de traslados.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Nombres */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Nombres *</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#121827] border border-amber-500/20 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400 focus:ring-1 focus:ring-amber-400 font-medium"
                placeholder="Tus nombres"
              />
            </div>
          </div>

          {/* Apellidos */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Apellidos *</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#121827] border border-amber-500/20 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400 focus:ring-1 focus:ring-amber-400 font-medium"
                placeholder="Tus apellidos"
              />
            </div>
          </div>

          {/* Celular (Solo lectura) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300">Número de Celular</label>
              <span className="text-[10px] text-amber-400/80 flex items-center gap-1">
                <Lock className="w-3 h-3" /> Solo lectura
              </span>
            </div>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                readOnly
                value={profile.phone}
                className="w-full pl-10 pr-4 py-2.5 bg-[#070A11] border border-amber-500/10 rounded-xl text-xs sm:text-sm text-slate-400 font-mono cursor-not-allowed"
                title="Para cambiar de celular comunícate con la administración de Luxuri"
              />
            </div>
          </div>

          {/* Código de Cliente (Solo lectura) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300">Código de Cliente</label>
              <span className="text-[10px] text-amber-400/80 flex items-center gap-1">
                <Lock className="w-3 h-3" /> Fijo
              </span>
            </div>
            <div className="relative">
              <Shield className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                readOnly
                value={profile.customerCode}
                className="w-full pl-10 pr-4 py-2.5 bg-[#070A11] border border-amber-500/10 rounded-xl text-xs sm:text-sm text-amber-400 font-mono font-bold cursor-not-allowed"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Correo Electrónico</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#121827] border border-amber-500/20 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400 focus:ring-1 focus:ring-amber-400 font-medium"
                placeholder="ejemplo@correo.com"
              />
            </div>
          </div>

          {/* Fecha de Nacimiento */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Fecha de Nacimiento</label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#121827] border border-amber-500/20 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400 focus:ring-1 focus:ring-amber-400 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Preferencias y Notificaciones */}
        <div className="pt-4 border-t border-amber-500/10 space-y-4">
          <div className="flex items-start justify-between gap-4 p-4 rounded-2xl bg-[#121827] border border-amber-500/20">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-white">
                  Promociones y Puntos VIP
                </p>
                <p className="text-xs text-slate-400">
                  Deseo recibir novedades sobre rutas exclusivas, bonificaciones de puntos y descuentos en traslados.
                </p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
              <input
                type="checkbox"
                checked={acceptedPromotions}
                onChange={(e) => setAcceptedPromotions(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-slate-900 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>
        </div>

        {/* Botón Guardar */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto px-7 py-3 rounded-xl bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 text-slate-950" />
                <span>Guardar Cambios</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
