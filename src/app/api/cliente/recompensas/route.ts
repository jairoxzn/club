export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/session'
import { Role } from '@prisma/client'

export async function GET() {
  try {
    const session = await requireAuth([Role.CUSTOMER])
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const profile = await prisma.customerProfile.findUnique({
      where: { userId: session.userId },
      select: {
        id: true,
        availablePoints: true,
      },
    })

    if (!profile) {
      return NextResponse.json({ error: 'Perfil de cliente no encontrado' }, { status: 404 })
    }

    const now = new Date()

    const rewards = await prisma.reward.findMany({
      where: {
        isActive: true,
        isDeleted: false,
        OR: [
          { startDate: null },
          { startDate: { lte: now } },
        ],
        AND: [
          {
            OR: [
              { endDate: null },
              { endDate: { gte: now } },
            ],
          },
        ],
      },
      orderBy: { pointsRequired: 'asc' },
    })

    const formattedRewards = rewards.map((reward) => {
      const hasStock = reward.stock === null || reward.stock > 0
      const canRedeem = profile.availablePoints >= reward.pointsRequired && hasStock
      const missingPoints = Math.max(0, reward.pointsRequired - profile.availablePoints)

      return {
        id: reward.id,
        name: reward.name,
        description: reward.description,
        imageUrl: reward.imageUrl,
        pointsRequired: reward.pointsRequired,
        stock: reward.stock,
        hasStock,
        startDate: reward.startDate,
        endDate: reward.endDate,
        conditions: reward.conditions,
        canRedeem,
        missingPoints,
      }
    })

    return NextResponse.json({
      success: true,
      availablePoints: profile.availablePoints,
      rewards: formattedRewards,
    })
  } catch (error) {
    console.error('Error al obtener recompensas:', error)
    return NextResponse.json(
      { error: 'Error al obtener catÃ¡logo de recompensas' },
      { status: 500 }
    )
  }
}

