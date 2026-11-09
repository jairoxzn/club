export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

export async function GET() {
  try {
    const session = await getSession()

    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        email: true,
        username: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        lastLoginAt: true,
        customerProfile: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            email: true,
            birthDate: true,
            customerCode: true,
            qrToken: true,
            totalPoints: true,
            availablePoints: true,
            reservedPoints: true,
            redeemedPoints: true,
            acceptedTerms: true,
            acceptedDataProcessing: true,
            acceptedPromotions: true,
          },
        },
      },
    })

    if (!user || !user.isActive) {
      session.destroy()
      return NextResponse.json(
        { error: 'Usuario no encontrado o inactivo' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      user,
    })
  } catch (error) {
    console.error('Error al obtener perfil actual:', error)
    return NextResponse.json(
      { error: 'OcurriÃ³ un error al obtener la informaciÃ³n del usuario' },
      { status: 500 }
    )
  }
}

