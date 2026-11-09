export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { Role } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/session'
import { createAuditLog } from '@/lib/audit'

const updateCategorySchema = z.object({
  name: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres').optional(),
  description: z.string().trim().optional().nullable(),
  color: z.string().trim().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, 'Color hexadecimal inválido').optional(),
  icon: z.string().trim().optional().nullable(),
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
    const validation = updateCategorySchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Datos inválidos',
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      )
    }

    const existing = await prisma.serviceCategory.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Categoría no encontrada' }, { status: 404 })
    }

    const data = validation.data

    if (data.name && data.name !== existing.name) {
      const nameTaken = await prisma.serviceCategory.findUnique({
        where: { name: data.name },
      })
      if (nameTaken) {
        return NextResponse.json({ error: 'Ya existe una categoría con este nombre' }, { status: 409 })
      }
    }

    const updatedCategory = await prisma.serviceCategory.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.color !== undefined && { color: data.color }),
        ...(data.icon !== undefined && { icon: data.icon }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    })

    await createAuditLog({
      userId: session.userId,
      action: 'UPDATE_CATEGORY',
      entityType: 'ServiceCategory',
      entityId: id,
      oldValues: {
        name: existing.name,
        color: existing.color,
        isActive: existing.isActive,
      },
      newValues: {
        name: updatedCategory.name,
        color: updatedCategory.color,
        isActive: updatedCategory.isActive,
      },
    })

    return NextResponse.json({
      message: 'Categoría actualizada exitosamente',
      category: updatedCategory,
    })
  } catch (error) {
    console.error('Error al actualizar categoría:', error)
    return NextResponse.json({ error: 'Error interno al actualizar la categoría' }, { status: 500 })
  }
}
