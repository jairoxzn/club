import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getIronSession } from 'iron-session'
import { SessionData } from './lib/session'

const sessionOptions = {
  password: process.env.SESSION_SECRET!,
  cookieName: 'transportclub_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax' as const,
  },
}

// Rutas que requieren autenticación por rol
const PROTECTED_ROUTES = {
  '/cliente': 'CUSTOMER',
  '/admin': 'ADMIN',
  '/personal': 'STAFF',
} as const

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Si intentan acceder al login de admin antiguo, redirigir al login unificado
  if (pathname === '/admin/ingresar') {
    return NextResponse.redirect(new URL('/ingresar', request.url))
  }

  // Verificar si es ruta protegida
  const protectedPrefix = Object.keys(PROTECTED_ROUTES).find(prefix =>
    pathname.startsWith(prefix)
  )

  if (!protectedPrefix) {
    return NextResponse.next()
  }

  const requiredRole = PROTECTED_ROUTES[protectedPrefix as keyof typeof PROTECTED_ROUTES]

  try {
    const session = await getIronSession<SessionData>(request.cookies as any, sessionOptions)

    // Si no ha iniciado sesión, enviar al login unificado
    if (!session.isLoggedIn || !session.userId) {
      const returnUrl = encodeURIComponent(pathname)
      const loginUrl = `/ingresar?returnUrl=${returnUrl}`
      return NextResponse.redirect(new URL(loginUrl, request.url))
    }

    // Si tiene sesión pero con un rol diferente, redirigir a su dashboard correspondiente
    if (session.role !== requiredRole) {
      const dashboardUrl =
        session.role === 'CUSTOMER'
          ? '/cliente'
          : session.role === 'ADMIN'
          ? '/admin'
          : '/personal'

      return NextResponse.redirect(new URL(dashboardUrl, request.url))
    }

    return NextResponse.next()
  } catch {
    return NextResponse.redirect(new URL('/ingresar', request.url))
  }
}

export const config = {
  matcher: [
    '/cliente/:path*',
    '/admin/:path*',
    '/personal/:path*',
    '/admin/ingresar',
  ],
}
