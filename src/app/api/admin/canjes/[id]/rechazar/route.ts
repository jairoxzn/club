export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { Role, RedemptionStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/session'
import { releaseReservedPoints } from '@/lib/points'
import { createAuditLog } from '@/lib/audit'
import { createNotification } from '@/lib/notifications'

const rejectSchema = z.object({
  reason: z.string().trim().min(3, 'El motivo de rechazo es obligatorio (mínimo 3 caracteres)'),
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
    const validation = rejectSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Datos inválidos',
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      )
    }

    const { reason } = validation.data

    const redemption = await prisma.redemptionRequest.findUnique({
      where: { id },
      include: {
        customer: {
          include: { user: true },
        },
        reward: true,
      },
    })

    if (!redemption) {
      return NextResponse.json({ error: 'Solicitud de canje no encontrada' }, { status: 404 })
    }

    if (redemption.status !== RedemptionStatus.PENDING && redemption.status !== RedemptionStatus.APPROVED) {
      return NextResponse.json(
        { error: `No se puede rechazar un canje en estado ${redemption.status}` },
        { status: 400 }
      )
    }

    // Liberar puntos reservados al cliente
    try {
      await releaseReservedPoints(
        redemption.customerId,
        redemption.id,
        redemption.pointsUsed,
        session.userId
      )
    } catch (pointsErr: any) {
      return NextResponse.json(
        { error: `Error al liberar puntos: ${pointsErr.message}` },
        { status: 500 }
      )
    }

    const now = new Date()
    const updatedRedemption = await prisma.redemptionRequest.update({
      where: { id },
      data: {
        status: RedemptionStatus.REJECTED,
        rejectionReason: reason,
        reviewedAt: now,
        reviewedById: session.userId,
      },
      include: {
        reward: true,
        customer: true,
      },
    })

    // Notificar al cliente con el motivo
    await createNotification({
      userId: redemption.customer.userId,
      title: 'Solicitud de canje rechazada',
      message: `Tu canje por "${redemption.reward.name}" no pudo ser procesado. Motivo: ${reason}. Se han devuelto ${redemption.pointsUsed} puntos a tu saldo disponible.`,
      type: 'WARNING',
      relatedEntityType: 'RedemptionRequest',
      relatedEntityId: redemption.id,
    })

    // Registrar en auditoría
    await createAuditLog({
      userId: session.userId,
      action: 'REJECT_REDEMPTION',
      entityType: 'RedemptionRequest',
      entityId: redemption.id,
      oldValues: { status: redemption.status },
      newValues: {
        status: RedemptionStatus.REJECTED,
        rejectionReason: reason,
        pointsReturned: redemption.pointsUsed,
      },
    })

    return NextResponse.json({
      message: 'Canje rechazado y puntos liberados exitosamente',
      redemption: updatedRedemption,
    })
  } catch (error) {
    console.error('Error al rechazar canje:', error)
    return NextResponse.json({ error: 'Error interno al rechazar la solicitud de canje' }, { status: 500 })
  }
}
