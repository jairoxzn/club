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
        totalPoints: true,
        reservedPoints: true,
        redeemedPoints: true,
      },
    })

    if (!profile) {
      return NextResponse.json({ error: 'Perfil de cliente no encontrado' }, { status: 404 })
    }

    const transactions = await prisma.pointsTransaction.findMany({
      where: { customerId: profile.id },
      include: {
        service: {
          select: {
            id: true,
            amount: true,
            serviceDate: true,
            referenceNumber: true,
            category: {
              select: {
                id: true,
                name: true,
                color: true,
              },
            },
          },
        },
        redemption: {
          select: {
            id: true,
            status: true,
            reward: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      success: true,
      points: {
        available: profile.availablePoints,
        total: profile.totalPoints,
        reserved: profile.reservedPoints,
        redeemed: profile.redeemedPoints,
      },
      transactions,
    })
  } catch (error) {
    console.error('Error al obtener puntos del cliente:', error)
    return NextResponse.json(
      { error: 'Error al obtener desglose e historial de puntos' },
      { status: 500 }
    )
  }
}

