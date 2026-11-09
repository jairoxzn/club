export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { Role } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/session'
import { createAuditLog } from '@/lib/audit'

const createRewardSchema = z.object({
  name: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres'),
  description: z.string().trim().optional().nullable(),
  imageUrl: z.string().url('URL de imagen invÃ¡lida').optional().nullable().or(z.literal('')),
  pointsRequired: z.number().int().positive('Los puntos requeridos deben ser mayores a 0'),
  stock: z.number().int().min(0, 'El stock no puede ser negativo').optional().nullable(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  conditions: z.string().trim().optional().nullable(),
  isActive: z.boolean().optional().default(true),
})

// GET /api/admin/recompensas - Listar recompensas (incluyendo inactivas, excluyendo eliminadas)
export async function GET() {
  try {
    const session = await requireAuth([Role.ADMIN, Role.STAFF])
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const rewards = await prisma.reward.findMany({
      where: { isDeleted: false },
      orderBy: { pointsRequired: 'asc' },
      include: {
        createdBy: {
          select: { id: true, username: true, email: true },
        },
        _count: {
          select: { redemptions: true },
        },
      },
    })

    return NextResponse.json({ rewards })
  } catch (error) {
    console.error('Error al listar recompensas:', error)
    return NextResponse.json({ error: 'Error al consultar catÃ¡logo de recompensas' }, { status: 500 })
  }
}

// POST /api/admin/recompensas - Crear recompensa
export async function POST(request: Request) {
  try {
    const session = await requireAuth([Role.ADMIN])
    if (!session) {
      return NextResponse.json({ error: 'No autorizado. Se requiere rol de administrador' }, { status: 403 })
    }

    const body = await request.json()
    const validation = createRewardSchema.safeParse(body)

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
    const normalizedImageUrl = data.imageUrl && data.imageUrl.trim() !== '' ? data.imageUrl.trim() : null

    const reward = await prisma.reward.create({
      data: {
        name: data.name,
        description: data.description || null,
        imageUrl: normalizedImageUrl,
        pointsRequired: data.pointsRequired,
        stock: data.stock !== undefined ? data.stock : null,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        conditions: data.conditions || null,
        isActive: data.isActive,
        createdById: session.userId,
      },
    })

    await createAuditLog({
      userId: session.userId,
      action: 'CREATE_REWARD',
      entityType: 'Reward',
      entityId: reward.id,
      newValues: {
        name: reward.name,
        pointsRequired: reward.pointsRequired,
        stock: reward.stock,
      },
    })

    return NextResponse.json(
      { message: 'Recompensa creada exitosamente', reward },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error al crear recompensa:', error)
    return NextResponse.json({ error: 'Error interno al crear la recompensa' }, { status: 500 })
  }
}

