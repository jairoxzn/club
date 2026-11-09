export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { Role, ServiceStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/session'
import { calculatePoints, awardPointsForService } from '@/lib/points'
import { createAuditLog } from '@/lib/audit'
import { createNotification } from '@/lib/notifications'

const createServiceSchema = z.object({
  customerId: z.string().uuid('ID de cliente invÃ¡lido'),
  categoryId: z.string().uuid('ID de categorÃ­a invÃ¡lido'),
  amount: z.number().positive('El monto debe ser mayor a 0'),
  serviceDate: z.string().optional().nullable(),
  referenceNumber: z.string().trim().optional().nullable(),
  notes: z.string().trim().optional().nullable(),
})

// GET /api/servicios - Listado de servicios con filtros
export async function GET(request: Request) {
  try {
    const session = await requireAuth([Role.ADMIN, Role.STAFF])
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const categoryId = searchParams.get('categoryId')
    const customerId = searchParams.get('customerId')
    const search = searchParams.get('search')?.trim()
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)))
    const skip = (page - 1) * limit

    const where: any = {}

    if (categoryId) {
      where.categoryId = categoryId
    }

    if (customerId) {
      where.customerId = customerId
    }

    if (startDate || endDate) {
      where.serviceDate = {}
      if (startDate) {
        where.serviceDate.gte = new Date(startDate)
      }
      if (endDate) {
        // Fin del dÃ­a si es fecha simple
        const end = new Date(endDate)
        end.setHours(23, 59, 59, 999)
        where.serviceDate.lte = end
      }
    }

    if (search) {
      where.OR = [
        { referenceNumber: { contains: search, mode: 'insensitive' } },
        { customer: { firstName: { contains: search, mode: 'insensitive' } } },
        { customer: { lastName: { contains: search, mode: 'insensitive' } } },
        { customer: { phone: { contains: search } } },
        { customer: { customerCode: { contains: search, mode: 'insensitive' } } },
      ]
    }

    const [total, services] = await Promise.all([
      prisma.transportService.count({ where }),
      prisma.transportService.findMany({
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
            },
          },
          category: {
            select: {
              id: true,
              name: true,
              color: true,
              icon: true,
            },
          },
          staff: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
        },
        orderBy: { serviceDate: 'desc' },
        skip,
        take: limit,
      }),
    ])

    return NextResponse.json({
      services,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error al listar servicios:', error)
    return NextResponse.json({ error: 'Error interno al consultar servicios' }, { status: 500 })
  }
}

// POST /api/servicios - Registrar nuevo servicio y acreditar puntos
export async function POST(request: Request) {
  try {
    const session = await requireAuth([Role.ADMIN, Role.STAFF])
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const validation = createServiceSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Datos del servicio invÃ¡lidos',
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      )
    }

    const { customerId, categoryId, amount, serviceDate, referenceNumber, notes } = validation.data

    // Verificar cliente
    const customer = await prisma.customerProfile.findUnique({
      where: { id: customerId },
      include: { user: true },
    })

    if (!customer) {
      return NextResponse.json({ error: 'El cliente seleccionado no existe' }, { status: 404 })
    }

    if (!customer.user.isActive) {
      return NextResponse.json(
        { error: 'El cliente se encuentra suspendido/bloqueado. No se pueden registrar servicios' },
        { status: 400 }
      )
    }

    // Verificar categorÃ­a
    const category = await prisma.serviceCategory.findUnique({
      where: { id: categoryId },
    })

    if (!category || !category.isActive) {
      return NextResponse.json({ error: 'La categorÃ­a seleccionada no existe o estÃ¡ inactiva' }, { status: 400 })
    }

    // Calcular puntos
    const pointsCalc = await calculatePoints(categoryId, amount)
    const pointsAwarded = pointsCalc?.points ?? 0

    // Crear el servicio
    const service = await prisma.transportService.create({
      data: {
        customerId,
        categoryId,
        staffId: session.userId,
        amount,
        serviceDate: serviceDate ? new Date(serviceDate) : new Date(),
        referenceNumber: referenceNumber || null,
        notes: notes || null,
        status: ServiceStatus.COMPLETED,
        pointsAwarded,
        pointsRuleId: pointsCalc?.ruleId ?? null,
        pointsRuleSnapshot: pointsCalc?.ruleSnapshot ?? undefined,
        isPointsProcessed: false,
      },
      include: {
        customer: true,
        category: true,
      },
    })

    // Acreditar puntos atÃ³micamente si hay puntos calculados o marcar procesado
    let awardResult = { success: true, points: 0 }
    try {
      awardResult = await awardPointsForService(service.id, session.userId)
    } catch (err: any) {
      console.error('Error al acreditar puntos para el servicio:', err)
      // Aunque falle la acreditaciÃ³n, el servicio quedÃ³ registrado; podemos reportar el detalle
      return NextResponse.json(
        {
          warning: 'Servicio registrado pero ocurriÃ³ un error al acreditar puntos: ' + err.message,
          service,
          pointsAwarded: 0,
        },
        { status: 201 }
      )
    }

    // Notificar al cliente si ganÃ³ puntos
    if (awardResult.points > 0) {
      await createNotification({
        userId: customer.userId,
        title: 'Â¡Puntos ganados por tu viaje!',
        message: `Has acumulado ${awardResult.points} puntos por tu viaje en ${category.name} (Monto: S/ ${amount.toFixed(2)}).`,
        type: 'SUCCESS',
        relatedEntityType: 'TransportService',
        relatedEntityId: service.id,
      })
    }

    // Registrar log de auditorÃ­a
    await createAuditLog({
      userId: session.userId,
      action: 'CREATE_TRANSPORT_SERVICE',
      entityType: 'TransportService',
      entityId: service.id,
      newValues: {
        customerId,
        categoryId,
        amount,
        pointsAwarded: awardResult.points,
        referenceNumber,
      },
    })

    return NextResponse.json(
      {
        message: 'Servicio registrado exitosamente',
        service,
        pointsAwarded: awardResult.points,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error al registrar servicio:', error)
    return NextResponse.json({ error: 'Error interno al registrar el servicio' }, { status: 500 })
  }
}

