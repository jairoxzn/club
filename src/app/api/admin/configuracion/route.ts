export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { Role } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/session'
import { createAuditLog } from '@/lib/audit'

const updateConfigSchema = z.object({
  configs: z.array(
    z.object({
      key: z.string().trim().min(1, 'La clave es obligatoria'),
      value: z.string(),
      description: z.string().optional().nullable(),
    })
  ).or(z.record(z.string())),
})

// GET /api/admin/configuracion - Obtener configuraciones del sistema
export async function GET() {
  try {
    const session = await requireAuth([Role.ADMIN, Role.STAFF])
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const configs = await prisma.systemConfig.findMany({
      orderBy: { key: 'asc' },
      include: {
        updatedBy: {
          select: { id: true, username: true, email: true },
        },
      },
    })

    // TambiÃ©n retornar un mapa clave -> valor para facilitar consumo en frontend
    const configMap: Record<string, string> = {}
    configs.forEach((c) => {
      configMap[c.key] = c.value
    })

    return NextResponse.json({ configs, configMap })
  } catch (error) {
    console.error('Error al obtener configuraciones:', error)
    return NextResponse.json({ error: 'Error al consultar las configuraciones' }, { status: 500 })
  }
}

// PUT /api/admin/configuracion - Actualizar configuraciones del sistema
export async function PUT(request: Request) {
  try {
    const session = await requireAuth([Role.ADMIN])
    if (!session) {
      return NextResponse.json({ error: 'No autorizado. Se requiere rol de administrador' }, { status: 403 })
    }

    const body = await request.json()
    const validation = updateConfigSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Formato de configuraciÃ³n invÃ¡lido',
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      )
    }

    let itemsToUpdate: { key: string; value: string; description?: string | null }[] = []

    if (Array.isArray(body.configs)) {
      itemsToUpdate = body.configs
    } else if (body.configs && typeof body.configs === 'object') {
      itemsToUpdate = Object.entries(body.configs).map(([key, value]) => ({
        key,
        value: String(value),
      }))
    } else {
      // Si enviaron pares directamente en el cuerpo
      itemsToUpdate = Object.entries(body).map(([key, value]) => ({
        key,
        value: String(value),
      }))
    }

    const updatedConfigs = await prisma.$transaction(
      itemsToUpdate.map((item) =>
        prisma.systemConfig.upsert({
          where: { key: item.key },
          update: {
            value: item.value,
            ...(item.description !== undefined && { description: item.description }),
            updatedById: session.userId,
          },
          create: {
            key: item.key,
            value: item.value,
            description: item.description || null,
            updatedById: session.userId,
          },
        })
      )
    )

    await createAuditLog({
      userId: session.userId,
      action: 'UPDATE_SYSTEM_CONFIGS',
      entityType: 'SystemConfig',
      newValues: {
        updatedKeys: itemsToUpdate.map((i) => i.key),
      },
    })

    const configMap: Record<string, string> = {}
    updatedConfigs.forEach((c) => {
      configMap[c.key] = c.value
    })

    return NextResponse.json({
      message: 'Configuraciones actualizadas exitosamente',
      configs: updatedConfigs,
      configMap,
    })
  } catch (error) {
    console.error('Error al actualizar configuraciones:', error)
    return NextResponse.json({ error: 'Error interno al actualizar configuraciones' }, { status: 500 })
  }
}

