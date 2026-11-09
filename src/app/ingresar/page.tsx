'use client'

import { useState, Suspense } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Crown,
  Eye,
  EyeOff,
  Loader2,
  Sparkles,
  ChevronLeft,
  UserCheck,
  Shield,
  Smartphone,
  Lock,
  Zap,
} from 'lucide-react'
import { toast } from 'sonner'

const loginSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(3, 'Ingresa tu celular, usuario o correo'),
  password: z
    .string()
    .min(1, 'Ingresa tu PIN o contraseña'),
})

type LoginForm = z.infer<typeof loginSchema>

function LoginFormContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnUrl = searchParams.get('returnUrl')

  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: '',
      password: '',
    },
  })

  // Función para rellenar credenciales demo con 1 clic
  const fillDemo = (identifier: string, pass: string) => {
    setValue('identifier', identifier, { shouldValidate: true })
    setValue('password', pass, { shouldValidate: true })
    toast.info(`Credenciales de prueba cargadas (${identifier})`)
  }

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const result = await response.json()

      if (!response.ok) {
        toast.error(result.error ?? 'Credenciales incorrectas. Verifica tus datos.')
        return
      }

      const roleGreeting =
        result.role === 'ADMIN'
          ? 'Administrador'
          : result.role === 'STAFF'
          ? 'Personal Operativo'
          : 'Cliente VIP'

      toast.success(`¡Bienvenido al Sistema Luxuri (${roleGreeting})!`)

      const destination = returnUrl || result.redirectTo || '/cliente'
      router.push(destination)
    } catch {
      toast.error('Error de conexión con el servidor')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md relative z-10">
      {/* Botón Volver */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-amber-400 mb-6 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Volver a la página principal
      </Link>

      {/* Header Logo */}
      <div className="text-center mb-8">
        <Link href="/" className="inline-block group mb-3">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-700 p-0.5 shadow-xl shadow-amber-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-[#0B0F19] rounded-[14px] flex items-center justify-center">
              <Crown className="w-8 h-8 text-amber-400" />
            </div>
          </div>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
          LUXURI PRIVATE TRAVEL
        </h1>
        <p className="text-xs sm:text-sm text-amber-400 font-semibold tracking-wide uppercase mt-1">
          Portal Unificado de Acceso
        </p>
        <p className="text-xs text-slate-400 mt-1">
          Ingresa como Cliente VIP, Personal u Operador desde un solo lugar
        </p>
      </div>

      {/* Tarjeta del Formulario */}
      <div className="bg-[#0B0F19]/95 border border-amber-500/30 rounded-3xl p-7 sm:p-8 shadow-2xl backdrop-blur-md">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Campo Identificador */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Celular, Correo o Usuario
            </label>
            <div className="relative">
              <input
                {...register('identifier')}
                type="text"
                autoComplete="username"
                placeholder="Ej: 987654321, admin o correo@luxuri.pe"
                className="w-full px-4 py-3 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all font-sans"
              />
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                <UserCheck className="w-4 h-4 text-amber-400/70" />
              </div>
            </div>
            {errors.identifier ? (
              <p className="text-red-400 text-xs mt-1.5">{errors.identifier.message}</p>
            ) : (
              <p className="text-[11px] text-slate-400 mt-1">
                Clientes: tu número de celular. Personal: tu correo o usuario.
              </p>
            )}
          </div>

          {/* Campo Clave / PIN */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                PIN o Contraseña
              </label>
              <Link
                href="/recuperar-pin"
                className="text-xs text-amber-400 hover:text-amber-300 hover:underline font-medium"
              >
                ¿Olvidaste tu PIN?
              </Link>
            </div>
            <div className="relative">
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Ingresa tu PIN o contraseña"
                className="w-full px-4 py-3 pr-10 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 tracking-normal transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-400 transition-colors"
                aria-label={showPassword ? 'Ocultar clave' : 'Mostrar clave'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-400 text-xs mt-1.5">{errors.password.message}</p>
            )}
          </div>

          {/* Botón Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 text-slate-950 font-black py-3.5 rounded-xl transition-all shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 flex items-center justify-center gap-2 text-sm mt-2 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Validando acceso...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Ingresar al Sistema
              </>
            )}
          </button>

          {/* Enlaces y Registro */}
          <div className="text-center space-y-3 pt-3 border-t border-slate-800/80">
            <p className="text-xs text-slate-400">
              ¿Eres un nuevo pasajero?{' '}
              <Link
                href="/registro"
                className="text-amber-400 hover:text-amber-300 font-bold hover:underline"
              >
                Regístrate gratis en el Club VIP
              </Link>
            </p>
          </div>
        </form>

        {/* Botones de Acceso Rápido Demo (1 Clic) */}
        <div className="mt-6 pt-5 border-t border-slate-800/80">
          <p className="text-[11px] font-bold text-amber-400/90 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            Acceso Rápido de Prueba (1 Clic)
          </p>
          <div className="grid grid-cols-3 gap-2 text-[11px]">
            <button
              type="button"
              onClick={() => fillDemo('999000001', '1234')}
              className="bg-slate-900 hover:bg-slate-800 border border-slate-700/80 hover:border-amber-500/50 rounded-xl p-2 text-center text-slate-200 transition-colors"
            >
              <p className="font-bold text-amber-300">Cliente VIP</p>
              <p className="text-[10px] text-slate-400 font-mono">999000001</p>
            </button>
            <button
              type="button"
              onClick={() => fillDemo('admin', 'Admin@2024!')}
              className="bg-slate-900 hover:bg-slate-800 border border-slate-700/80 hover:border-amber-500/50 rounded-xl p-2 text-center text-slate-200 transition-colors"
            >
              <p className="font-bold text-amber-300">Admin</p>
              <p className="text-[10px] text-slate-400 font-mono">admin</p>
            </button>
            <button
              type="button"
              onClick={() => fillDemo('operador', 'Staff@2024!')}
              className="bg-slate-900 hover:bg-slate-800 border border-slate-700/80 hover:border-amber-500/50 rounded-xl p-2 text-center text-slate-200 transition-colors"
            >
              <p className="font-bold text-amber-300">Operador</p>
              <p className="text-[10px] text-slate-400 font-mono">operador</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function IngresarPage() {
  return (
    <div className="min-h-screen bg-[#070A11] text-slate-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Glows dorados de fondo */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[300px] h-[300px] bg-amber-600/5 rounded-full blur-[100px] pointer-events-none" />

      <Suspense
        fallback={
          <div className="text-amber-400 flex items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Cargando portal...</span>
          </div>
        }
      >
        <LoginFormContent />
      </Suspense>
    </div>
  )
}
