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
        firstName: true,
        lastName: true,
        phone: true,
        email: true,
        customerCode: true,
        availablePoints: true,
        totalPoints: true,
        reservedPoints: true,
        redeemedPoints: true,
      },
    })

    if (!profile) {
      return NextResponse.json({ error: 'Perfil de cliente no encontrado' }, { status: 404 })
    }

    const now = new Date()

    // Buscar recompensas activas y vigentes
    const activeRewards = await prisma.reward.findMany({
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

    // PrÃ³xima recompensa mÃ¡s cercana que aÃºn no alcanza
    let nextReward = activeRewards.find(
      (r) => r.pointsRequired > profile.availablePoints
    )

    // Si ya alcanza todas o ninguna es mayor, tomar la de mayor valor o la primera
    if (!nextReward && activeRewards.length > 0) {
      nextReward = activeRewards[activeRewards.length - 1]
    }

    const nextRewardData = nextReward
      ? {
          id: nextReward.id,
          name: nextReward.name,
          description: nextReward.description,
          imageUrl: nextReward.imageUrl,
          pointsRequired: nextReward.pointsRequired,
          missingPoints: Math.max(0, nextReward.pointsRequired - profile.availablePoints),
          progressPercent: Math.min(
            100,
            Math.round((profile.availablePoints / nextReward.pointsRequired) * 100)
          ),
          alreadyReached: profile.availablePoints >= nextReward.pointsRequired,
        }
      : null

    // Ãšltimos 5 movimientos de puntos
    const recentTransactions = await prisma.pointsTransaction.findMany({
      where: { customerId: profile.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
    })

    // Ãšltimos 5 viajes/servicios
    const recentServices = await prisma.transportService.findMany({
      where: { customerId: profile.id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true,
            icon: true,
          },
        },
      },
      orderBy: { serviceDate: 'desc' },
      take: 5,
    })

    return NextResponse.json({
      success: true,
      profile,
      nextReward: nextRewardData,
      recentTransactions,
      recentServices,
    })
  } catch (error) {
    console.error('Error al obtener dashboard de cliente:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor al cargar el dashboard' },
      { status: 500 }
    )
  }
}

