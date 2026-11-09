export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAuth, Role } from '@/lib/session'
import { hashPin } from '@/lib/auth'
import { createAuditLog } from '@/lib/audit'

const resetPinSchema = z.object({
  pin: z.string().regex(/^\d{4,8}$/, 'El PIN debe ser numérico de 4 a 8 dígitos').optional().default('1234'),
})

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const session = await requireAuth([Role.ADMIN])
    if (!session) {
      return NextResponse.json({ error: 'No autorizado. Solo administradores pueden restablecer PINs' }, { status: 403 })
    }

    const { id } = await context.params
    const body = await request.json().catch(() => ({}))
    const validation = resetPinSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'PIN inválido. Debe contener entre 4 y 8 dígitos numéricos' },
        { status: 400 }
      )
    }

    const newPin = validation.data.pin || '1234'
    const customer = await prisma.customerProfile.findUnique({
      where: { id },
      include: { user: true },
    })

    if (!customer) {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })
    }

    const pinHash = await hashPin(newPin)

    await prisma.user.update({
      where: { id: customer.userId },
      data: {
        pinHash,
        failedLoginAttempts: 0,
        lockedUntil: null,
        isActive: true,
      },
    })

    await createAuditLog({
      userId: session.userId,
      action: 'RESET_CUSTOMER_PIN',
      entityType: 'CustomerProfile',
      entityId: customer.id,
      newValues: {
        customerId: customer.id,
        customerCode: customer.customerCode,
        customerPhone: customer.phone,
        newPinAssigned: newPin,
      },
    })

    return NextResponse.json({
      success: true,
      message: `El PIN de ${customer.firstName} ${customer.lastName} ha sido restablecido a: ${newPin}`,
      newPin,
    })
  } catch (error) {
    console.error('Error al restablecer PIN de cliente:', error)
    return NextResponse.json({ error: 'Error al restablecer el PIN del cliente' }, { status: 500 })
  }
}
