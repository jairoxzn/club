export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { Role } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/session'

const searchCustomerSchema = z.object({
  qrToken: z.string().trim().optional(),
  customerCode: z.string().trim().optional(),
  phone: z.string().trim().optional(),
}).refine(
  (data) => data.qrToken || data.customerCode || data.phone,
  'Debe proporcionar al menos un criterio de bÃºsqueda (qrToken, customerCode o phone)'
)

export async function POST(request: Request) {
  try {
    const session = await requireAuth([Role.ADMIN, Role.STAFF])
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const validation = searchCustomerSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'ParÃ¡metros de bÃºsqueda invÃ¡lidos',
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      )
    }

    const { qrToken, customerCode, phone } = validation.data

    const whereOr: any[] = []
    if (qrToken) whereOr.push({ qrToken })
    if (customerCode) whereOr.push({ customerCode: customerCode.toUpperCase() })
    if (phone) whereOr.push({ phone })

    const customer = await prisma.customerProfile.findFirst({
      where: {
        OR: whereOr,
      },
      include: {
        user: {
          select: {
            id: true,
            isActive: true,
            role: true,
          },
        },
        _count: {
          select: {
            services: true,
            redemptions: true,
          },
        },
      },
    })

    if (!customer) {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })
    }

    const isBlocked = !customer.user.isActive
    const isEligible = !isBlocked

    return NextResponse.json({
      customer: {
        id: customer.id,
        firstName: customer.firstName,
        lastName: customer.lastName,
        fullName: `${customer.firstName} ${customer.lastName}`.trim(),
        phone: customer.phone,
        email: customer.email,
        customerCode: customer.customerCode,
        qrToken: customer.qrToken,
        totalPoints: customer.totalPoints,
        availablePoints: customer.availablePoints,
        reservedPoints: customer.reservedPoints,
        redeemedPoints: customer.redeemedPoints,
        totalTrips: customer._count.services,
      },
      isBlocked,
      isEligible,
      warningMessage: isBlocked ? 'AtenciÃ³n: Este cliente se encuentra actualmente bloqueado/inactivo.' : null,
    })
  } catch (error) {
    console.error('Error al buscar cliente por QR/cÃ³digo:', error)
    return NextResponse.json({ error: 'Error al buscar cliente' }, { status: 500 })
  }
}

