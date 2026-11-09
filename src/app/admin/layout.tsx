'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Bus,
  LayoutDashboard,
  Users,
  ClipboardList,
  QrCode,
  Tag,
  Coins,
  Gift,
  Award,
  FileBarChart,
  UserCheck,
  ShieldAlert,
  Settings,
  LogOut,
  Menu,
  X,
  ExternalLink,
  ChevronRight,
  Bell,
  Crown,
} from 'lucide-react'
import { toast } from 'sonner'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [pendingRedemptionsCount, setPendingRedemptionsCount] = useState(0)

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.user) {
          setCurrentUser(data.user)
        }
      })
      .catch((err) => console.error(err))

    // Cargar solicitudes pendientes para badge
    fetch('/api/admin/canjes?status=PENDING')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.redemptions) {
          setPendingRedemptionsCount(data.redemptions.length)
        }
      })
      .catch(() => {})
  }, [])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      toast.success('Sesión cerrada correctamente')
      router.push('/admin/ingresar')
    } catch {
      toast.error('Error al cerrar sesión')
    }
  }

  const menuSections = [
    {
      title: 'Principal',
      items: [
        { name: 'Dashboard', href: '/admin', icon: <LayoutDashboard className="w-5 h-5" /> },
        { name: 'Escanear QR', href: '/admin/escanear', icon: <QrCode className="w-5 h-5" /> },
      ],
    },
    {
      title: 'Operaciones',
      items: [
        { name: 'Clientes VIP', href: '/admin/clientes', icon: <Users className="w-5 h-5" /> },
        { name: 'Servicios de Transporte', href: '/admin/servicios', icon: <ClipboardList className="w-5 h-5" /> },
      ],
    },
    {
      title: 'Fidelización',
      items: [
        { name: 'Categorías de Traslado', href: '/admin/categorias', icon: <Tag className="w-5 h-5" /> },
        { name: 'Reglas de Puntos', href: '/admin/reglas-puntos', icon: <Coins className="w-5 h-5" /> },
        { name: 'Catálogo de Recompensas', href: '/admin/recompensas', icon: <Gift className="w-5 h-5" /> },
        {
          name: 'Solicitudes de Canje',
          href: '/admin/canjes',
          icon: <Award className="w-5 h-5" />,
          badge: pendingRedemptionsCount > 0 ? pendingRedemptionsCount : null,
        },
      ],
    },
    {
      title: 'Análisis y Gestión',
      items: [
        { name: 'Reportes y Estadísticas', href: '/admin/reportes', icon: <FileBarChart className="w-5 h-5" /> },
        { name: 'Usuarios y Personal', href: '/admin/usuarios', icon: <UserCheck className="w-5 h-5" /> },
        { name: 'Auditoría del Sistema', href: '/admin/auditoria', icon: <ShieldAlert className="w-5 h-5" /> },
        { name: 'Configuración', href: '/admin/configuracion', icon: <Settings className="w-5 h-5" /> },
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-[#070A11] text-slate-100 flex font-sans">
      {/* Sidebar Desktop Black & Gold */}
      <aside className="hidden lg:flex lg:flex-col w-64 bg-[#0B0F19] border-r border-amber-500/20 text-slate-300 shrink-0 min-h-screen sticky top-0 h-screen shadow-2xl">
        {/* Logo */}
        <div className="p-5 border-b border-amber-500/20 flex items-center justify-between bg-[#070A11]/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-linear-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20 border border-amber-400">
              <Crown className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <span className="font-black text-white text-sm tracking-tight block">
                LUXURI
              </span>
              <span className="text-[10px] text-amber-400 font-bold tracking-widest uppercase">
                Panel Central
              </span>
            </div>
          </div>
        </div>

        {/* Menú de Navegación con Scroll */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {menuSections.map((section) => (
            <div key={section.title}>
              <h3 className="px-3 text-[10px] font-black uppercase tracking-wider text-amber-500/60 mb-2">
                {section.title}
              </h3>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-linear-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-500/20'
                          : 'text-slate-300 hover:text-amber-300 hover:bg-[#121827]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={isActive ? 'text-slate-950' : 'text-amber-400/80'}>
                          {item.icon}
                        </span>
                        <span>{item.name}</span>
                      </div>
                      {item.badge && (
                        <span className="bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full font-black animate-pulse shadow-xs">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Sidebar */}
        <div className="p-4 border-t border-amber-500/20 bg-[#070A11]/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 truncate">
              <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0">
                {currentUser?.username?.[0]?.toUpperCase() || 'A'}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-white truncate">
                  {currentUser?.username || 'Administrador'}
                </p>
                <p className="text-[10px] text-amber-400/80 truncate">Super Admin</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-slate-400 hover:text-rose-400 p-1.5 hover:bg-[#121827] rounded-lg transition-colors shrink-0"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Contenedor Principal */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#070A11]">
        {/* Topbar Black & Gold */}
        <header className="h-16 bg-[#0B0F19] border-b border-amber-500/20 sticky top-0 z-40 px-4 sm:px-6 lg:px-8 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-[#121827] rounded-lg"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="hidden sm:flex items-center gap-2">
              <Crown className="w-4 h-4 text-amber-400" />
              <h2 className="text-xs font-bold text-slate-300">
                Sistema Integral de Fidelización & Traslados Luxuri
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="hidden sm:flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-bold px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Ver Página Pública
            </Link>

            <Link
              href="/admin/canjes"
              className="relative p-2 text-slate-400 hover:text-amber-400 hover:bg-[#121827] rounded-lg transition-colors"
              title="Solicitudes pendientes"
            >
              <Bell className="w-5 h-5" />
              {pendingRedemptionsCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-[#0B0F19]"></span>
              )}
            </Link>

            <button
              onClick={handleLogout}
              className="lg:hidden p-2 text-slate-400 hover:text-rose-400 rounded-lg"
              title="Salir"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Sidebar Móvil Drawer */}
        {isSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-black/80 backdrop-blur-xs transition-opacity"
              onClick={() => setIsSidebarOpen(false)}
            />
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-[#0B0F19] text-slate-300 border-r border-amber-500/30">
              <div className="p-4 border-b border-amber-500/20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-linear-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center text-slate-950 font-black">
                    <Crown className="w-4 h-4" />
                  </div>
                  <span className="font-black text-white text-base">LUXURI</span>
                </div>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {menuSections.map((section) => (
                  <div key={section.title}>
                    <h3 className="text-[10px] font-black uppercase tracking-wider text-amber-500/60 mb-1 px-2">
                      {section.title}
                    </h3>
                    <div className="space-y-1">
                      {section.items.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsSidebarOpen(false)}
                          className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold ${
                            pathname === item.href
                              ? 'bg-linear-to-r from-amber-500 to-amber-600 text-slate-950'
                              : 'text-slate-300 hover:bg-[#121827] hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            {item.icon}
                            <span>{item.name}</span>
                          </div>
                          {item.badge && (
                            <span className="bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full font-black">
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 border-t border-amber-500/20 flex items-center justify-between bg-[#070A11]/60">
                <span className="text-xs text-slate-300 font-bold">
                  {currentUser?.username || 'Administrador'}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-xs text-rose-400 flex items-center gap-1 hover:underline font-bold"
                >
                  <LogOut className="w-3.5 h-3.5" /> Salir
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Contenido de Página */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
