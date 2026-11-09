import { prisma } from './prisma'
import { NotificationType } from '@prisma/client'

interface NotificationParams {
  userId: string
  title: string
  message: string
  type?: NotificationType
  relatedEntityType?: string
  relatedEntityId?: string
}

export async function createNotification(params: NotificationParams): Promise<void> {
  try {
    await prisma.notification.create({
      data: {
        userId: params.userId,
        title: params.title,
        message: params.message,
        type: params.type ?? NotificationType.INFO,
        relatedEntityType: params.relatedEntityType,
        relatedEntityId: params.relatedEntityId,
      },
    })
  } catch (error) {
    console.error('Error al crear notificación:', error)
  }
}

export async function getUnreadCount(userId: string): Promise<number> {
  return prisma.notification.count({
    where: { userId, isRead: false },
  })
}

export async function markAllAsRead(userId: string): Promise<void> {
  await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  })
}
