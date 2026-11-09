export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { Role } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/session'
import { createAuditLog } from '@/lib/audit'

const updateCustomerSchema = z.object({
  firstName: z.string().trim().min(2).optional(),
  lastName: z.string().trim().min(2).optional(),
  phone: z.string().trim().regex(/^9\d{8}$/, 'El celular debe tener 9 dígitos').optional(),
  email: z.string().email().optional().nullable().or(z.literal('')),
  birthDate: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
})

interface RouteContext {
  params: Promise<{ id: string }>
}

// GET /api/admin/clientes/[id] - Detalle completo de cliente
export async function GET(request: Request, context: RouteContext) {
  try {
    const session = await requireAuth([Role.ADMIN, Role.STAFF])
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await context.params

    const customer = await prisma.customerProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            isActive: true,
            role: true,
            failedLoginAttempts: true,
            lockedUntil: true,
            lastLoginAt: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        services: {
          take: 20,
          orderBy: { serviceDate: 'desc' },
          include: {
            category: {
              select: { id: true, name: true, color: true, icon: true },
            },
            staff: {
              select: { id: true, username: true, email: true },
            },
          },
        },
        pointsTransactions: {
          take: 20,
          orderBy: { createdAt: 'desc' },
          include: {
            performedBy: {
              select: { id: true, username: true, email: true, role: true },
            },
          },
        },
        redemptions: {
          take: 10,
          orderBy: { requestedAt: 'desc' },
          include: {
            reward: true,
          },
        },
      },
    })

    if (!customer) {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })
    }

    return NextResponse.json({ customer })
  } catch (error) {
    console.error('Error al obtener cliente:', error)
    return NextResponse.json({ error: 'Error al consultar datos del cliente' }, { status: 500 })
  }
}

// PUT /api/admin/clientes/[id] - Editar cliente o estado activo
export async function PUT(request: Request, context: RouteContext) {
  try {
    const session = await requireAuth([Role.ADMIN])
    if (!session) {
      return NextResponse.json({ error: 'No autorizado. Se requiere rol de administrador' }, { status: 403 })
    }

    const { id } = await context.params
    const body = await request.json()
    const validation = updateCustomerSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Datos inválidos',
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      )
    }

    const existingCustomer = await prisma.customerProfile.findUnique({
      where: { id },
      include: { user: true },
    })

    if (!existingCustomer) {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })
    }

    const data = validation.data
    const normalizedEmail = data.email === '' ? null : data.email !== undefined ? data.email : undefined

    // Si cambia de celular, verificar que no esté duplicado
    if (data.phone && data.phone !== existingCustomer.phone) {
      const phoneTaken = await prisma.user.findFirst({
        where: {
          phone: data.phone,
          id: { not: existingCustomer.userId },
        },
      })
      if (phoneTaken) {
        return NextResponse.json({ error: 'El número de celular ya está en uso por otro usuario' }, { status: 409 })
      }
    }

    // Si cambia de email, verificar duplicado
    if (normalizedEmail && normalizedEmail !== existingCustomer.email) {
      const emailTaken = await prisma.user.findFirst({
        where: {
          email: normalizedEmail,
          id: { not: existingCustomer.userId },
        },
      })
      if (emailTaken) {
        return NextResponse.json({ error: 'El correo electrónico ya está en uso por otro usuario' }, { status: 409 })
      }
    }

    const updatedProfile = await prisma.$transaction(async (tx) => {
      // Actualizar User
      const userUpdateData: any = {}
      if (data.phone !== undefined) userUpdateData.phone = data.phone
      if (normalizedEmail !== undefined) userUpdateData.email = normalizedEmail
      if (data.isActive !== undefined) userUpdateData.isActive = data.isActive

      if (Object.keys(userUpdateData).length > 0) {
        await tx.user.update({
          where: { id: existingCustomer.userId },
          data: userUpdateData,
        })
      }

      // Actualizar CustomerProfile
      const profileUpdateData: any = {}
      if (data.firstName !== undefined) profileUpdateData.firstName = data.firstName
      if (data.lastName !== undefined) profileUpdateData.lastName = data.lastName
      if (data.phone !== undefined) profileUpdateData.phone = data.phone
      if (normalizedEmail !== undefined) profileUpdateData.email = normalizedEmail
      if (data.birthDate !== undefined) {
        profileUpdateData.birthDate = data.birthDate ? new Date(data.birthDate) : null
      }

      return tx.customerProfile.update({
        where: { id },
        data: profileUpdateData,
        include: {
          user: {
            select: {
              id: true,
              isActive: true,
              role: true,
              updatedAt: true,
            },
          },
        },
      })
    })

    // Registrar auditoría
    await createAuditLog({
      userId: session.userId,
      action: 'UPDATE_CUSTOMER',
      entityType: 'CustomerProfile',
      entityId: id,
      oldValues: {
        firstName: existingCustomer.firstName,
        lastName: existingCustomer.lastName,
        phone: existingCustomer.phone,
        email: existingCustomer.email,
        isActive: existingCustomer.user.isActive,
      },
      newValues: {
        firstName: updatedProfile.firstName,
        lastName: updatedProfile.lastName,
        phone: updatedProfile.phone,
        email: updatedProfile.email,
        isActive: updatedProfile.user.isActive,
      },
    })

    return NextResponse.json({
      message: 'Cliente actualizado exitosamente',
      customer: updatedProfile,
    })
  } catch (error) {
    console.error('Error al actualizar cliente:', error)
    return NextResponse.json({ error: 'Error al actualizar el cliente' }, { status: 500 })
  }
}
