export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { Role, RedemptionStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/session'

// GET /api/admin/canjes - Listar solicitudes de canje con filtros
export async function GET(request: Request) {
  try {
    const session = await requireAuth([Role.ADMIN, Role.STAFF])
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') as RedemptionStatus | null
    const search = searchParams.get('search')?.trim()
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)))
    const skip = (page - 1) * limit

    const where: any = {}

    if (status && Object.values(RedemptionStatus).includes(status)) {
      where.status = status
    }

    if (search) {
      where.OR = [
        { validationCode: { contains: search, mode: 'insensitive' } },
        { customer: { firstName: { contains: search, mode: 'insensitive' } } },
        { customer: { lastName: { contains: search, mode: 'insensitive' } } },
        { customer: { phone: { contains: search } } },
        { customer: { customerCode: { contains: search, mode: 'insensitive' } } },
        { reward: { name: { contains: search, mode: 'insensitive' } } },
      ]
    }

    const [total, redemptions] = await Promise.all([
      prisma.redemptionRequest.count({ where }),
      prisma.redemptionRequest.findMany({
        where,
        include: {
          customer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phone: true,
              customerCode: true,
              availablePoints: true,
              reservedPoints: true,
            },
          },
          reward: true,
          reviewedBy: {
            select: { id: true, username: true, email: true },
          },
          validatedBy: {
            select: { id: true, username: true, email: true },
          },
        },
        orderBy: { requestedAt: 'desc' },
        skip,
        take: limit,
      }),
    ])

    return NextResponse.json({
      redemptions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error al listar canjes:', error)
    return NextResponse.json({ error: 'Error interno al consultar solicitudes de canje' }, { status: 500 })
  }
}

