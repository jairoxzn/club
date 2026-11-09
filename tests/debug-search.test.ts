import { prisma } from '../src/lib/prisma'

async function debugIdentifierSearch(identifier: string) {
  const cleanIdentifier = identifier.trim()
  const lowerIdentifier = cleanIdentifier.toLowerCase()
  const digitsOnly = cleanIdentifier.replace(/\D/g, '')
  const isPhoneLike = digitsOnly.length >= 9
  const last9Digits = digitsOnly.slice(-9)

  const user = await prisma.user.findFirst({
    where: {
      OR: [
        ...(isPhoneLike ? [{ phone: last9Digits }, { phone: cleanIdentifier }] : []),
        { email: { equals: lowerIdentifier, mode: 'insensitive' } },
        { username: { equals: cleanIdentifier, mode: 'insensitive' } },
        {
          customerProfile: {
            customerCode: { equals: cleanIdentifier.toUpperCase() },
          },
        },
        {
          customerProfile: {
            email: { equals: lowerIdentifier, mode: 'insensitive' },
          },
        },
        {
          customerProfile: {
            phone: isPhoneLike ? last9Digits : cleanIdentifier,
          },
        },
      ],
    },
    include: {
      customerProfile: true,
    },
  })

  return user ? { id: user.id, email: user.email, phone: user.phone, role: user.role } : null
}

async function run() {
  const inputs = [
    '999000001',
    '+51 999 000 001',
    '987654321',
    '+51 987 654 321',
    'jairolajo5@gmail.com',
    'JAIROLAJO5@GMAIL.COM',
    'admin@transportclub.pe',
    'admin',
    'ADMIN',
    'operador@transportclub.pe',
    'operador',
    'DEMO0001',
    'UCF19X91',
  ]

  console.log('--- TESTING ALL IDENTIFIERS ---')
  for (const input of inputs) {
    const res = await debugIdentifierSearch(input)
    console.log(`Input: "${input}" => Found:`, res ? `YES (id: ${res.id}, role: ${res.role})` : 'NO')
  }
}

run().catch(console.error).finally(() => prisma.$disconnect())

