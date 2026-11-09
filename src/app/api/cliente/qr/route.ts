export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/session'
import { Role } from '@prisma/client'
import QRCode from 'qrcode'

export async function GET() {
  try {
    const session = await requireAuth([Role.CUSTOMER])
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const profile = await prisma.customerProfile.findUnique({
      where: { userId: session.userId },
      select: {
        customerCode: true,
        qrToken: true,
        firstName: true,
        lastName: true,
      },
    })

    if (!profile) {
      return NextResponse.json({ error: 'Perfil de cliente no encontrado' }, { status: 404 })
    }

    // Generar cÃ³digo QR en formato Data URL (base64 PNG)
    const qrDataUrl = await QRCode.toDataURL(profile.qrToken, {
      width: 400,
      margin: 2,
      errorCorrectionLevel: 'H',
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    })

    return NextResponse.json({
      success: true,
      customerCode: profile.customerCode,
      qrToken: profile.qrToken,
      qrDataUrl,
      fullName: `${profile.firstName} ${profile.lastName}`.trim(),
    })
  } catch (error) {
    console.error('Error al generar QR del cliente:', error)
    return NextResponse.json(
      { error: 'Error al generar cÃ³digo QR' },
      { status: 500 }
    )
  }
}

