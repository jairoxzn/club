export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import crypto from 'crypto'
import { Role, NotificationType } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { hashPin, generateCustomerCode } from '@/lib/auth'
import { getSession } from '@/lib/session'
import { createAuditLog } from '@/lib/audit'
import { createNotification } from '@/lib/notifications'

const registerSchema = z.object({
  firstName: z.string().trim().min(1, 'El nombre es obligatorio'),
  lastName: z.string().trim().min(1, 'Los apellidos son obligatorios'),
  phone: z
    .string()
    .trim()
    .regex(/^9\d{8}$/, 'El telÃ©fono debe tener 9 dÃ­gitos y comenzar con 9'),
  pin: z
    .string()
    .regex(/^\d{4,8}$/, 'El PIN debe ser numÃ©rico y contener entre 4 y 8 dÃ­gitos'),
  email: z
    .string()
    .trim()
    .email('El correo electrÃ³nico no es vÃ¡lido')
    .optional()
    .or(z.literal(''))
    .nullable(),
  birthDate: z
    .string()
    .optional()
    .nullable()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: 'Fecha de nacimiento invÃ¡lida',
    }),
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: 'Debes aceptar los tÃ©rminos y condiciones' }),
  }),
  acceptDataProcessing: z.literal(true, {
    errorMap: () => ({ message: 'Debes aceptar el tratamiento de datos personales' }),
  }),
  acceptPromotions: z.boolean().optional().default(false),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validation = registerSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Datos de registro invÃ¡lidos',
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      )
    }

    const {
      firstName,
      lastName,
      phone,
      pin,
      email: rawEmail,
      birthDate: rawBirthDate,
      acceptTerms,
      acceptDataProcessing,
      acceptPromotions,
    } = validation.data

    const email = rawEmail && rawEmail.trim().length > 0 ? rawEmail.trim().toLowerCase() : null
    const birthDate = rawBirthDate ? new Date(rawBirthDate) : null

    // Verificar si el telÃ©fono ya estÃ¡ registrado en User o CustomerProfile
    const [existingUserByPhone, existingProfileByPhone] = await Promise.all([
      prisma.user.findUnique({ where: { phone } }),
      prisma.customerProfile.findUnique({ where: { phone } }),
    ])

    if (existingUserByPhone || existingProfileByPhone) {
      return NextResponse.json(
        { error: 'El nÃºmero de telÃ©fono ya se encuentra registrado' },
        { status: 409 }
      )
    }

    // Verificar email si fue proporcionado
    if (email) {
      const existingUserByEmail = await prisma.user.findUnique({
        where: { email },
      })
      if (existingUserByEmail) {
        return NextResponse.json(
          { error: 'El correo electrÃ³nico ya se encuentra registrado' },
          { status: 409 }
        )
      }
    }

    // Hashear el PIN
    const pinHash = await hashPin(pin)

    // Generar cÃ³digo de cliente Ãºnico (8 caracteres)
    let customerCode = generateCustomerCode()
    let isUniqueCode = false
    let attempts = 0
    while (!isUniqueCode && attempts < 5) {
      const existing = await prisma.customerProfile.findUnique({
        where: { customerCode },
      })
      if (!existing) {
        isUniqueCode = true
      } else {
        customerCode = generateCustomerCode()
        attempts++
      }
    }

    const qrToken = crypto.randomUUID()

    // Crear User y CustomerProfile en una transacciÃ³n
    const user = await prisma.$transaction(async (tx) => {
      return tx.user.create({
        data: {
          phone,
          email,
          pinHash,
          role: Role.CUSTOMER,
          isActive: true,
          customerProfile: {
            create: {
              firstName,
              lastName,
              phone,
              email,
              birthDate,
              customerCode,
              qrToken,
              acceptedTerms: acceptTerms,
              acceptedDataProcessing: acceptDataProcessing,
              acceptedPromotions: acceptPromotions,
            },
          },
        },
        include: {
          customerProfile: true,
        },
      })
    })

    // Inicializar sesiÃ³n con iron-session
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
      action: 'REGISTER_CUSTOMER',
      entityType: 'User',
      entityId: user.id,
      newValues: {
        phone: user.phone,
        role: user.role,
        customerCode: user.customerProfile?.customerCode,
      },
      ipAddress: ipAddress ?? undefined,
      userAgent: userAgent ?? undefined,
    })

    // Crear notificaciÃ³n de bienvenida
    await createNotification({
      userId: user.id,
      title: 'Â¡Bienvenido a TransportClub!',
      message: `Hola ${user.customerProfile?.firstName}, tu cuenta ha sido creada exitosamente. Tu cÃ³digo de cliente es ${user.customerProfile?.customerCode}.`,
      type: NotificationType.SUCCESS,
      relatedEntityType: 'CustomerProfile',
      relatedEntityId: user.customerProfile?.id,
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Registro exitoso',
        user: {
          id: user.id,
          phone: user.phone,
          email: user.email,
          role: user.role,
          customerProfile: {
            id: user.customerProfile?.id,
            firstName: user.customerProfile?.firstName,
            lastName: user.customerProfile?.lastName,
            customerCode: user.customerProfile?.customerCode,
            qrToken: user.customerProfile?.qrToken,
            availablePoints: user.customerProfile?.availablePoints ?? 0,
            totalPoints: user.customerProfile?.totalPoints ?? 0,
          },
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error en registro de cliente:', error)
    return NextResponse.json(
      { error: 'OcurriÃ³ un error al procesar el registro' },
      { status: 500 }
    )
  }
}

