'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Crown, ArrowLeft, ChevronLeft, ShieldCheck, MessageCircle, Phone, Lock, Sparkles } from 'lucide-react'

export default function RecuperarPinPage() {
  const [phone, setPhone] = useState('')
  const [step, setStep] = useState<'request' | 'sent'>('request')

  const whatsappMessage = encodeURIComponent(
    `Hola Luxuri Private Travel, olvidé mi PIN de acceso al Club VIP. Mi celular registrado es: +51 ${phone.trim() || '...'}. Solicito amablemente que el Administrador restablezca mi PIN de acceso.`
  )
  const whatsappUrl = `https://wa.me/51922895355?text=${whatsappMessage}`

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setStep('sent')
  }

  if (step === 'sent') {
    return (
      <div className="min-h-screen bg-[#070A11] text-slate-100 flex items-center justify-center px-4 relative overflow-hidden">
        {/* Glow de fondo */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="w-full max-w-md bg-[#0B0F19]/90 border border-amber-500/30 rounded-3xl p-8 text-center shadow-2xl backdrop-blur-md relative z-10">
          <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/10">
            <ShieldCheck className="w-8 h-8 text-amber-400" />
          </div>
          <h2 className="text-xl font-black text-white mb-2">Solicitud de Restablecimiento</h2>
          <p className="text-xs text-slate-300 mb-6 leading-relaxed">
            Hemos registrado tu solicitud para el celular{' '}
            <strong className="text-amber-400 font-mono text-sm">+51 {phone}</strong>. Para completar el reseteo por seguridad, comunícate directamente con soporte para que el administrador verifique tu identidad y actualice tu PIN.
          </p>

          <div className="space-y-3 mb-6">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-xl text-xs transition-colors shadow-lg shadow-emerald-600/20"
            >
              <MessageCircle className="w-4 h-4" />
              Contactar al Administrador por WhatsApp
            </a>

            <a
              href="tel:+51922895355"
              className="w-full inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold py-2.5 px-4 rounded-xl text-xs transition-colors border border-slate-700"
            >
              <Phone className="w-4 h-4" />
              Llamar a Soporte: 92 28 95 355
            </a>
          </div>

          <Link
            href="/ingresar"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white font-medium text-xs transition-colors"
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
      {/* Glow de fondo */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />

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
          <h1 className="text-2xl font-black text-white">¿Olvidaste tu PIN?</h1>
          <p className="text-xs text-amber-300/80 font-medium mt-1">
            Soporte oficial y reseteo por el Administrador
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

            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-300 space-y-1.5">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                <Lock className="w-3.5 h-3.5" />
                <span>Protocolo de Seguridad VIP</span>
              </div>
              <p className="leading-relaxed text-[11px] text-slate-400">
                Para proteger tus puntos acumulados, la recuperación de acceso es validada directamente por el <strong>Administrador Oficial</strong> de Luxuri Private Travel.
              </p>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black py-3.5 rounded-xl transition-all shadow-lg shadow-amber-500/20 text-sm flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Solicitar Reseteo de PIN
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-[#0B0F19] px-3 text-slate-500 text-[11px]">O comunícate directamente</span>
            </div>
          </div>

          <div className="space-y-2.5">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-xl text-xs transition-colors shadow-lg shadow-emerald-600/20"
            >
              <MessageCircle className="w-4 h-4" />
              Enviar mensaje a Soporte por WhatsApp
            </a>

            <a
              href="tel:+51922895355"
              className="w-full inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-amber-400 font-semibold py-2.5 px-4 rounded-xl text-xs transition-colors border border-slate-800"
            >
              <Phone className="w-3.5 h-3.5" />
              Central Telefónica: 92 28 95 355
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
