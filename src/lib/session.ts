import { getIronSession, SessionOptions } from 'iron-session'
import { cookies } from 'next/headers'
import { Role } from '@prisma/client'

export interface SessionData {
  userId: string
  role: Role
  isLoggedIn: boolean
}

const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET!,
  cookieName: 'transportclub_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 días
  },
}

export async function getSession() {
  const cookieStore = await cookies()
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions)
  return session
}

export async function requireAuth(allowedRoles?: Role[]) {
  const session = await getSession()
  
  if (!session.isLoggedIn || !session.userId) {
    return null
  }
  
  if (allowedRoles && !allowedRoles.includes(session.role)) {
    return null
  }
  
  return session
}
