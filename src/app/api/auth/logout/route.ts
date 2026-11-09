export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { createAuditLog } from '@/lib/audit'

export async function POST(request: Request) {
  try {
    const session = await getSession()

    if (session.isLoggedIn && session.userId) {
      const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined
      const userAgent = request.headers.get('user-agent') || undefined

      await createAuditLog({
        userId: session.userId,
        action: 'LOGOUT',
        entityType: 'User',
        entityId: session.userId,
        ipAddress: ipAddress ?? undefined,
        userAgent: userAgent ?? undefined,
      })
    }

    session.destroy()

    return NextResponse.json({
      success: true,
      message: 'SesiÃ³n cerrada exitosamente',
    })
  } catch (error) {
    console.error('Error al cerrar sesiÃ³n:', error)
    return NextResponse.json(
      { error: 'OcurriÃ³ un error al cerrar la sesiÃ³n' },
      { status: 500 }
    )
  }
}

