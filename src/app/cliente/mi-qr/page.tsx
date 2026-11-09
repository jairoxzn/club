'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import {
  QrCode,
  Download,
  Maximize2,
  Minimize2,
  Copy,
  Check,
  ShieldCheck,
  Info,
  RefreshCw,
  Sparkles,
  Crown,
} from 'lucide-react'
import { toast } from 'sonner'

interface QRResponse {
  customerCode: string
  qrToken: string
  qrDataUrl: string
  fullName: string
}

export default function MiQRPage() {
  const [data, setData] = useState<QRResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [copied, setCopied] = useState(false)

  const fetchQR = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/cliente/qr')
      if (!res.ok) throw new Error('Error al cargar QR')
      const json = await res.json()
      if (json.success) {
        setData(json)
      }
    } catch (err) {
      console.error(err)
      toast.error('No se pudo generar tu código QR')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQR()
  }, [])

  const copyCode = () => {
    if (data?.customerCode) {
      navigator.clipboard.writeText(data.customerCode)
      setCopied(true)
      toast.success('Código de socio copiado')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const downloadQR = () => {
    if (!data?.qrDataUrl) return
    const a = document.createElement('a')
    a.href = data.qrDataUrl
    a.download = `QR_Luxuri_${data.customerCode}.png`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    toast.success('Código QR descargado exitosamente')
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <RefreshCw className="w-8 h-8 text-amber-500 animate-spin" />
        <p className="text-sm font-semibold text-slate-400">Generando tu credencial digital...</p>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Encabezado */}
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold mb-1">
          <Crown className="w-3.5 h-3.5 text-amber-400" />
          <span>CREDENCIAL DIGITAL VIP</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Mi Código QR Personal
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
          Presenta este código al chofer antes de abordar tu servicio para acumular tus puntos automáticamente.
        </p>
      </div>

      {/* Tarjeta Credencial QR de Lujo */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-b from-[#0F172A] via-[#0B0F19] to-[#070A11] border-2 border-amber-500/40 p-6 sm:p-8 shadow-2xl shadow-amber-500/10 text-center">
        {/* Glow dorado decorativo */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Nombre del Socio & Marca */}
        <div className="relative z-10 mb-6">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <Crown className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-black tracking-widest text-amber-400 uppercase">
              LUXURI PRIVATE TRAVEL
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">{data.fullName}</h2>
          <p className="text-[11px] text-amber-300/80 uppercase tracking-widest font-semibold mt-0.5">
            Socio Exclusivo Club Rewards
          </p>
        </div>

        {/* Marco del Código QR */}
        <div className="relative z-10 inline-block p-4 sm:p-5 rounded-3xl bg-white shadow-2xl border-4 border-amber-400/80 my-2">
          {data.qrDataUrl ? (
            <img
              src={data.qrDataUrl}
              alt="Código QR del Socio"
              className="w-56 h-56 sm:w-64 sm:h-64 object-contain mx-auto"
            />
          ) : (
            <div className="w-56 h-56 flex items-center justify-center text-xs text-slate-400">
              Generando QR...
            </div>
          )}
        </div>

        {/* Código Alfanumérico */}
        <div className="relative z-10 mt-6 space-y-2">
          <span className="text-xs text-slate-400 uppercase font-bold tracking-wider block">
            Código de Socio
          </span>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-amber-500/30">
            <span className="font-mono text-lg font-black text-amber-400 tracking-wider">
              {data.customerCode}
            </span>
            <button
              onClick={copyCode}
              className="p-1 hover:text-white text-slate-400 transition-colors"
              title="Copiar código"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="relative z-10 mt-8 pt-6 border-t border-slate-800/80 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => setIsFullscreen(true)}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black px-5 py-3 rounded-xl text-xs shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
          >
            <Maximize2 className="w-4 h-4" />
            <span>Pantalla Completa</span>
          </button>

          <button
            onClick={downloadQR}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 bg-slate-900 border border-slate-700 hover:border-amber-500/40 text-slate-200 hover:text-white font-bold px-5 py-3 rounded-xl text-xs transition-colors"
          >
            <Download className="w-4 h-4 text-amber-400" />
            <span>Descargar PNG</span>
          </button>
        </div>
      </div>

      {/* Nota informativa de seguridad */}
      <div className="bg-[#0B0F19] border border-slate-800 rounded-2xl p-4 flex items-start gap-3 text-xs text-slate-400">
        <ShieldCheck className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <div>
          <strong className="text-slate-200 block mb-0.5">Identificador Cifrado & Seguro</strong>
          Tu código QR contiene un token encriptado que no expone tus datos privados. Es exclusivo para la acreditación automática de puntos por el personal autorizado de Luxuri.
        </div>
      </div>

      {/* Modal Pantalla Completa para Escaneo Rápido */}
      {isFullscreen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setIsFullscreen(false)}
        >
          <div
            className="w-full max-w-sm bg-white rounded-3xl p-8 text-center shadow-2xl relative border-4 border-amber-400"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsFullscreen(false)}
              className="absolute top-4 right-4 p-2 text-slate-500 hover:text-slate-900 rounded-full hover:bg-slate-100"
            >
              <Minimize2 className="w-5 h-5" />
            </button>

            <div className="flex items-center justify-center gap-1 text-slate-900 font-black text-sm mb-1 uppercase tracking-wider">
              <Crown className="w-4 h-4 text-amber-500" />
              LUXURI PRIVATE TRAVEL
            </div>
            <p className="text-xs text-slate-500 mb-4">{data.fullName}</p>

            <img
              src={data.qrDataUrl}
              alt="QR Grande"
              className="w-full aspect-square object-contain mx-auto rounded-xl"
            />

            <div className="mt-4 pt-3 border-t border-slate-200">
              <span className="font-mono text-xl font-black text-slate-900 tracking-widest block">
                {data.customerCode}
              </span>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">
                Toca fuera para cerrar
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
