import { prisma } from './prisma'

export const TransactionType = {
  EARNED: 'EARNED',
  REDEEMED: 'REDEEMED',
  ADJUSTMENT_POS: 'ADJUSTMENT_POS',
  ADJUSTMENT_NEG: 'ADJUSTMENT_NEG',
  RESERVED: 'RESERVED',
  RELEASED: 'RELEASED',
  EXPIRED: 'EXPIRED',
  REVERSAL: 'REVERSAL',
} as const
export type TransactionType = (typeof TransactionType)[keyof typeof TransactionType]

export const ServiceStatus = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const
export type ServiceStatus = (typeof ServiceStatus)[keyof typeof ServiceStatus]

export const RoundingMode = {
  FLOOR: 'FLOOR',
  ROUND: 'ROUND',
  CEIL: 'CEIL',
} as const
export type RoundingMode = (typeof RoundingMode)[keyof typeof RoundingMode]

export interface PointsCalculation {
  points: number
  ruleId: string
  ruleSnapshot: object
}

// Calcula los puntos para un monto y categoría dados
export async function calculatePoints(
  categoryId: string,
  amount: number
): Promise<PointsCalculation | null> {
  const now = new Date()
  
  const rule = await prisma.pointsRule.findFirst({
    where: {
      categoryId,
      isActive: true,
      validFrom: { lte: now },
      OR: [
        { validUntil: null },
        { validUntil: { gte: now } },
      ],
    },
    orderBy: { validFrom: 'desc' },
  })

  if (!rule) return null

  const amountNum = Number(amount)
  const minEligible = Number(rule.minEligibleAmount)

  if (amountNum < minEligible) return null

  const amountBase = Number(rule.amountBase)
  const pointsPerUnit = Number(rule.pointsPerUnit)
  
  const units = amountNum / amountBase
  let points: number

  switch (rule.roundingMode) {
    case RoundingMode.CEIL:
      points = Math.ceil(Math.ceil(units) * pointsPerUnit)
      break
    case RoundingMode.ROUND:
      points = Math.round(Math.round(units) * pointsPerUnit)
      break
    case RoundingMode.FLOOR:
    default:
      points = Math.floor(Math.floor(units) * pointsPerUnit)
      break
  }

  if (rule.maxPointsPerService !== null) {
    points = Math.min(points, rule.maxPointsPerService)
  }

  const ruleSnapshot = {
    id: rule.id,
    pointsPerUnit: rule.pointsPerUnit.toString(),
    amountBase: rule.amountBase.toString(),
    roundingMode: rule.roundingMode,
    minEligibleAmount: rule.minEligibleAmount.toString(),
    maxPointsPerService: rule.maxPointsPerService,
    appliedAt: now.toISOString(),
  }

  return { points, ruleId: rule.id, ruleSnapshot }
}

// Acredita puntos por servicio completado - operación atómica
export async function awardPointsForService(
  serviceId: string,
  performedById: string
): Promise<{ success: boolean; points: number; error?: string }> {
  return prisma.$transaction(async (tx: any) => {
    // Obtener el servicio con lock
    const service = await tx.transportService.findUnique({
      where: { id: serviceId },
      include: { customer: true },
    })

    if (!service) {
      throw new Error('Servicio no encontrado')
    }

    if (service.status !== ServiceStatus.COMPLETED) {
      throw new Error('Solo se acreditan puntos a servicios completados')
    }

    if (service.isPointsProcessed) {
      throw new Error('Los puntos ya fueron acreditados para este servicio')
    }

    const points = service.pointsAwarded
    if (points <= 0) {
      // Marcar como procesado sin movimiento
      await tx.transportService.update({
        where: { id: serviceId },
        data: { isPointsProcessed: true },
      })
      return { success: true, points: 0 }
    }

    const customer = service.customer
    const balanceBefore = customer.availablePoints
    const balanceAfter = balanceBefore + points

    // Actualizar puntos del cliente
    await tx.customerProfile.update({
      where: { id: customer.id },
      data: {
        totalPoints: { increment: points },
        availablePoints: { increment: points },
      },
    })

    // Registrar transacción
    await tx.pointsTransaction.create({
      data: {
        customerId: customer.id,
        type: TransactionType.EARNED,
        amount: points,
        balanceBefore,
        balanceAfter,
        description: `Puntos ganados por servicio de transporte`,
        serviceId,
        performedById: performedById || service.staffId || customer.userId,
      },
    })

    // Marcar servicio como procesado
    await tx.transportService.update({
      where: { id: serviceId },
      data: { isPointsProcessed: true },
    })

    return { success: true, points }
  })
}

// Reserva puntos para una solicitud de canje (operación atómica)
export async function reservePointsForRedemption(
  customerId: string,
  redemptionId: string,
  points: number,
  performedById: string
): Promise<{ success: boolean; error?: string }> {
  return prisma.$transaction(async (tx: any) => {
    const customer = await tx.customerProfile.findUnique({
      where: { id: customerId },
    })

    if (!customer) throw new Error('Cliente no encontrado')
    if (customer.availablePoints < points) {
      throw new Error('Puntos insuficientes')
    }

    const balanceBefore = customer.availablePoints
    const balanceAfter = balanceBefore - points

    await tx.customerProfile.update({
      where: { id: customerId },
      data: {
        availablePoints: { decrement: points },
        reservedPoints: { increment: points },
      },
    })

    await tx.pointsTransaction.create({
      data: {
        customerId,
        type: TransactionType.RESERVED,
        amount: -points,
        balanceBefore,
        balanceAfter,
        description: 'Puntos reservados para solicitud de canje',
        redemptionId,
        performedById,
      },
    })

    return { success: true }
  })
}

// Libera puntos reservados (al rechazar o cancelar canje)
export async function releaseReservedPoints(
  customerId: string,
  redemptionId: string,
  points: number,
  performedById: string
): Promise<{ success: boolean; error?: string }> {
  return prisma.$transaction(async (tx: any) => {
    const customer = await tx.customerProfile.findUnique({
      where: { id: customerId },
    })

    if (!customer) throw new Error('Cliente no encontrado')

    const balanceBefore = customer.availablePoints
    const balanceAfter = balanceBefore + points

    await tx.customerProfile.update({
      where: { id: customerId },
      data: {
        availablePoints: { increment: points },
        reservedPoints: { decrement: points },
      },
    })

    await tx.pointsTransaction.create({
      data: {
        customerId,
        type: TransactionType.RELEASED,
        amount: points,
        balanceBefore,
        balanceAfter,
        description: 'Puntos liberados por rechazo o cancelación de canje',
        redemptionId,
        performedById,
      },
    })

    return { success: true }
  })
}

// Confirma canje (descuenta definitivamente los puntos reservados)
export async function confirmRedemption(
  customerId: string,
  redemptionId: string,
  points: number,
  performedById: string
): Promise<{ success: boolean; error?: string }> {
  return prisma.$transaction(async (tx: any) => {
    const customer = await tx.customerProfile.findUnique({
      where: { id: customerId },
    })

    if (!customer) throw new Error('Cliente no encontrado')

    // Los puntos ya están en reservedPoints, solo los movemos a redeemedPoints
    await tx.customerProfile.update({
      where: { id: customerId },
      data: {
        reservedPoints: { decrement: points },
        redeemedPoints: { increment: points },
      },
    })

    const balanceBefore = customer.availablePoints // Ya estaban descontados de available
    const balanceAfter = balanceBefore

    await tx.pointsTransaction.create({
      data: {
        customerId,
        type: TransactionType.REDEEMED,
        amount: -points,
        balanceBefore,
        balanceAfter,
        description: 'Puntos canjeados por recompensa',
        redemptionId,
        performedById,
      },
    })

    return { success: true }
  })
}

// Ajuste manual de puntos (admin)
export async function adjustPoints(
  customerId: string,
  amount: number, // Positivo o negativo
  description: string,
  performedById: string
): Promise<{ success: boolean; error?: string }> {
  return prisma.$transaction(async (tx: any) => {
    const customer = await tx.customerProfile.findUnique({
      where: { id: customerId },
    })

    if (!customer) throw new Error('Cliente no encontrado')

    const isPositive = amount > 0
    const absAmount = Math.abs(amount)

    if (!isPositive && customer.availablePoints < absAmount) {
      throw new Error('Puntos insuficientes para ajuste negativo')
    }

    const balanceBefore = customer.availablePoints
    const balanceAfter = balanceBefore + amount

    await tx.customerProfile.update({
      where: { id: customerId },
      data: {
        availablePoints: { increment: amount },
        totalPoints: isPositive ? { increment: amount } : undefined,
      },
    })

    await tx.pointsTransaction.create({
      data: {
        customerId,
        type: isPositive ? TransactionType.ADJUSTMENT_POS : TransactionType.ADJUSTMENT_NEG,
        amount,
        balanceBefore,
        balanceAfter,
        description,
        performedById,
      },
    })

    return { success: true }
  })
}
