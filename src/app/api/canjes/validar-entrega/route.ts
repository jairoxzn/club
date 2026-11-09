export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAuth, Role } from '@/lib/session'
import { confirmRedemption } from '@/lib/points'
import { createAuditLog } from '@/lib/audit'
import { createNotification } from '@/lib/notifications'

export const RedemptionStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const
export type RedemptionStatus = (typeof RedemptionStatus)[keyof typeof RedemptionStatus]

const validateDeliverySchema = z.object({
  validationCode: z.string().trim().min(4, 'El cÃ³digo de validaciÃ³n es obligatorio'),
})

export async function POST(request: Request) {
  try {
    const session = await requireAuth([Role.ADMIN, Role.STAFF])
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const validation = validateDeliverySchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'CÃ³digo invÃ¡lido',
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      )
    }

    const { validationCode } = validation.data

    // Buscar el canje por cÃ³digo de validaciÃ³n
    const redemption = await prisma.redemptionRequest.findUnique({
      where: { validationCode: validationCode.toUpperCase() },
      include: {
        customer: {
          include: { user: true },
        },
        reward: true,
      },
    })

    if (!redemption) {
      return NextResponse.json(
        { error: 'CÃ³digo de retiro no encontrado o no vÃ¡lido' },
        { status: 404 }
      )
    }

    if (redemption.status === RedemptionStatus.COMPLETED) {
      return NextResponse.json(
        {
          error: `Este canje ya fue entregado el ${redemption.validatedAt ? new Date(redemption.validatedAt).toLocaleString('es-PE') : ''}`,
        },
        { status: 400 }
      )
    }

    if (redemption.status !== RedemptionStatus.APPROVED) {
      return NextResponse.json(
        {
          error: `El canje no estÃ¡ listo para entrega. Estado actual: ${redemption.status}`,
        },
        { status: 400 }
      )
    }

    // Confirmar canje definitivamente en la base de datos (descuento definitivo de puntos)
    try {
      await confirmRedemption(
        redemption.customerId,
        redemption.id,
        redemption.pointsUsed,
        session.userId
      )
    } catch (pointsErr: any) {
      return NextResponse.json(
        { error: `Error al confirmar el canje de puntos: ${pointsErr.message}` },
        { status: 500 }
      )
    }

    const now = new Date()

    // Actualizar canje y stock si aplica
    const updatedRedemption = await prisma.$transaction(async (tx: any) => {
      // Si la recompensa tiene control de stock, decrementar
      if (redemption.reward.stock !== null && redemption.reward.stock > 0) {
        await tx.reward.update({
          where: { id: redemption.rewardId },
          data: { stock: { decrement: 1 } },
        })
      }

      return tx.redemptionRequest.update({
        where: { id: redemption.id },
        data: {
          status: RedemptionStatus.COMPLETED,
          validatedAt: now,
          validatedById: session.userId,
        },
        include: {
          reward: true,
          customer: true,
          validatedBy: {
            select: { id: true, username: true, email: true },
          },
        },
      })
    })

    // Notificar al cliente de la entrega completada
    await createNotification({
      userId: redemption.customer.userId,
      title: 'Â¡Beneficio entregado con Ã©xito!',
      message: `Tu canje por "${redemption.reward.name}" ha sido validado y entregado con Ã©xito. Â¡Gracias por viajar con nosotros!`,
      type: 'SUCCESS',
      relatedEntityType: 'RedemptionRequest',
      relatedEntityId: redemption.id,
    })

    // Registrar en auditorÃ­a
    await createAuditLog({
      userId: session.userId,
      action: 'DELIVER_REDEMPTION',
      entityType: 'RedemptionRequest',
      entityId: redemption.id,
      oldValues: { status: RedemptionStatus.APPROVED },
      newValues: {
        status: RedemptionStatus.COMPLETED,
        validatedAt: now,
      },
    })

    return NextResponse.json({
      message: 'Beneficio validado y entregado exitosamente',
      redemption: updatedRedemption,
    })
  } catch (error) {
    console.error('Error al validar entrega de canje:', error)
    return NextResponse.json({ error: 'Error interno al validar la entrega' }, { status: 500 })
  }
}

