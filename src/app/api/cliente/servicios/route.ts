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
      select: { id: true },
    })

    if (!profile) {
      return NextResponse.json({ error: 'Perfil de cliente no encontrado' }, { status: 404 })
    }

    const services = await prisma.transportService.findMany({
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
    })

    return NextResponse.json({
      success: true,
      services,
    })
  } catch (error) {
    console.error('Error al obtener servicios del cliente:', error)
    return NextResponse.json(
      { error: 'Error al obtener historial de servicios' },
      { status: 500 }
    )
  }
}

