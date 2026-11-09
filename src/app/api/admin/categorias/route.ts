export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { Role } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/session'
import { createAuditLog } from '@/lib/audit'

const createCategorySchema = z.object({
  name: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres'),
  description: z.string().trim().optional().nullable(),
  color: z.string().trim().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, 'Color hexadecimal invÃ¡lido').optional().default('#3B82F6'),
  icon: z.string().trim().optional().nullable(),
  isActive: z.boolean().optional().default(true),
})

// GET /api/admin/categorias - Listar categorÃ­as con conteo de servicios
export async function GET() {
  try {
    const session = await requireAuth([Role.ADMIN, Role.STAFF])
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const categories = await prisma.serviceCategory.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { services: true, pointsRules: true },
        },
      },
    })

    return NextResponse.json({ categories })
  } catch (error) {
    console.error('Error al listar categorÃ­as:', error)
    return NextResponse.json({ error: 'Error al consultar categorÃ­as' }, { status: 500 })
  }
}

// POST /api/admin/categorias - Crear categorÃ­a
export async function POST(request: Request) {
  try {
    const session = await requireAuth([Role.ADMIN])
    if (!session) {
      return NextResponse.json({ error: 'No autorizado. Se requiere rol de administrador' }, { status: 403 })
    }

    const body = await request.json()
    const validation = createCategorySchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Datos invÃ¡lidos',
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      )
    }

    const { name, description, color, icon, isActive } = validation.data

    const existing = await prisma.serviceCategory.findUnique({
      where: { name },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Ya existe una categorÃ­a con este nombre' },
        { status: 409 }
      )
    }

    const category = await prisma.serviceCategory.create({
      data: {
        name,
        description: description || null,
        color: color || '#3B82F6',
        icon: icon || null,
        isActive: isActive !== undefined ? isActive : true,
      },
    })

    await createAuditLog({
      userId: session.userId,
      action: 'CREATE_CATEGORY',
      entityType: 'ServiceCategory',
      entityId: category.id,
      newValues: { name, color, isActive },
    })

    return NextResponse.json(
      { message: 'CategorÃ­a creada exitosamente', category },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error al crear categorÃ­a:', error)
    return NextResponse.json({ error: 'Error interno al crear categorÃ­a' }, { status: 500 })
  }
}

