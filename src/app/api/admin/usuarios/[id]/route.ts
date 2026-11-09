export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { Role } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/session'
import { hashPassword } from '@/lib/auth'
import { createAuditLog } from '@/lib/audit'

const updateWorkerSchema = z.object({
  email: z.string().email('Correo electrónico inválido').optional(),
  username: z.string().trim().min(3).optional(),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres').optional().or(z.literal('')),
  role: z.enum([Role.ADMIN, Role.STAFF]).optional(),
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
    const validation = updateWorkerSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Datos inválidos',
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      )
    }

    const existing = await prisma.user.findUnique({
      where: { id },
    })

    if (!existing || existing.role === Role.CUSTOMER) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    const data = validation.data

    // Evitar que el admin actual se desactive o cambie su propio rol
    if (session.userId === id) {
      if (data.isActive === false) {
        return NextResponse.json({ error: 'No puedes desactivar tu propia cuenta' }, { status: 400 })
      }
      if (data.role && data.role !== Role.ADMIN) {
        return NextResponse.json({ error: 'No puedes degradar tu propio rol' }, { status: 400 })
      }
    }

    const updateData: any = {}

    if (data.email) {
      const normalizedEmail = data.email.toLowerCase().trim()
      if (normalizedEmail !== existing.email) {
        const taken = await prisma.user.findFirst({
          where: { email: normalizedEmail, id: { not: id } },
        })
        if (taken) {
          return NextResponse.json({ error: 'El correo electrónico ya está en uso' }, { status: 409 })
        }
        updateData.email = normalizedEmail
      }
    }

    if (data.username) {
      const normalizedUsername = data.username.toLowerCase().trim()
      if (normalizedUsername !== existing.username) {
        const taken = await prisma.user.findFirst({
          where: { username: normalizedUsername, id: { not: id } },
        })
        if (taken) {
          return NextResponse.json({ error: 'El nombre de usuario ya está en uso' }, { status: 409 })
        }
        updateData.username = normalizedUsername
      }
    }

    if (data.password && data.password.trim() !== '') {
      updateData.passwordHash = await hashPassword(data.password)
    }

    if (data.role !== undefined) {
      updateData.role = data.role
    }

    if (data.isActive !== undefined) {
      updateData.isActive = data.isActive
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        isActive: true,
        updatedAt: true,
      },
    })

    await createAuditLog({
      userId: session.userId,
      action: 'UPDATE_STAFF_USER',
      entityType: 'User',
      entityId: id,
      oldValues: {
        email: existing.email,
        username: existing.username,
        role: existing.role,
        isActive: existing.isActive,
      },
      newValues: {
        email: updatedUser.email,
        username: updatedUser.username,
        role: updatedUser.role,
        isActive: updatedUser.isActive,
      },
    })

    return NextResponse.json({
      message: 'Usuario actualizado exitosamente',
      user: updatedUser,
    })
  } catch (error) {
    console.error('Error al actualizar usuario:', error)
    return NextResponse.json({ error: 'Error interno al actualizar el usuario' }, { status: 500 })
  }
}
