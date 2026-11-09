export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/session'
import { Role } from '@prisma/client'
import { reservePointsForRedemption } from '@/lib/points'
import { createNotification } from '@/lib/notifications'
import { createAuditLog } from '@/lib/audit'
import { z } from 'zod'

const canjeSchema = z.object({
  rewardId: z.string().uuid('ID de recompensa invÃ¡lido'),
})

export async function GET() {
  try {
    const session = await requireAuth([Role.CUSTOMER])
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const profile = await prisma.customerProfile.findUnique({
      where: { userId: session.userId },
      select: { id: true },
    })

    if (!profile) {
      return NextResponse.json({ error: 'Perfil de cliente no encontrado' }, { status: 404 })
    }

    const redemptions = await prisma.redemptionRequest.findMany({
      where: { customerId: profile.id },
      include: {
        reward: {
          select: {
            id: true,
            name: true,
            description: true,
            imageUrl: true,
            pointsRequired: true,
            conditions: true,
          },
        },
      },
      orderBy: { requestedAt: 'desc' },
    })

    return NextResponse.json({
      success: true,
      redemptions,
    })
  } catch (error) {
    console.error('Error al obtener canjes del cliente:', error)
    return NextResponse.json(
      { error: 'Error al obtener historial de canjes' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAuth([Role.CUSTOMER])
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const validation = canjeSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Datos de solicitud invÃ¡lidos', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const { rewardId } = validation.data

    const profile = await prisma.customerProfile.findUnique({
      where: { userId: session.userId },
      select: {
        id: true,
        availablePoints: true,
        firstName: true,
        lastName: true,
      },
    })

    if (!profile) {
      return NextResponse.json({ error: 'Perfil de cliente no encontrado' }, { status: 404 })
    }

    // Buscar recompensa y validar
    const reward = await prisma.reward.findUnique({
      where: { id: rewardId },
    })

    if (!reward || !reward.isActive || reward.isDeleted) {
      return NextResponse.json(
        { error: 'La recompensa no estÃ¡ disponible o no existe' },
        { status: 404 }
      )
    }

    // Validar vigencia
    const now = new Date()
    if (reward.startDate && reward.startDate > now) {
      return NextResponse.json(
        { error: 'Esta recompensa aÃºn no estÃ¡ vigente' },
        { status: 400 }
      )
    }
    if (reward.endDate && reward.endDate < now) {
      return NextResponse.json(
        { error: 'Esta recompensa ha expirado' },
        { status: 400 }
      )
    }

    // Validar stock
    if (reward.stock !== null && reward.stock <= 0) {
      return NextResponse.json(
        { error: 'Esta recompensa se encuentra agotada (sin stock)' },
        { status: 400 }
      )
    }

    // Validar puntos
    if (profile.availablePoints < reward.pointsRequired) {
      return NextResponse.json(
        {
          error: `Puntos insuficientes. Tienes ${profile.availablePoints} pts y necesitas ${reward.pointsRequired} pts.`,
        },
        { status: 400 }
      )
    }

    // Crear la solicitud de canje
    const redemption = await prisma.redemptionRequest.create({
      data: {
        customerId: profile.id,
        rewardId: reward.id,
        pointsUsed: reward.pointsRequired,
        status: 'PENDING',
      },
    })

    // Reservar puntos del cliente
    try {
      await reservePointsForRedemption(
        profile.id,
        redemption.id,
        reward.pointsRequired,
        session.userId
      )

      // Si tiene stock limitado, descontar 1 del stock
      if (reward.stock !== null) {
        await prisma.reward.update({
          where: { id: reward.id },
          data: { stock: { decrement: 1 } },
        })
      }
    } catch (pointsError: any) {
      // Revertir creaciÃ³n de la solicitud si falla la reserva
      await prisma.redemptionRequest.delete({
        where: { id: redemption.id },
      })
      console.error('Error al reservar puntos:', pointsError)
      return NextResponse.json(
        { error: pointsError.message || 'No se pudieron reservar los puntos' },
        { status: 400 }
      )
    }

    // NotificaciÃ³n de sistema al cliente
    await createNotification({
      userId: session.userId,
      title: 'Solicitud de canje enviada',
      message: `Has solicitado canjear "${reward.name}" por ${reward.pointsRequired} puntos. Tu solicitud estÃ¡ en revisiÃ³n.`,
      type: 'INFO',
      relatedEntityType: 'RedemptionRequest',
      relatedEntityId: redemption.id,
    })

    // Registro de auditorÃ­a
    await createAuditLog({
      userId: session.userId,
      action: 'REQUEST_REDEMPTION',
      entityType: 'RedemptionRequest',
      entityId: redemption.id,
      newValues: {
        rewardId: reward.id,
        rewardName: reward.name,
        pointsUsed: reward.pointsRequired,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Solicitud de canje registrada exitosamente',
      redemptionId: redemption.id,
    })
  } catch (error) {
    console.error('Error al procesar solicitud de canje:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor al procesar el canje' },
      { status: 500 }
    )
  }
}

