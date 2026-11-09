export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { Role } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/session'
import { adjustPoints } from '@/lib/points'
import { createAuditLog } from '@/lib/audit'
import { createNotification } from '@/lib/notifications'

const adjustPointsSchema = z.object({
  amount: z.number().int().refine((val) => val !== 0, 'La cantidad de puntos debe ser diferente de 0'),
  description: z.string().trim().min(3, 'El motivo del ajuste es obligatorio (mínimo 3 caracteres)'),
})

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const session = await requireAuth([Role.ADMIN])
    if (!session) {
      return NextResponse.json({ error: 'No autorizado. Se requiere rol de administrador' }, { status: 403 })
    }

    const { id } = await context.params
    const body = await request.json()
    const validation = adjustPointsSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Datos inválidos',
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      )
    }

    const { amount, description } = validation.data

    const customer = await prisma.customerProfile.findUnique({
      where: { id },
      include: { user: true },
    })

    if (!customer) {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })
    }

    const balanceBefore = customer.availablePoints

    // Ejecutar ajuste usando la función de puntos
    try {
      await adjustPoints(customer.id, amount, description, session.userId)
    } catch (err: any) {
      return NextResponse.json(
        { error: err.message || 'Error al procesar el ajuste de puntos' },
        { status: 400 }
      )
    }

    // Obtener perfil actualizado
    const updatedCustomer = await prisma.customerProfile.findUnique({
      where: { id },
      select: {
        id: true,
        availablePoints: true,
        totalPoints: true,
      },
    })

    // Registrar en auditoría
    await createAuditLog({
      userId: session.userId,
      action: 'ADMIN_ADJUST_POINTS',
      entityType: 'CustomerProfile',
      entityId: customer.id,
      oldValues: {
        availablePoints: balanceBefore,
      },
      newValues: {
        amount,
        description,
        availablePoints: updatedCustomer?.availablePoints,
      },
    })

    // Notificar al cliente sobre el ajuste
    await createNotification({
      userId: customer.userId,
      title: amount > 0 ? 'Ajuste de puntos a tu favor' : 'Ajuste de puntos',
      message: `Se ha realizado un ajuste de ${amount > 0 ? `+${amount}` : amount} puntos en tu cuenta. Motivo: ${description}`,
      type: amount > 0 ? 'SUCCESS' : 'WARNING',
      relatedEntityType: 'PointsTransaction',
    })

    return NextResponse.json({
      message: 'Ajuste de puntos realizado con éxito',
      customer: updatedCustomer,
    })
  } catch (error) {
    console.error('Error al ajustar puntos:', error)
    return NextResponse.json({ error: 'Error interno al ajustar puntos' }, { status: 500 })
  }
}
