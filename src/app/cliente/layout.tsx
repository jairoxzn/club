'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Home,
  QrCode,
  Coins,
  Gift,
  History,
  TicketCheck,
  User,
  LogOut,
  Sparkles,
  Menu,
  X,
  Crown,
} from 'lucide-react'
import { toast } from 'sonner'

interface UserData {
  firstName: string
  lastName: string
  availablePoints: number
  customerCode: string
}

export default function ClienteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const fetchUserData = async () => {
    try {
      const res = await fetch('/api/auth/me')
      if (!res.ok) {
        if (res.status === 401) {
          router.push('/ingresar')
          return
        }
        return
      }
      const data = await res.json()
      if (data.user?.customerProfile) {
        setUserData({
          firstName: data.user.customerProfile.firstName,
          lastName: data.user.customerProfile.lastName,
          availablePoints: data.user.customerProfile.availablePoints,
          customerCode: data.user.customerProfile.customerCode,
        })
      }
    } catch (err) {
      console.error('Error al cargar datos del usuario:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUserData()
  }, [pathname])

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' })
      if (res.ok) {
        toast.success('Sesión finalizada')
        router.push('/ingresar')
      } else {
        toast.error('Error al cerrar sesión')
      }
    } catch {
      toast.error('Error al comunicarse con el servidor')
    }
  }

  const navLinks = [
    { href: '/cliente', label: 'Inicio', icon: Home },
    { href: '/cliente/mi-qr', label: 'Mi QR', icon: QrCode },
    { href: '/cliente/mis-puntos', label: 'Mis Puntos', icon: Coins },
    { href: '/cliente/historial', label: 'Historial', icon: History },
    { href: '/cliente/recompensas', label: 'Recompensas', icon: Gift },
    { href: '/cliente/canjes', label: 'Mis Canjes', icon: TicketCheck },
    { href: '/cliente/perfil', label: 'Mi Perfil', icon: User },
  ]

  const bottomNavLinks = [
    { href: '/cliente', label: 'Inicio', icon: Home },
    { href: '/cliente/mis-puntos', label: 'Puntos', icon: Coins },
    { href: '/cliente/mi-qr', label: 'Mi QR', icon: QrCode, isSpecial: true },
    { href: '/cliente/recompensas', label: 'Premios', icon: Gift },
    { href: '/cliente/perfil', label: 'Perfil', icon: User },
  ]

  return (
    <div className="min-h-screen bg-[#070A11] text-slate-100 flex flex-col pb-24 md:pb-8">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-[#0B0F19]/95 backdrop-blur-md border-b border-amber-500/20 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <Link href="/cliente" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-700 p-0.5 shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-[#0B0F19] rounded-[10px] flex items-center justify-center">
                  <Crown className="w-5 h-5 text-amber-400" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-black text-base text-white tracking-wider flex items-center gap-1">
                  LUXURI <span className="text-amber-400">CLUB</span>
                </span>
                <span className="text-[10px] font-semibold text-amber-300/80 uppercase tracking-widest leading-none">
                  Del aeropuerto a tu destino
                </span>
              </div>
            </Link>
          </div>

          {/* User info, Points pill & Quick Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            {userData && (
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-xs font-bold text-white leading-tight">
                  ¡Hola, {userData.firstName}!
                </span>
                <span className="text-[11px] font-mono text-amber-400/90 font-semibold">
                  CÓDIGO: {userData.customerCode}
                </span>
              </div>
            )}

            {/* Puntos Pill */}
            <Link
              href="/cliente/mis-puntos"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-95 transition-all"
              title="Ver mis puntos"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>
                {loading ? '...' : (userData?.availablePoints ?? 0).toLocaleString()}
              </span>
              <span className="text-[10px] uppercase font-extrabold opacity-90">PTS</span>
            </Link>

            {/* Quick QR Button (Desktop) */}
            <Link
              href="/cliente/mi-qr"
              className="hidden md:flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-900 border border-amber-500/30 text-amber-300 hover:bg-amber-500/10 hover:border-amber-500 transition-all"
            >
              <QrCode className="w-4 h-4" />
              <span>Ver QR</span>
            </Link>

            {/* Logout Button (Desktop) */}
            <button
              onClick={handleLogout}
              className="hidden md:flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-400 px-2.5 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
              <span className="sr-only">Cerrar sesión</span>
            </button>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Abrir menú"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Desktop Navigation Sub-bar */}
        <div className="hidden md:block bg-[#070A11] border-t border-slate-800/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center gap-1 py-1.5 overflow-x-auto no-scrollbar">
              {navLinks.map((item) => {
                const isActive = pathname === item.href
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                      isActive
                        ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-xs'
                        : 'text-slate-400 hover:text-white hover:bg-slate-900'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#0B0F19] border-t border-slate-800 px-4 py-4 space-y-2 shadow-2xl">
            {userData && (
              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 mb-3 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">
                    {userData.firstName} {userData.lastName}
                  </div>
                  <div className="text-[11px] font-mono text-amber-400 font-bold">
                    Código: {userData.customerCode}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400">Puntos VIP</div>
                  <div className="text-sm font-black text-amber-400">
                    {userData.availablePoints} pts
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              {navLinks.map((item) => {
                const isActive = pathname === item.href
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold ${
                      isActive
                        ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                        : 'text-slate-300 hover:bg-slate-900'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-amber-400" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </div>

            <div className="pt-3 border-t border-slate-800 mt-2 flex items-center justify-between text-xs">
              <Link
                href="/"
                className="text-slate-400 hover:text-white py-1 flex items-center gap-1"
                onClick={() => setMobileMenuOpen(false)}
              >
                Página web principal
              </Link>
              <button
                onClick={handleLogout}
                className="text-red-400 hover:text-red-300 font-bold py-1 flex items-center gap-1.5"
              >
                <LogOut className="w-4 h-4" />
                <span>Cerrar sesión</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>

      {/* Bottom Floating Navigation for Mobile Devices */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0B0F19]/95 backdrop-blur-md border-t border-amber-500/20 px-3 py-2 shadow-2xl">
        <div className="flex items-center justify-around max-w-md mx-auto relative">
          {bottomNavLinks.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            if (item.isSpecial) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex flex-col items-center -mt-6 group focus:outline-none"
                >
                  <div className="w-13 h-13 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 p-0.5 shadow-lg shadow-amber-500/30 group-active:scale-95 transition-transform">
                    <div className="w-full h-full bg-[#0B0F19] rounded-[14px] flex items-center justify-center">
                      <Icon className="w-6 h-6 text-amber-400" />
                    </div>
                  </div>
                  <span className="text-[10px] font-black text-amber-400 mt-1">
                    {item.label}
                  </span>
                </Link>
              )
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center py-1 px-2.5 rounded-xl text-center transition-colors ${
                  isActive ? 'text-amber-400' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                <span className={`text-[10px] font-semibold mt-1 ${isActive ? 'font-black' : ''}`}>
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
