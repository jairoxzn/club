'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Crown, Eye, EyeOff, Loader2, ChevronLeft, Sparkles } from 'lucide-react'
import { toast } from 'sonner'

const registroSchema = z
  .object({
    firstName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(50),
    lastName: z.string().min(2, 'El apellido debe tener al menos 2 caracteres').max(50),
    phone: z
      .string()
      .regex(/^9\d{8}$/, 'Ingresa un número de celular válido (9 dígitos, comenzando con 9)'),
    pin: z
      .string()
      .min(4, 'El PIN debe tener al menos 4 dígitos')
      .max(8, 'El PIN no puede tener más de 8 dígitos')
      .regex(/^\d+$/, 'El PIN solo puede contener números'),
    confirmPin: z.string(),
    birthDate: z.string().optional(),
    email: z.string().email('Correo electrónico inválido').optional().or(z.literal('')),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: 'Debes aceptar los términos y condiciones',
    }),
    acceptDataProcessing: z.boolean().refine((val) => val === true, {
      message: 'Debes autorizar el tratamiento de datos personales',
    }),
    acceptPromotions: z.boolean().optional(),
  })
  .refine((data) => data.pin === data.confirmPin, {
    message: 'Los PIN no coinciden',
    path: ['confirmPin'],
  })

type RegistroForm = z.infer<typeof registroSchema>

export default function RegistroPage() {
  const router = useRouter()
  const [showPin, setShowPin] = useState(false)
  const [showConfirmPin, setShowConfirmPin] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegistroForm>({
    resolver: zodResolver(registroSchema),
    defaultValues: {
      acceptTerms: false,
      acceptDataProcessing: false,
      acceptPromotions: false,
    },
  })

  const pin = watch('pin', '')

  const getPinStrength = (pin: string) => {
    if (!pin) return null
    if (pin.length < 4) return { label: 'Muy corto', color: 'bg-red-400', width: '25%' }
    if (pin.length === 4) return { label: 'Básico', color: 'bg-amber-500', width: '50%' }
    if (pin.length <= 6) return { label: 'Bueno', color: 'bg-yellow-400', width: '75%' }
    return { label: 'Excelente', color: 'bg-emerald-400', width: '100%' }
  }

  const pinStrength = getPinStrength(pin)

  const onSubmit = async (data: RegistroForm) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          pin: data.pin,
          birthDate: data.birthDate || undefined,
          email: data.email || undefined,
          acceptTerms: data.acceptTerms,
          acceptDataProcessing: data.acceptDataProcessing,
          acceptPromotions: data.acceptPromotions ?? false,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        toast.error(result.error ?? 'Error al crear la cuenta')
        return
      }

      toast.success('¡Bienvenido a Luxuri Rewards! Cuenta creada con éxito.')
      setTimeout(() => router.push('/cliente'), 1200)
    } catch {
      toast.error('Error de conexión. Intenta nuevamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#070A11] text-slate-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Glows de fondo */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-amber-500/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="w-full max-w-lg relative z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-amber-400 mb-6 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Volver a la página principal
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block group mb-3">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-700 p-0.5 shadow-xl shadow-amber-500/15 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#0B0F19] rounded-[14px] flex items-center justify-center">
                <Crown className="w-7 h-7 text-amber-400" />
              </div>
            </div>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Únete al Club Luxuri
          </h1>
          <p className="text-xs text-amber-300/80 font-medium mt-1">
            Obtén tu código QR personal y acumula puntos en cada traslado
          </p>
        </div>

        {/* Formulario */}
        <div className="bg-[#0B0F19]/90 border border-amber-500/30 rounded-3xl p-7 sm:p-8 shadow-2xl backdrop-blur-md">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Nombres y Apellidos */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Nombres *
                </label>
                <input
                  {...register('firstName')}
                  type="text"
                  placeholder="Juan"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
                {errors.firstName && (
                  <p className="text-red-400 text-[11px] mt-1">{errors.firstName.message}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Apellidos *
                </label>
                <input
                  {...register('lastName')}
                  type="text"
                  placeholder="Pérez"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
                {errors.lastName && (
                  <p className="text-red-400 text-[11px] mt-1">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            {/* Celular */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Número de Celular *
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3.5 py-2.5 border border-r-0 border-slate-700 bg-slate-900 text-amber-400 font-mono text-xs rounded-l-xl">
                  +51
                </span>
                <input
                  {...register('phone')}
                  type="tel"
                  placeholder="987654321"
                  maxLength={9}
                  className="flex-1 px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-r-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-mono"
                />
              </div>
              {errors.phone && (
                <p className="text-red-400 text-[11px] mt-1">{errors.phone.message}</p>
              )}
            </div>

            {/* PIN de Acceso */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                PIN de Acceso * (4 a 8 dígitos)
              </label>
              <div className="relative">
                <input
                  {...register('pin')}
                  type={showPin ? 'text' : 'password'}
                  placeholder="Mínimo 4 números"
                  maxLength={8}
                  inputMode="numeric"
                  className="w-full px-4 py-2.5 pr-10 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-mono tracking-widest"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-400"
                >
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {pin && pinStrength && (
                <div className="mt-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                    <span>Seguridad:</span>
                    <span className="text-amber-400 font-bold">{pinStrength.label}</span>
                  </div>
                  <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${pinStrength.color} transition-all duration-300`}
                      style={{ width: pinStrength.width }}
                    />
                  </div>
                </div>
              )}
              {errors.pin && (
                <p className="text-red-400 text-[11px] mt-1">{errors.pin.message}</p>
              )}
            </div>

            {/* Confirmar PIN */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Confirmar PIN *
              </label>
              <div className="relative">
                <input
                  {...register('confirmPin')}
                  type={showConfirmPin ? 'text' : 'password'}
                  placeholder="Repite tu PIN"
                  maxLength={8}
                  inputMode="numeric"
                  className="w-full px-4 py-2.5 pr-10 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-mono tracking-widest"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPin(!showConfirmPin)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-400"
                >
                  {showConfirmPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPin && (
                <p className="text-red-400 text-[11px] mt-1">{errors.confirmPin.message}</p>
              )}
            </div>

            {/* Opcionales */}
            <div className="pt-2 border-t border-slate-800/80">
              <span className="text-[11px] font-bold text-amber-400/80 uppercase tracking-wider block mb-2">
                Información Opcional
              </span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">
                    Fecha de Cumpleaños
                  </label>
                  <input
                    {...register('birthDate')}
                    type="date"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">
                    Correo Electrónico
                  </label>
                  <input
                    {...register('email')}
                    type="email"
                    placeholder="correo@ejemplo.com"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* Consentimientos Legales */}
            <div className="space-y-2.5 pt-2 border-t border-slate-800/80 text-xs text-slate-400">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  {...register('acceptTerms')}
                  type="checkbox"
                  className="mt-0.5 w-4 h-4 text-amber-500 rounded border-slate-700 bg-slate-900 focus:ring-amber-500"
                />
                <span>
                  Acepto los{' '}
                  <Link href="/terminos" target="_blank" className="text-amber-400 underline">
                    Términos y Condiciones
                  </Link>{' '}
                  del Club Luxuri. *
                </span>
              </label>
              {errors.acceptTerms && (
                <p className="text-red-400 text-[11px]">{errors.acceptTerms.message}</p>
              )}

              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  {...register('acceptDataProcessing')}
                  type="checkbox"
                  className="mt-0.5 w-4 h-4 text-amber-500 rounded border-slate-700 bg-slate-900 focus:ring-amber-500"
                />
                <span>
                  Autorizo el tratamiento de mis datos personales conforme a la{' '}
                  <Link href="/privacidad" target="_blank" className="text-amber-400 underline">
                    Política de Privacidad (Ley 29733)
                  </Link>. *
                </span>
              </label>
              {errors.acceptDataProcessing && (
                <p className="text-red-400 text-[11px]">{errors.acceptDataProcessing.message}</p>
              )}

              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  {...register('acceptPromotions')}
                  type="checkbox"
                  className="mt-0.5 w-4 h-4 text-amber-500 rounded border-slate-700 bg-slate-900 focus:ring-amber-500"
                />
                <span>Deseo recibir promociones y beneficios exclusivos por WhatsApp. (Opcional)</span>
              </label>
            </div>

            {/* Botón Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 text-slate-950 font-black py-3.5 rounded-xl transition-all shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 flex items-center justify-center gap-2 text-sm mt-3"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creando cuenta VIP...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Crear mi cuenta y recibir puntos
                </>
              )}
            </button>

            <p className="text-center text-xs text-slate-400 pt-2">
              ¿Ya eres socio?{' '}
              <Link href="/ingresar" className="text-amber-400 hover:text-amber-300 font-bold hover:underline">
                Inicia sesión aquí
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
