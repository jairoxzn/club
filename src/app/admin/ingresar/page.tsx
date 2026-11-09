'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Crown, Loader2 } from 'lucide-react'

export default function AdminIngresarRedirect() {
  const router = useRouter()

  useEffect(() => {
    // Redirigir al portal unificado de inicio de sesión
    router.replace('/ingresar')
  }, [router])

  return (
    <div className="min-h-screen bg-[#070A11] text-slate-100 flex flex-col justify-center items-center px-4">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-700 p-0.5 shadow-xl shadow-amber-500/20 mb-4 animate-pulse">
          <div className="w-full h-full bg-[#0B0F19] rounded-[14px] flex items-center justify-center">
            <Crown className="w-8 h-8 text-amber-400" />
          </div>
        </div>
        <h1 className="text-xl font-bold text-white mb-2">Redirigiendo al Portal Unificado...</h1>
        <p className="text-xs text-amber-400 flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          Ingreso centralizado en /ingresar
        </p>
      </div>
    </div>
  )
}
