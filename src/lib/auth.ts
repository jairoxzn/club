import bcrypt from 'bcryptjs'
import { prisma } from './prisma'
import { Role } from '@prisma/client'

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function hashPin(pin: string): Promise<string> {
  return bcrypt.hash(pin, 12)
}

export async function verifyPin(pin: string, hash: string): Promise<boolean> {
  return bcrypt.compare(pin, hash)
}

// Genera un código de cliente único alfanumérico de 8 caracteres
export function generateCustomerCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Genera un código de validación único para canjes
export function generateValidationCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Sin caracteres confusos
  let result = ''
  for (let i = 0; i < 12; i++) {
    if (i > 0 && i % 4 === 0) result += '-'
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export async function checkRateLimit(
  userId: string,
  maxAttempts: number = 5,
  lockoutMinutes: number = 15
): Promise<{ isLocked: boolean; lockedUntil?: Date }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { failedLoginAttempts: true, lockedUntil: true },
  })

  if (!user) return { isLocked: false }

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    return { isLocked: true, lockedUntil: user.lockedUntil }
  }

  return { isLocked: false }
}

export async function recordFailedAttempt(
  identifier: string,
  field: 'phone' | 'email' | 'username'
): Promise<void> {
  const where = field === 'phone' ? { phone: identifier }
    : field === 'email' ? { email: identifier }
    : { username: identifier }

  const user = await prisma.user.findFirst({ where })
  if (!user) return

  const maxAttempts = 5
  const lockoutMinutes = 15
  const newAttempts = user.failedLoginAttempts + 1

  await prisma.user.update({
    where: { id: user.id },
    data: {
      failedLoginAttempts: newAttempts,
      lockedUntil: newAttempts >= maxAttempts
        ? new Date(Date.now() + lockoutMinutes * 60 * 1000)
        : null,
    },
  })
}

export async function clearFailedAttempts(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { failedLoginAttempts: 0, lockedUntil: null, lastLoginAt: new Date() },
  })
}
