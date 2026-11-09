export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { verifyPin, checkRateLimit, recordFailedAttempt, clearFailedAttempts } from '@/lib/auth'
import { getSession } from '@/lib/session'
import { createAuditLog } from '@/lib/audit'

const loginSchema = z.object({
  phone: z.string().trim().min(1, 'El telÃ©fono es obligatorio'),
  pin: z.string().min(1, 'El PIN es obligatorio'),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validation = loginSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Datos de inicio de sesiÃ³n invÃ¡lidos',
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      )
    }

    const { phone, pin } = validation.data

    // Buscar usuario por telÃ©fono incluyendo su perfil
    const user = await prisma.user.findUnique({
      where: { phone },
      include: { customerProfile: true },
    })

    // Si no existe el usuario o no tiene PIN configurado
    if (!user || !user.pinHash) {
      await recordFailedAttempt(phone, 'phone')
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
          error: `Cuenta bloqueada temporalmente por demasiados intentos fallidos. Intenta nuevamente en ${minutesLeft} minutos o contacta a soporte.`,
        },
        { status: 403 }
      )
    }

    // Verificar si la cuenta estÃ¡ activa
    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Tu cuenta se encuentra desactivada. Por favor contacta a soporte.' },
        { status: 403 }
      )
    }

    // Verificar PIN
    const isValidPin = await verifyPin(pin, user.pinHash)
    if (!isValidPin) {
      await recordFailedAttempt(phone, 'phone')
      return NextResponse.json(
        { error: 'Credenciales incorrectas' },
        { status: 401 }
      )
    }

    // PIN correcto: limpiar intentos fallidos
    await clearFailedAttempts(user.id)

    // Guardar sesiÃ³n con iron-session
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
      action: 'LOGIN_CUSTOMER',
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
        phone: user.phone,
        role: user.role,
        customerProfile: user.customerProfile
          ? {
              id: user.customerProfile.id,
              firstName: user.customerProfile.firstName,
              lastName: user.customerProfile.lastName,
              customerCode: user.customerProfile.customerCode,
              qrToken: user.customerProfile.qrToken,
              availablePoints: user.customerProfile.availablePoints,
              totalPoints: user.customerProfile.totalPoints,
            }
          : null,
      },
    })
  } catch (error) {
    console.error('Error en login de cliente:', error)
    return NextResponse.json(
      { error: 'OcurriÃ³ un error al procesar el inicio de sesiÃ³n' },
      { status: 500 }
    )
  }
}

