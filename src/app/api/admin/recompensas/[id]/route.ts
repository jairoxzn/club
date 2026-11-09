export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { Role } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/session'
import { createAuditLog } from '@/lib/audit'

const updateRewardSchema = z.object({
  name: z.string().trim().min(2).optional(),
  description: z.string().trim().optional().nullable(),
  imageUrl: z.string().url().optional().nullable().or(z.literal('')),
  pointsRequired: z.number().int().positive().optional(),
  stock: z.number().int().min(0).optional().nullable(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  conditions: z.string().trim().optional().nullable(),
  isActive: z.boolean().optional(),
})

interface RouteContext {
  params: Promise<{ id: string }>
}

// PUT /api/admin/recompensas/[id] - Actualizar recompensa
export async function PUT(request: Request, context: RouteContext) {
  try {
    const session = await requireAuth([Role.ADMIN])
    if (!session) {
      return NextResponse.json({ error: 'No autorizado. Se requiere rol de administrador' }, { status: 403 })
    }

    const { id } = await context.params
    const body = await request.json()
    const validation = updateRewardSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Datos inválidos',
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      )
    }

    const existing = await prisma.reward.findUnique({
      where: { id },
    })

    if (!existing || existing.isDeleted) {
      return NextResponse.json({ error: 'Recompensa no encontrada' }, { status: 404 })
    }

    const data = validation.data
    const updateData: any = {}

    if (data.name !== undefined) updateData.name = data.name
    if (data.description !== undefined) updateData.description = data.description
    if (data.imageUrl !== undefined) {
      updateData.imageUrl = data.imageUrl === '' ? null : data.imageUrl
    }
    if (data.pointsRequired !== undefined) updateData.pointsRequired = data.pointsRequired
    if (data.stock !== undefined) updateData.stock = data.stock
    if (data.startDate !== undefined) updateData.startDate = data.startDate ? new Date(data.startDate) : null
    if (data.endDate !== undefined) updateData.endDate = data.endDate ? new Date(data.endDate) : null
    if (data.conditions !== undefined) updateData.conditions = data.conditions
    if (data.isActive !== undefined) updateData.isActive = data.isActive

    const updatedReward = await prisma.reward.update({
      where: { id },
      data: updateData,
    })

    await createAuditLog({
      userId: session.userId,
      action: 'UPDATE_REWARD',
      entityType: 'Reward',
      entityId: id,
      oldValues: {
        name: existing.name,
        pointsRequired: existing.pointsRequired,
        stock: existing.stock,
        isActive: existing.isActive,
      },
      newValues: {
        name: updatedReward.name,
        pointsRequired: updatedReward.pointsRequired,
        stock: updatedReward.stock,
        isActive: updatedReward.isActive,
      },
    })

    return NextResponse.json({
      message: 'Recompensa actualizada exitosamente',
      reward: updatedReward,
    })
  } catch (error) {
    console.error('Error al actualizar recompensa:', error)
    return NextResponse.json({ error: 'Error interno al actualizar recompensa' }, { status: 500 })
  }
}

// DELETE /api/admin/recompensas/[id] - Soft delete
export async function DELETE(request: Request, context: RouteContext) {
  try {
    const session = await requireAuth([Role.ADMIN])
    if (!session) {
      return NextResponse.json({ error: 'No autorizado. Se requiere rol de administrador' }, { status: 403 })
    }

    const { id } = await context.params

    const existing = await prisma.reward.findUnique({
      where: { id },
    })

    if (!existing || existing.isDeleted) {
      return NextResponse.json({ error: 'Recompensa no encontrada' }, { status: 404 })
    }

    await prisma.reward.update({
      where: { id },
      data: {
        isDeleted: true,
        isActive: false,
      },
    })

    await createAuditLog({
      userId: session.userId,
      action: 'DELETE_REWARD',
      entityType: 'Reward',
      entityId: id,
      oldValues: { name: existing.name, isDeleted: false },
      newValues: { isDeleted: true },
    })

    return NextResponse.json({
      message: 'Recompensa eliminada exitosamente',
    })
  } catch (error) {
    console.error('Error al eliminar recompensa:', error)
    return NextResponse.json({ error: 'Error interno al eliminar recompensa' }, { status: 500 })
  }
}
