import { prisma } from '../src/lib/prisma'

async function testBuscarQr() {
  console.log('🧪 Probando búsqueda de cliente por QR/Teléfono/Código...')

  const customerCode = 'UCF19X91'
  const customer = await prisma.customerProfile.findFirst({
    where: {
      OR: [
        { customerCode },
        { phone: '987654321' },
      ],
    },
    include: {
      user: {
        select: {
          id: true,
          isActive: true,
          role: true,
        },
      },
      _count: {
        select: {
          services: true,
          redemptions: true,
        },
      },
    },
  })

  if (!customer) {
    throw new Error('❌ Cliente no encontrado')
  }

  const responsePayload = {
    customer: {
      id: customer.id,
      userId: customer.userId,
      firstName: customer.firstName,
      lastName: customer.lastName,
      phone: customer.phone,
      customerCode: customer.customerCode,
      user: {
        id: customer.user.id,
        isActive: customer.user.isActive,
        role: customer.user.role,
      },
      isActive: customer.user.isActive,
    },
    isBlocked: !customer.user.isActive,
  }

  console.log('Cliente encontrado:', responsePayload.customer.firstName, responsePayload.customer.lastName)
  console.log('User isActive en BD:', responsePayload.customer.user.isActive)
  console.log('¿Está bloqueado?:', responsePayload.isBlocked ? 'SÍ (Bloqueado)' : 'NO (Activo y elegible)')

  if (responsePayload.customer.user.isActive !== true) {
    throw new Error('❌ Falló: El cliente debería estar activo')
  }

  console.log('✅ TEST SUPERADO: El cliente está 100% activo y elegible para registrar servicios.')
}

testBuscarQr()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
