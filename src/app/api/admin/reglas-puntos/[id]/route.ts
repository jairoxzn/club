export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { Role, RoundingMode, Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/session'
import { createAuditLog } from '@/lib/audit'

const Decimal = Prisma.Decimal

const updateRuleSchema = z.object({
  pointsPerUnit: z.number().positive().optional(),
  amountBase: z.number().positive().optional(),
  roundingMode: z.nativeEnum(RoundingMode).optional(),
  minEligibleAmount: z.number().min(0).optional(),
  maxPointsPerService: z.number().int().positive().optional().nullable(),
  validFrom: z.string().optional().nullable(),
  validUntil: z.string().optional().nullable(),
  notes: z.string().trim().optional().nullable(),
  isActive: z.boolean().optional(),
})

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const session = await requireAuth([Role.ADMIN])
    if (!session) {
      return NextResponse.json({ error: 'No autorizado. Se requiere rol de administrador' }, { status: 403 })
    }

    const { id } = await context.params
    const body = await request.json()
    const validation = updateRuleSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Datos inválidos',
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      )
    }

    const existing = await prisma.pointsRule.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Regla no encontrada' }, { status: 404 })
    }

    const data = validation.data
    const updateData: any = {}

    if (data.pointsPerUnit !== undefined) updateData.pointsPerUnit = new Decimal(data.pointsPerUnit)
    if (data.amountBase !== undefined) updateData.amountBase = new Decimal(data.amountBase)
    if (data.roundingMode !== undefined) updateData.roundingMode = data.roundingMode
    if (data.minEligibleAmount !== undefined) updateData.minEligibleAmount = new Decimal(data.minEligibleAmount)
    if (data.maxPointsPerService !== undefined) updateData.maxPointsPerService = data.maxPointsPerService
    if (data.validFrom !== undefined) updateData.validFrom = data.validFrom ? new Date(data.validFrom) : existing.validFrom
    if (data.validUntil !== undefined) updateData.validUntil = data.validUntil ? new Date(data.validUntil) : null
    if (data.notes !== undefined) updateData.notes = data.notes
    if (data.isActive !== undefined) updateData.isActive = data.isActive

    const updated = await prisma.pointsRule.update({
      where: { id },
      data: updateData,
      include: { category: true },
    })

    await createAuditLog({
      userId: session.userId,
      action: 'UPDATE_POINTS_RULE',
      entityType: 'PointsRule',
      entityId: id,
      oldValues: {
        pointsPerUnit: existing.pointsPerUnit.toString(),
        amountBase: existing.amountBase.toString(),
        isActive: existing.isActive,
      },
      newValues: {
        pointsPerUnit: updated.pointsPerUnit.toString(),
        amountBase: updated.amountBase.toString(),
        isActive: updated.isActive,
      },
    })

    return NextResponse.json({
      message: 'Regla actualizada exitosamente',
      rule: updated,
    })
  } catch (error) {
    console.error('Error al actualizar regla:', error)
    return NextResponse.json({ error: 'Error interno al actualizar la regla' }, { status: 500 })
  }
}
