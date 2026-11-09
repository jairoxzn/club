export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { Role } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { verifyPassword, checkRateLimit, recordFailedAttempt, clearFailedAttempts } from '@/lib/auth'
import { getSession } from '@/lib/session'
import { createAuditLog } from '@/lib/audit'

const loginAdminSchema = z.object({
  identifier: z.string().trim().min(1, 'El usuario o correo electrÃ³nico es obligatorio'),
  password: z.string().min(1, 'La contraseÃ±a es obligatoria'),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validation = loginAdminSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Datos de inicio de sesiÃ³n invÃ¡lidos',
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      )
    }

    const { identifier, password } = validation.data
    const isEmail = identifier.includes('@')
    const fieldType: 'email' | 'username' = isEmail ? 'email' : 'username'
    const normalizedIdentifier = isEmail ? identifier.toLowerCase() : identifier

    // Buscar usuario por correo o nombre de usuario con rol STAFF o ADMIN
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: normalizedIdentifier },
          { username: normalizedIdentifier },
        ],
        role: {
          in: [Role.ADMIN, Role.STAFF],
        },
      },
    })

    // Si el usuario no existe o no tiene contraseÃ±a configurada
    if (!user || !user.passwordHash) {
      await recordFailedAttempt(normalizedIdentifier, fieldType)
      return NextResponse.json(
        { error: 'Credenciales incorrectas' },
        { status: 401 }
      )
    }

    // Verificar si estÃ¡ bloqueado por demasiados intentos fallidos
    const rateLimit = await checkRateLimit(user.id)
    if (rateLimit.isLocked) {
      const minutesLeft = rateLimit.lockedUntil
        ? Math.max(1, Math.ceil((rateLimit.lockedUntil.getTime() - Date.now()) / (1000 * 60)))
        : 15
      return NextResponse.json(
        {
          error: `Cuenta bloqueada temporalmente por demasiados intentos fallidos. Intenta nuevamente en ${minutesLeft} minutos o contacta al administrador.`,
        },
        { status: 403 }
      )
    }

    // Verificar si la cuenta estÃ¡ activa
    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Tu cuenta se encuentra desactivada. Por favor contacta al administrador.' },
        { status: 403 }
      )
    }

    // Verificar contraseÃ±a
    const isValidPassword = await verifyPassword(password, user.passwordHash)
    if (!isValidPassword) {
      await recordFailedAttempt(normalizedIdentifier, fieldType)
      return NextResponse.json(
        { error: 'Credenciales incorrectas' },
        { status: 401 }
      )
    }

    // ContraseÃ±a correcta: limpiar intentos fallidos
    await clearFailedAttempts(user.id)

    // Guardar sesiÃ³n con rol STAFF o ADMIN
    const session = await getSession()
    session.userId = user.id
    session.role = user.role
    session.isLoggedIn = true
    await session.save()

    // Registrar en auditorÃ­a
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined
    const userAgent = request.headers.get('user-agent') || undefined

    await createAuditLog({
      userId: user.id,
      action: user.role === Role.ADMIN ? 'LOGIN_ADMIN' : 'LOGIN_STAFF',
      entityType: 'User',
      entityId: user.id,
      ipAddress: ipAddress ?? undefined,
      userAgent: userAgent ?? undefined,
    })

    return NextResponse.json({
      success: true,
      message: 'Inicio de sesiÃ³n exitoso',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
      role: user.role,
      redirectTo: user.role === Role.ADMIN ? '/admin' : '/personal',
    })
  } catch (error) {
    console.error('Error en login de administrador/personal:', error)
    return NextResponse.json(
      { error: 'OcurriÃ³ un error al procesar el inicio de sesiÃ³n' },
      { status: 500 }
    )
  }
}

