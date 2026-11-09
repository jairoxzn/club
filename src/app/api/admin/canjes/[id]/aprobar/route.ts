export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { Role, RedemptionStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/session'
import { generateValidationCode } from '@/lib/auth'
import { createAuditLog } from '@/lib/audit'
import { createNotification } from '@/lib/notifications'

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

    if (redemption.status !== RedemptionStatus.PENDING) {
      return NextResponse.json(
        { error: `No se puede aprobar un canje con estado actual: ${redemption.status}` },
        { status: 400 }
      )
    }

    // Generar código de validación único
    let validationCode = generateValidationCode()
    let codeExists = true
    let attempts = 0
    while (codeExists && attempts < 10) {
      const existing = await prisma.redemptionRequest.findUnique({
        where: { validationCode },
      })
      if (!existing) {
        codeExists = false
      } else {
        validationCode = generateValidationCode()
        attempts++
      }
    }

    const now = new Date()

    const updatedRedemption = await prisma.redemptionRequest.update({
      where: { id },
      data: {
        status: RedemptionStatus.APPROVED,
        validationCode,
        reviewedAt: now,
        reviewedById: session.userId,
      },
      include: {
        reward: true,
        customer: true,
      },
    })

    // Notificar al cliente con su código de retiro
    await createNotification({
      userId: redemption.customer.userId,
      title: '¡Tu canje ha sido aprobado!',
      message: `Tu solicitud para "${redemption.reward.name}" fue aprobada. Presenta el código de retiro: ${validationCode} al recoger tu beneficio.`,
      type: 'SUCCESS',
      relatedEntityType: 'RedemptionRequest',
      relatedEntityId: redemption.id,
    })

    // Registrar auditoría
    await createAuditLog({
      userId: session.userId,
      action: 'APPROVE_REDEMPTION',
      entityType: 'RedemptionRequest',
      entityId: redemption.id,
      oldValues: { status: redemption.status },
      newValues: {
        status: RedemptionStatus.APPROVED,
        validationCode,
        rewardId: redemption.rewardId,
      },
    })

    return NextResponse.json({
      message: 'Canje aprobado exitosamente',
      redemption: updatedRedemption,
      validationCode,
    })
  } catch (error) {
    console.error('Error al aprobar canje:', error)
    return NextResponse.json({ error: 'Error interno al aprobar la solicitud de canje' }, { status: 500 })
  }
}
