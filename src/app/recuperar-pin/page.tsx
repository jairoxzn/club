'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Crown, ArrowLeft, ChevronLeft, ShieldCheck } from 'lucide-react'

export default function RecuperarPinPage() {
  const [phone, setPhone] = useState('')
  const [step, setStep] = useState<'request' | 'sent'>('request')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStep('sent')
  }

  if (step === 'sent') {
    return (
      <div className="min-h-screen bg-[#070A11] text-slate-100 flex items-center justify-center px-4 relative overflow-hidden">
        <div className="w-full max-w-md bg-[#0B0F19]/90 border border-amber-500/30 rounded-3xl p-8 text-center shadow-2xl backdrop-blur-md">
          <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-white mb-2">Solicitud Recibida</h2>
          <p className="text-xs text-slate-300 mb-6 leading-relaxed">
            Hemos registrado tu solicitud de recuperación de PIN para el número{' '}
            <strong className="text-amber-400">+51 {phone}</strong>. Nuestro equipo de soporte de Luxuri Private Travel validará tu identidad para ayudarte a restablecer tu acceso.
          </p>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-xs text-slate-400 mb-6">
            <p>También puedes comunicarte directamente al:</p>
            <p className="text-base font-black text-amber-400 font-mono mt-1">92 28 95 355</p>
          </div>
          <Link
            href="/ingresar"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 text-slate-950 px-6 py-2.5 rounded-xl font-black text-xs transition-colors shadow-lg shadow-amber-500/20"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#070A11] text-slate-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      <div className="w-full max-w-md relative z-10">
        <Link
          href="/ingresar"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-amber-400 mb-6 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Volver a iniciar sesión
        </Link>

        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-700 p-0.5 shadow-xl shadow-amber-500/15 mb-3">
            <div className="w-full h-full bg-[#0B0F19] rounded-[14px] flex items-center justify-center">
              <Crown className="w-7 h-7 text-amber-400" />
            </div>
          </div>
          <h1 className="text-2xl font-black text-white">Recuperar PIN</h1>
          <p className="text-xs text-amber-300/80 font-medium mt-1">
            Ingresa tu celular registrado para asistirte
          </p>
        </div>

        <div className="bg-[#0B0F19]/90 border border-amber-500/30 rounded-3xl p-7 sm:p-8 shadow-2xl backdrop-blur-md">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Número de Celular Registrado
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3.5 py-2.5 border border-r-0 border-slate-700 bg-slate-900 text-amber-400 font-mono text-xs rounded-l-xl">
                  +51
                </span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="987654321"
                  maxLength={9}
                  required
                  className="flex-1 px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-r-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-mono"
                />
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-300">
              <p className="font-bold text-amber-400 mb-1">¿Cómo se restablece?</p>
              <p>
                Un asesor oficial de Luxuri Private Travel confirmará tu identidad para enviarte un PIN temporal de seguridad.
              </p>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black py-3.5 rounded-xl transition-all shadow-lg shadow-amber-500/20 text-sm"
            >
              Solicitar Asistencia
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
