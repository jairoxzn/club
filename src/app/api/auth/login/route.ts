export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { verifyPassword, verifyPin, checkRateLimit, clearFailedAttempts } from '@/lib/auth'
import { getSession } from '@/lib/session'
import { createAuditLog } from '@/lib/audit'

const unifiedLoginSchema = z.object({
  identifier: z.string().trim().min(1, 'Ingresa tu celular, usuario o correo'),
  password: z.string().min(1, 'Ingresa tu PIN o contraseña'),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validation = unifiedLoginSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Datos de inicio de sesión inválidos',
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      )
    }

    const { identifier, password } = validation.data
    const cleanIdentifier = identifier.trim()
    const lowerIdentifier = cleanIdentifier.toLowerCase()
    const digitsOnly = cleanIdentifier.replace(/\D/g, '')
    const isPhoneLike = digitsOnly.length >= 9
    const last9Digits = digitsOnly.slice(-9)

    // Búsqueda inteligente del usuario:
    // 1. Por teléfono (con o sin prefijo)
    // 2. Por correo electrónico (insensible a mayúsculas)
    // 3. Por nombre de usuario (insensible a mayúsculas)
    // 4. Por código de cliente (CustomerProfile.customerCode)
    // 5. Por correo o teléfono en CustomerProfile
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          ...(isPhoneLike ? [{ phone: last9Digits }, { phone: cleanIdentifier }] : []),
          { email: { equals: lowerIdentifier, mode: 'insensitive' } },
          { username: { equals: cleanIdentifier, mode: 'insensitive' } },
          {
            customerProfile: {
              customerCode: { equals: cleanIdentifier.toUpperCase() },
            },
          },
          {
            customerProfile: {
              email: { equals: lowerIdentifier, mode: 'insensitive' },
            },
          },
          ...(isPhoneLike
            ? [
                {
                  customerProfile: {
                    phone: last9Digits,
                  },
                },
              ]
            : []),
        ],
      },
      include: {
        customerProfile: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Credenciales incorrectas. Verifica tu usuario, celular o correo.' },
        { status: 401 }
      )
    }

    // Verificar si la cuenta está activa
    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Tu cuenta se encuentra desactivada. Por favor contacta a soporte.' },
        { status: 403 }
      )
    }

    // Verificar bloqueo por intentos fallidos
    const rateLimit = await checkRateLimit(user.id)
    if (rateLimit.isLocked) {
      const minutesLeft = rateLimit.lockedUntil
        ? Math.max(1, Math.ceil((rateLimit.lockedUntil.getTime() - Date.now()) / (1000 * 60)))
        : 15
      return NextResponse.json(
        {
          error: `Cuenta bloqueada temporalmente por seguridad. Intenta nuevamente en ${minutesLeft} minutos.`,
        },
        { status: 403 }
      )
    }

    // Comprobar credenciales (PIN o Contraseña)
    let isValid = false

    // Si tiene PIN configurado (típico para clientes)
    if (user.pinHash) {
      isValid = await verifyPin(password, user.pinHash)
    }

    // Si no coincidió con PIN y tiene contraseña configurada (personal/admin)
    if (!isValid && user.passwordHash) {
      isValid = await verifyPassword(password, user.passwordHash)
    }

    if (!isValid) {
      // Registrar intento fallido
      const maxAttempts = 5
      const lockoutMinutes = 15
      const newAttempts = user.failedLoginAttempts + 1

      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: newAttempts,
          lockedUntil:
            newAttempts >= maxAttempts
              ? new Date(Date.now() + lockoutMinutes * 60 * 1000)
              : null,
        },
      })

      const remaining = maxAttempts - newAttempts
      const warnMsg =
        remaining > 0 && remaining <= 2
          ? ` (Te quedan ${remaining} intento${remaining > 1 ? 's' : ''} antes de bloquear la cuenta)`
          : ''

      return NextResponse.json(
        { error: `PIN o contraseña incorrecta.${warnMsg}` },
        { status: 401 }
      )
    }

    // Credencial válida: limpiar intentos fallidos y actualizar último login
    await clearFailedAttempts(user.id)

    // Crear sesión cifrada con iron-session
    const session = await getSession()
    session.userId = user.id
    session.role = user.role
    session.isLoggedIn = true
    await session.save()

    // Registrar en auditoría según rol
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined
    const userAgent = request.headers.get('user-agent') || undefined

    const auditAction =
      user.role === 'ADMIN'
        ? 'LOGIN_ADMIN'
        : user.role === 'STAFF'
        ? 'LOGIN_STAFF'
        : 'LOGIN_CUSTOMER'

    await createAuditLog({
      userId: user.id,
      action: auditAction,
      entityType: 'User',
      entityId: user.id,
      ipAddress: ipAddress ?? undefined,
      userAgent: userAgent ?? undefined,
    })

    // Determinar URL de redirección según el rol
    const redirectTo =
      user.role === 'ADMIN'
        ? '/admin'
        : user.role === 'STAFF'
        ? '/personal'
        : '/cliente'

    return NextResponse.json({
      success: true,
      message: 'Inicio de sesión exitoso',
      role: user.role,
      redirectTo,
      user: {
        id: user.id,
        role: user.role,
        phone: user.phone,
        email: user.email,
        username: user.username,
        customerProfile: user.customerProfile
          ? {
              id: user.customerProfile.id,
              firstName: user.customerProfile.firstName,
              lastName: user.customerProfile.lastName,
              customerCode: user.customerProfile.customerCode,
              availablePoints: user.customerProfile.availablePoints,
              totalPoints: user.customerProfile.totalPoints,
            }
          : null,
      },
    })
  } catch (error) {
    console.error('Error en login unificado:', error)
    return NextResponse.json(
      { error: 'Ocurrió un error inesperado al procesar el inicio de sesión' },
      { status: 500 }
    )
  }
}
