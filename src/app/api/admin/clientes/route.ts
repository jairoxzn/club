export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAuth, Role } from '@/lib/session'
import { hashPin, generateCustomerCode } from '@/lib/auth'
import { createAuditLog } from '@/lib/audit'
import { randomUUID } from 'crypto'

const createCustomerSchema = z.object({
  firstName: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres'),
  lastName: z.string().trim().min(2, 'El apellido debe tener al menos 2 caracteres'),
  phone: z.string().trim().regex(/^9\d{8}$/, 'El telÃ©fono debe ser un nÃºmero celular peruano vÃ¡lido (9 dÃ­gitos)'),
  email: z.string().email('Correo electrÃ³nico invÃ¡lido').optional().or(z.literal('')),
  pin: z.string().regex(/^\d{4}$/, 'El PIN debe ser de 4 dÃ­gitos').optional().default('1234'),
  birthDate: z.string().optional().nullable(),
})

// GET /api/admin/clientes - Listado y bÃºsqueda
export async function GET(request: Request) {
  try {
    const session = await requireAuth([Role.ADMIN, Role.STAFF])
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')?.trim() || ''
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)))
    const skip = (page - 1) * limit

    const whereClause: any = {}

    if (search) {
      whereClause.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
        { customerCode: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [total, customers] = await Promise.all([
      prisma.customerProfile.count({ where: whereClause }),
      prisma.customerProfile.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              isActive: true,
              role: true,
              createdAt: true,
              lastLoginAt: true,
            },
          },
          _count: {
            select: {
              services: true,
              redemptions: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ])

    return NextResponse.json({
      customers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error al listar clientes:', error)
    return NextResponse.json({ error: 'Error interno al consultar clientes' }, { status: 500 })
  }
}

// POST /api/admin/clientes - Registro manual por Admin
export async function POST(request: Request) {
  try {
    const session = await requireAuth([Role.ADMIN])
    if (!session) {
      return NextResponse.json({ error: 'No autorizado. Se requiere rol de administrador' }, { status: 403 })
    }

    const body = await request.json()
    const validation = createCustomerSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Datos de registro invÃ¡lidos',
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      )
    }

    const { firstName, lastName, phone, email, pin, birthDate } = validation.data
    const normalizedEmail = email && email.trim() !== '' ? email.toLowerCase().trim() : null

    // Verificar si ya existe el telÃ©fono
    const existingPhone = await prisma.user.findFirst({
      where: { phone },
    })
    if (existingPhone) {
      return NextResponse.json(
        { error: 'Ya existe una cuenta registrada con este nÃºmero de celular' },
        { status: 409 }
      )
    }

    // Verificar email si se proveyÃ³
    if (normalizedEmail) {
      const existingEmail = await prisma.user.findFirst({
        where: { email: normalizedEmail },
      })
      if (existingEmail) {
        return NextResponse.json(
          { error: 'Ya existe una cuenta registrada con este correo electrÃ³nico' },
          { status: 409 }
        )
      }
    }

    const pinHash = await hashPin(pin)

    // Generar cÃ³digo de cliente Ãºnico
    let customerCode = generateCustomerCode()
    let codeExists = true
    let attempts = 0
    while (codeExists && attempts < 10) {
      const existing = await prisma.customerProfile.findUnique({
        where: { customerCode },
      })
      if (!existing) {
        codeExists = false
      } else {
        customerCode = generateCustomerCode()
        attempts++
      }
    }

    const qrToken = randomUUID()

    const newCustomer = await prisma.$transaction(async (tx: any) => {
      const user = await tx.user.create({
        data: {
          phone,
          email: normalizedEmail,
          pinHash,
          role: Role.CUSTOMER,
          isActive: true,
        },
      })

      const profile = await tx.customerProfile.create({
        data: {
          userId: user.id,
          firstName,
          lastName,
          phone,
          email: normalizedEmail,
          birthDate: birthDate ? new Date(birthDate) : null,
          customerCode,
          qrToken,
          acceptedTerms: true,
          acceptedDataProcessing: true,
          acceptedPromotions: false,
        },
        include: {
          user: {
            select: {
              id: true,
              isActive: true,
              role: true,
              createdAt: true,
            },
          },
        },
      })

      return profile
    })

    // Registrar en auditorÃ­a
    await createAuditLog({
      userId: session.userId,
      action: 'ADMIN_CREATE_CUSTOMER',
      entityType: 'CustomerProfile',
      entityId: newCustomer.id,
      newValues: {
        firstName,
        lastName,
        phone,
        email: normalizedEmail,
        customerCode,
      },
    })

    return NextResponse.json(
      {
        message: 'Cliente registrado exitosamente',
        customer: newCustomer,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error al registrar cliente por admin:', error)
    return NextResponse.json({ error: 'Error interno al registrar el cliente' }, { status: 500 })
  }
}

