export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { Role, RoundingMode, Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/session'
import { createAuditLog } from '@/lib/audit'

const Decimal = Prisma.Decimal

const createRuleSchema = z.object({
  categoryId: z.string().uuid('ID de categorÃ­a invÃ¡lido'),
  pointsPerUnit: z.number().positive('Los puntos por unidad deben ser mayores a 0'),
  amountBase: z.number().positive('El monto base debe ser mayor a 0'),
  roundingMode: z.nativeEnum(RoundingMode).optional().default(RoundingMode.FLOOR),
  minEligibleAmount: z.number().min(0).optional().default(0),
  maxPointsPerService: z.number().int().positive().optional().nullable(),
  validFrom: z.string().optional().nullable(),
  validUntil: z.string().optional().nullable(),
  notes: z.string().trim().optional().nullable(),
  isActive: z.boolean().optional().default(true),
})

// GET /api/admin/reglas-puntos - Listar reglas de acumulaciÃ³n
export async function GET() {
  try {
    const session = await requireAuth([Role.ADMIN, Role.STAFF])
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const rules = await prisma.pointsRule.findMany({
      orderBy: { validFrom: 'desc' },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        _count: {
          select: { services: true },
        },
      },
    })

    return NextResponse.json({ rules })
  } catch (error) {
    console.error('Error al consultar reglas de puntos:', error)
    return NextResponse.json({ error: 'Error interno al consultar las reglas' }, { status: 500 })
  }
}

// POST /api/admin/reglas-puntos - Crear regla
export async function POST(request: Request) {
  try {
    const session = await requireAuth([Role.ADMIN])
    if (!session) {
      return NextResponse.json({ error: 'No autorizado. Se requiere rol de administrador' }, { status: 403 })
    }

    const body = await request.json()
    const validation = createRuleSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Datos invÃ¡lidos',
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      )
    }

    const data = validation.data

    const category = await prisma.serviceCategory.findUnique({
      where: { id: data.categoryId },
    })

    if (!category) {
      return NextResponse.json({ error: 'La categorÃ­a especificada no existe' }, { status: 404 })
    }

    // Si se crea como activa, opcionalmente desactivar reglas previas de esa categorÃ­a si no tienen validUntil
    const rule = await prisma.pointsRule.create({
      data: {
        categoryId: data.categoryId,
        pointsPerUnit: new Decimal(data.pointsPerUnit),
        amountBase: new Decimal(data.amountBase),
        roundingMode: data.roundingMode,
        minEligibleAmount: new Decimal(data.minEligibleAmount),
        maxPointsPerService: data.maxPointsPerService ?? null,
        validFrom: data.validFrom ? new Date(data.validFrom) : new Date(),
        validUntil: data.validUntil ? new Date(data.validUntil) : null,
        notes: data.notes ?? null,
        isActive: data.isActive,
        createdById: session.userId,
      },
      include: {
        category: true,
      },
    })

    await createAuditLog({
      userId: session.userId,
      action: 'CREATE_POINTS_RULE',
      entityType: 'PointsRule',
      entityId: rule.id,
      newValues: {
        categoryId: data.categoryId,
        pointsPerUnit: data.pointsPerUnit,
        amountBase: data.amountBase,
        roundingMode: data.roundingMode,
      },
    })

    return NextResponse.json(
      { message: 'Regla de acumulaciÃ³n creada exitosamente', rule },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error al crear regla de puntos:', error)
    return NextResponse.json({ error: 'Error interno al crear la regla de puntos' }, { status: 500 })
  }
}

