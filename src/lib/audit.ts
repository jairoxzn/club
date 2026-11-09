import { prisma } from './prisma'

interface AuditParams {
  userId: string
  action: string
  entityType: string
  entityId?: string
  oldValues?: object
  newValues?: object
  ipAddress?: string
  userAgent?: string
}

export async function createAuditLog(params: AuditParams): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        oldValues: params.oldValues ? (params.oldValues as any) : undefined,
        newValues: params.newValues ? (params.newValues as any) : undefined,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      },
    })
  } catch (error) {
    // No interrumpir el flujo principal por errores de auditoría
    console.error('Error al crear log de auditoría:', error)
  }
}
