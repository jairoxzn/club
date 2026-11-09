export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { Role, ServiceStatus, TransactionType } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/session'

export async function GET() {
  try {
    const session = await requireAuth([Role.ADMIN])
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const now = new Date()
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1)

    // Consultas agregadas y contadores bÃ¡sicos
    const [
      totalCustomers,
      activeCustomers,
      totalServices,
      monthlyServices,
      pointsAggregates,
      pendingRedemptions,
      categories,
      servicesWithCategory,
      transactionsLast6Months,
      customerRegistrations,
      topCustomersList,
    ] = await Promise.all([
      // Total de clientes
      prisma.customerProfile.count(),

      // Clientes activos (User isActive = true)
      prisma.customerProfile.count({
        where: { user: { isActive: true } },
      }),

      // Total de servicios completados
      prisma.transportService.count({
        where: { status: ServiceStatus.COMPLETED },
      }),

      // Servicios del mes en curso
      prisma.transportService.count({
        where: {
          status: ServiceStatus.COMPLETED,
          serviceDate: { gte: startOfCurrentMonth },
        },
      }),

      // Puntos emitidos y canjeados
      prisma.customerProfile.aggregate({
        _sum: {
          totalPoints: true,
          redeemedPoints: true,
        },
      }),

      // Canjes pendientes
      prisma.redemptionRequest.count({
        where: { status: 'PENDING' },
      }),

      // Todas las categorÃ­as
      prisma.serviceCategory.findMany({
        select: { id: true, name: true },
      }),

      // Servicios agrupados por categorÃ­a para stats
      prisma.transportService.groupBy({
        by: ['categoryId'],
        where: { status: ServiceStatus.COMPLETED },
        _count: { _all: true },
        _sum: { amount: true },
      }),

      // Transacciones de puntos de los Ãºltimos 6 meses
      prisma.pointsTransaction.findMany({
        where: {
          createdAt: { gte: sixMonthsAgo },
          type: { in: [TransactionType.EARNED, TransactionType.REDEEMED] },
        },
        select: {
          type: true,
          amount: true,
          createdAt: true,
        },
      }),

      // Clientes registrados en los Ãºltimos 6 meses
      prisma.customerProfile.findMany({
        where: {
          createdAt: { gte: sixMonthsAgo },
        },
        select: {
          createdAt: true,
        },
      }),

      // Top 5 clientes con mÃ¡s puntos acumulados
      prisma.customerProfile.findMany({
        take: 5,
        orderBy: { totalPoints: 'desc' },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phone: true,
          customerCode: true,
          totalPoints: true,
          availablePoints: true,
          _count: {
            select: { services: true },
          },
        },
      }),
    ])

    // Estructurar servicios por categorÃ­a
    const categoryMap = new Map(categories.map((c) => [c.id, c.name]))
    const servicesByCategory = servicesWithCategory.map((item) => ({
      categoryId: item.categoryId,
      category: categoryMap.get(item.categoryId) || 'Otro',
      count: item._count._all,
      totalAmount: item._sum.amount ? Number(item._sum.amount) : 0,
    }))

    // Estructurar puntos por mes (Ãºltimos 6 meses)
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
    const last6MonthsBuckets: { [key: string]: { month: string; earned: number; redeemed: number; yearMonthKey: string } } = {}

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const label = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`
      last6MonthsBuckets[key] = {
        month: label,
        earned: 0,
        redeemed: 0,
        yearMonthKey: key,
      }
    }

    transactionsLast6Months.forEach((tx) => {
      const d = new Date(tx.createdAt)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      if (last6MonthsBuckets[key]) {
        if (tx.type === TransactionType.EARNED) {
          last6MonthsBuckets[key].earned += Math.abs(tx.amount)
        } else if (tx.type === TransactionType.REDEEMED) {
          last6MonthsBuckets[key].redeemed += Math.abs(tx.amount)
        }
      }
    })

    const pointsByMonth = Object.values(last6MonthsBuckets)

    // Estructurar registros de clientes por mes
    const registrationBuckets: { [key: string]: { month: string; count: number } } = {}
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const label = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`
      registrationBuckets[key] = { month: label, count: 0 }
    }

    customerRegistrations.forEach((cust) => {
      const d = new Date(cust.createdAt)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      if (registrationBuckets[key]) {
        registrationBuckets[key].count += 1
      }
    })

    const registrationsByMonth = Object.values(registrationBuckets)

    // Formatear topCustomers
    const topCustomers = topCustomersList.map((c) => ({
      id: c.id,
      name: `${c.firstName} ${c.lastName}`.trim(),
      phone: c.phone,
      customerCode: c.customerCode,
      totalPoints: c.totalPoints,
      availablePoints: c.availablePoints,
      servicesCount: c._count.services,
    }))

    return NextResponse.json({
      totalCustomers,
      activeCustomers,
      totalServices,
      monthlyServices,
      totalPointsIssued: pointsAggregates._sum.totalPoints || 0,
      totalPointsRedeemed: pointsAggregates._sum.redeemedPoints || 0,
      pendingRedemptions,
      servicesByCategory,
      pointsByMonth,
      topCustomers,
      registrationsByMonth,
    })
  } catch (error) {
    console.error('Error al obtener estadÃ­sticas de admin:', error)
    return NextResponse.json({ error: 'Error al obtener estadÃ­sticas del dashboard' }, { status: 500 })
  }
}

