'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Bus,
  QrCode,
  ClipboardList,
  LogOut,
  User,
  Menu,
  X,
  ShieldCheck,
  CheckCircle,
  Crown,
} from 'lucide-react'
import { toast } from 'sonner'

export default function PersonalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.user) {
          setCurrentUser(data.user)
        }
      })
      .catch((err) => console.error('Error al cargar sesión:', err))
  }, [])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      toast.success('Sesión finalizada')
      router.push('/admin/ingresar')
    } catch {
      toast.error('Error al cerrar sesión')
    }
  }

  const navItems = [
    {
      name: 'Panel Operativo',
      href: '/personal',
      icon: <Bus className="w-4 h-4" />,
    },
    {
      name: 'Escanear QR',
      href: '/personal/escanear',
      icon: <QrCode className="w-4 h-4" />,
    },
    {
      name: 'Servicios Realizados',
      href: '/personal/servicios',
      icon: <ClipboardList className="w-4 h-4" />,
    },
  ]

  return (
    <div className="min-h-screen bg-[#070A11] text-slate-100 flex flex-col font-sans">
      {/* Header Superior Black & Gold */}
      <header className="bg-[#0B0F19] text-white sticky top-0 z-50 border-b border-amber-500/20 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-linear-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20 border border-amber-400">
              <Crown className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-base sm:text-lg tracking-tight text-white">
                  Luxuri Private Travel
                </span>
                <span className="bg-amber-500/15 text-amber-400 text-[10px] px-2 py-0.5 rounded-full font-bold border border-amber-500/30">
                  Operativo
                </span>
              </div>
              <p className="text-slate-400 text-[11px]">Terminal de Control & Registro</p>
            </div>
          </div>

          {/* Menú Desktop */}
          <nav className="hidden md:flex items-center gap-1.5">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-linear-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'text-slate-300 hover:text-amber-300 hover:bg-[#121827] border border-transparent'
                  }`}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* Usuario y Logout */}
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold text-xs">
                {currentUser?.username?.[0]?.toUpperCase() || 'O'}
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-white leading-tight">
                  {currentUser?.username || 'Operador'}
                </p>
                <p className="text-[10px] text-amber-400 font-medium">Personal Autorizado</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="text-slate-400 hover:text-rose-400 p-2 rounded-xl hover:bg-[#121827] transition-colors"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* Botón Menú Mobile */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-slate-400 hover:text-white"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Menú Mobile Desplegable */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-amber-500/20 bg-[#0B0F19] px-4 py-3 space-y-2">
            <div className="pb-3 border-b border-amber-500/10 mb-2 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white">{currentUser?.username || 'Operador'}</p>
                <p className="text-[10px] text-amber-400">Personal Autorizado</p>
              </div>
              <button
                onClick={handleLogout}
                className="text-xs text-rose-400 flex items-center gap-1 font-bold"
              >
                <LogOut className="w-3.5 h-3.5" /> Salir
              </button>
            </div>
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold ${
                    isActive
                      ? 'bg-linear-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'text-slate-300 hover:bg-[#121827]'
                  }`}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </div>
        )}
      </header>

      {/* Contenido Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {children}
      </main>
    </div>
  )
}
