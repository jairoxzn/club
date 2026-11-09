'use client'

import React, { useState, useEffect } from 'react'
import {
  Settings,
  Save,
  Building2,
  Mail,
  Phone,
  MapPin,
  Palette,
  Shield,
  Clock,
  RefreshCw,
  CheckCircle2,
  Crown,
} from 'lucide-react'
import { toast } from 'sonner'

export default function AdminConfiguracionPage() {
  const [configs, setConfigs] = useState<Record<string, string>>({
    company_name: 'LUXURI PRIVATE TRAVEL',
    loyalty_program_name: 'Club VIP Luxuri',
    company_ruc: '20601234567',
    company_address: 'Aeropuerto Internacional Alfredo Rodríguez Ballón, Arequipa, Perú',
    company_phone: '+51 922 895 355',
    company_email: 'luxurycarstravel@gmail.com',
    points_expiry_enabled: 'false',
    points_expiry_days: '365',
    max_failed_logins: '5',
    lockout_duration_minutes: '15',
    primary_color: '#D4AF37',
    secondary_color: '#F59E0B',
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetch('/api/admin/configuracion')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.configs) {
          const map: Record<string, string> = {}
          data.configs.forEach((c: any) => {
            map[c.key] = c.value
          })
          setConfigs((prev) => ({ ...prev, ...map }))
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const res = await fetch('/api/admin/configuracion', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(configs),
      })

      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Error al guardar configuración')
        return
      }

      toast.success('Configuración del sistema guardada exitosamente')
    } catch {
      toast.error('Error de conexión')
    } finally {
      setIsSaving(false)
    }
  }

  const handleChange = (key: string, value: string) => {
    setConfigs((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
          <Settings className="w-7 h-7 text-amber-400" />
          Configuración del Sistema
        </h1>
        <p className="text-sm text-slate-400 mt-0.5">
          Parámetros globales de la empresa, identidad visual Black & Gold y reglas de seguridad en <span className="text-amber-400 font-semibold">Luxuri Private Travel</span>.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Bloque 1: Datos de la Empresa y Programa Black & Gold */}
        <div className="bg-[#0B0F19] rounded-2xl p-6 border border-amber-500/20 shadow-xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-amber-500/10">
            <Building2 className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-white text-base">Identidad del Negocio</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Nombre de la Empresa
              </label>
              <input
                type="text"
                value={configs.company_name || ''}
                onChange={(e) => handleChange('company_name', e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-[#121827] border border-amber-500/20 rounded-xl text-white focus:outline-hidden focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Nombre del Programa de Fidelización
              </label>
              <input
                type="text"
                value={configs.loyalty_program_name || ''}
                onChange={(e) => handleChange('loyalty_program_name', e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-[#121827] border border-amber-500/20 rounded-xl text-white focus:outline-hidden focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                RUC / Identificación Fiscal
              </label>
              <input
                type="text"
                value={configs.company_ruc || ''}
                onChange={(e) => handleChange('company_ruc', e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-[#121827] border border-amber-500/20 rounded-xl text-white focus:outline-hidden focus:border-amber-400 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Dirección Central
              </label>
              <input
                type="text"
                value={configs.company_address || ''}
                onChange={(e) => handleChange('company_address', e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-[#121827] border border-amber-500/20 rounded-xl text-white focus:outline-hidden focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Teléfono de Contacto / WhatsApp
              </label>
              <input
                type="text"
                value={configs.company_phone || ''}
                onChange={(e) => handleChange('company_phone', e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-[#121827] border border-amber-500/20 rounded-xl text-white focus:outline-hidden focus:border-amber-400 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Correo Electrónico de Contacto
              </label>
              <input
                type="email"
                value={configs.company_email || ''}
                onChange={(e) => handleChange('company_email', e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-[#121827] border border-amber-500/20 rounded-xl text-white focus:outline-hidden focus:border-amber-400"
              />
            </div>
          </div>
        </div>

        {/* Bloque 2: Branding y Colores Black & Gold */}
        <div className="bg-[#0B0F19] rounded-2xl p-6 border border-amber-500/20 shadow-xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-amber-500/10">
            <Palette className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-white text-base">Identidad Visual & Paleta Black & Gold</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Color Primario (Dorado Luxuri)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={configs.primary_color || '#D4AF37'}
                  onChange={(e) => handleChange('primary_color', e.target.value)}
                  className="w-10 h-10 rounded-xl cursor-pointer border border-amber-500/20 bg-transparent"
                />
                <input
                  type="text"
                  value={configs.primary_color || '#D4AF37'}
                  onChange={(e) => handleChange('primary_color', e.target.value)}
                  className="flex-1 px-3 py-2 text-xs font-mono bg-[#121827] border border-amber-500/20 rounded-xl text-white uppercase"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Color Secundario / Acento
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={configs.secondary_color || '#F59E0B'}
                  onChange={(e) => handleChange('secondary_color', e.target.value)}
                  className="w-10 h-10 rounded-xl cursor-pointer border border-amber-500/20 bg-transparent"
                />
                <input
                  type="text"
                  value={configs.secondary_color || '#F59E0B'}
                  onChange={(e) => handleChange('secondary_color', e.target.value)}
                  className="flex-1 px-3 py-2 text-xs font-mono bg-[#121827] border border-amber-500/20 rounded-xl text-white uppercase"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bloque 3: Seguridad y Vencimiento de Puntos Black & Gold */}
        <div className="bg-[#0B0F19] rounded-2xl p-6 border border-amber-500/20 shadow-xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-amber-500/10">
            <Shield className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-white text-base">Seguridad y Políticas de Puntos</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Intentos Máximos de Acceso Fallido
              </label>
              <input
                type="number"
                min="3"
                max="10"
                value={configs.max_failed_logins || '5'}
                onChange={(e) => handleChange('max_failed_logins', e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-[#121827] border border-amber-500/20 rounded-xl text-white focus:outline-hidden focus:border-amber-400"
              />
              <p className="text-[11px] text-slate-400 mt-0.5">Bloqueo automático de cuenta al superar este número.</p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Duración de Bloqueo Temporal (Minutos)
              </label>
              <input
                type="number"
                min="5"
                max="120"
                value={configs.lockout_duration_minutes || '15'}
                onChange={(e) => handleChange('lockout_duration_minutes', e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-[#121827] border border-amber-500/20 rounded-xl text-white focus:outline-hidden focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Política de Vencimiento de Puntos
              </label>
              <select
                value={configs.points_expiry_enabled || 'false'}
                onChange={(e) => handleChange('points_expiry_enabled', e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-[#121827] border border-amber-500/20 rounded-xl text-white focus:outline-hidden focus:border-amber-400"
              >
                <option value="false">Deshabilitado (Puntos nunca vencen)</option>
                <option value="true">Habilitado (Vencimiento programado)</option>
              </select>
            </div>

            {configs.points_expiry_enabled === 'true' && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Días de Vigencia de Puntos
                </label>
                <input
                  type="number"
                  min="30"
                  value={configs.points_expiry_days || '365'}
                  onChange={(e) => handleChange('points_expiry_days', e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-[#121827] border border-amber-500/20 rounded-xl text-white focus:outline-hidden focus:border-amber-400"
                />
              </div>
            )}
          </div>
        </div>

        {/* Botón Guardar */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 text-slate-950 font-black px-7 py-3 rounded-xl shadow-lg shadow-amber-500/20 transition-all text-xs sm:text-sm active:scale-95"
          >
            <Save className="w-4 h-4 text-slate-950" />
            {isSaving ? 'Guardando cambios...' : 'Guardar Configuración'}
          </button>
        </div>
      </form>
    </div>
  )
}
