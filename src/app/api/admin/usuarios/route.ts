export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { Role } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/session'
import { hashPassword } from '@/lib/auth'
import { createAuditLog } from '@/lib/audit'

const createWorkerSchema = z.object({
  email: z.string().email('Correo electrÃ³nico invÃ¡lido'),
  username: z.string().trim().min(3, 'El nombre de usuario debe tener al menos 3 caracteres'),
  password: z.string().min(6, 'La contraseÃ±a debe tener al menos 6 caracteres'),
  role: z.enum([Role.ADMIN, Role.STAFF], {
    errorMap: () => ({ message: 'El rol debe ser ADMIN o STAFF' }),
  }),
})

// GET /api/admin/usuarios - Listar usuarios STAFF y ADMIN
export async function GET() {
  try {
    const session = await requireAuth([Role.ADMIN])
    if (!session) {
      return NextResponse.json({ error: 'No autorizado. Se requiere rol de administrador' }, { status: 403 })
    }

    const users = await prisma.user.findMany({
      where: {
        role: { in: [Role.ADMIN, Role.STAFF] },
      },
      select: {
        id: true,
        email: true,
        username: true,
        phone: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            servicesRegistered: true,
            redemptionsReviewed: true,
            redemptionsValidated: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ users })
  } catch (error) {
    console.error('Error al listar trabajadores:', error)
    return NextResponse.json({ error: 'Error interno al consultar trabajadores' }, { status: 500 })
  }
}

// POST /api/admin/usuarios - Registrar nuevo trabajador
export async function POST(request: Request) {
  try {
    const session = await requireAuth([Role.ADMIN])
    if (!session) {
      return NextResponse.json({ error: 'No autorizado. Se requiere rol de administrador' }, { status: 403 })
    }

    const body = await request.json()
    const validation = createWorkerSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Datos invÃ¡lidos',
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      )
    }

    const { email, username, password, role } = validation.data
    const normalizedEmail = email.toLowerCase().trim()
    const normalizedUsername = username.toLowerCase().trim()

    // Verificar si ya existe email o username
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { email: normalizedEmail },
          { username: normalizedUsername },
        ],
      },
    })

    if (existing) {
      if (existing.email?.toLowerCase() === normalizedEmail) {
        return NextResponse.json({ error: 'Ya existe un usuario con este correo electrÃ³nico' }, { status: 409 })
      }
      return NextResponse.json({ error: 'Ya existe un usuario con este nombre de usuario' }, { status: 409 })
    }

    const passwordHash = await hashPassword(password)

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        username: normalizedUsername,
        passwordHash,
        role,
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    })

    await createAuditLog({
      userId: session.userId,
      action: 'CREATE_STAFF_USER',
      entityType: 'User',
      entityId: user.id,
      newValues: {
        email: user.email,
        username: user.username,
        role: user.role,
      },
    })

    return NextResponse.json(
      { message: 'Usuario creado exitosamente', user },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error al registrar usuario:', error)
    return NextResponse.json({ error: 'Error interno al registrar el usuario' }, { status: 500 })
  }
}

