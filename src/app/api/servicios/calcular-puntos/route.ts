export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { Role } from '@prisma/client'
import { requireAuth } from '@/lib/session'
import { calculatePoints } from '@/lib/points'

const calculatePointsSchema = z.object({
  categoryId: z.string().uuid('ID de categorÃ­a invÃ¡lido'),
  amount: z.number().positive('El monto debe ser mayor a 0'),
})

export async function POST(request: Request) {
  try {
    const session = await requireAuth([Role.ADMIN, Role.STAFF])
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const validation = calculatePointsSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Datos invÃ¡lidos',
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      )
    }

    const { categoryId, amount } = validation.data
    const calculation = await calculatePoints(categoryId, amount)

    return NextResponse.json({
      points: calculation?.points ?? 0,
      ruleApplied: calculation ? true : false,
      ruleSnapshot: calculation?.ruleSnapshot ?? null,
    })
  } catch (error) {
    console.error('Error al calcular puntos:', error)
    return NextResponse.json({ error: 'Error al calcular puntos del servicio' }, { status: 500 })
  }
}

