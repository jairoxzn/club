export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/session'
import { Role } from '@prisma/client'
import { createAuditLog } from '@/lib/audit'
import { z } from 'zod'

const updateProfileSchema = z.object({
  firstName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(50),
  lastName: z.string().min(2, 'El apellido debe tener al menos 2 caracteres').max(50),
  email: z.string().email('Correo electrÃ³nico invÃ¡lido').nullable().optional().or(z.literal('')),
  birthDate: z.string().nullable().optional().or(z.literal('')),
  acceptedPromotions: z.boolean().optional(),
})

export async function GET() {
  try {
    const session = await requireAuth([Role.CUSTOMER])
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const profile = await prisma.customerProfile.findUnique({
      where: { userId: session.userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phone: true,
        email: true,
        birthDate: true,
        customerCode: true,
        acceptedTerms: true,
        acceptedDataProcessing: true,
        acceptedPromotions: true,
        availablePoints: true,
        totalPoints: true,
        createdAt: true,
      },
    })

    if (!profile) {
      return NextResponse.json({ error: 'Perfil de cliente no encontrado' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      profile,
    })
  } catch (error) {
    console.error('Error al obtener perfil:', error)
    return NextResponse.json(
      { error: 'Error al obtener datos del perfil' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const session = await requireAuth([Role.CUSTOMER])
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const validation = updateProfileSchema.safeParse(body)
    if (!validation.success) {
      const issues = validation.error.issues.map((i) => i.message).join(', ')
      return NextResponse.json({ error: issues }, { status: 400 })
    }

    const { firstName, lastName, email, birthDate, acceptedPromotions } = validation.data

    const currentProfile = await prisma.customerProfile.findUnique({
      where: { userId: session.userId },
    })

    if (!currentProfile) {
      return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 })
    }

    const cleanEmail = email && email.trim() !== '' ? email.trim().toLowerCase() : null

    // Verificar si el nuevo email ya estÃ¡ en uso por otro usuario
    if (cleanEmail && cleanEmail !== currentProfile.email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email: cleanEmail,
          id: { not: session.userId },
        },
      })

      if (existingUser) {
        return NextResponse.json(
          { error: 'El correo electrÃ³nico ya estÃ¡ registrado por otra cuenta' },
          { status: 400 }
        )
      }
    }

    const parsedBirthDate = birthDate && birthDate.trim() !== '' ? new Date(birthDate) : null

    const oldValues = {
      firstName: currentProfile.firstName,
      lastName: currentProfile.lastName,
      email: currentProfile.email,
      birthDate: currentProfile.birthDate,
      acceptedPromotions: currentProfile.acceptedPromotions,
    }

    // Actualizar en CustomerProfile y User
    const [updatedProfile] = await prisma.$transaction([
      prisma.customerProfile.update({
        where: { userId: session.userId },
        data: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: cleanEmail,
          birthDate: parsedBirthDate,
          acceptedPromotions: acceptedPromotions ?? currentProfile.acceptedPromotions,
        },
      }),
      prisma.user.update({
        where: { id: session.userId },
        data: {
          email: cleanEmail,
        },
      }),
    ])

    const newValues = {
      firstName: updatedProfile.firstName,
      lastName: updatedProfile.lastName,
      email: updatedProfile.email,
      birthDate: updatedProfile.birthDate,
      acceptedPromotions: updatedProfile.acceptedPromotions,
    }

    // Registrar en auditorÃ­a
    await createAuditLog({
      userId: session.userId,
      action: 'UPDATE_CUSTOMER_PROFILE',
      entityType: 'CustomerProfile',
      entityId: currentProfile.id,
      oldValues,
      newValues,
    })

    return NextResponse.json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      profile: updatedProfile,
    })
  } catch (error) {
    console.error('Error al actualizar perfil:', error)
    return NextResponse.json(
      { error: 'Error al actualizar el perfil' },
      { status: 500 }
    )
  }
}

