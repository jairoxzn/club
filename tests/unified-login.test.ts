import { prisma } from '../src/lib/prisma'
import { verifyPin, verifyPassword } from '../src/lib/auth'

async function runUnifiedLoginTest() {
  console.log('🧪 Iniciando prueba de lógica de Login Unificado...')

  // Test 1: Buscar cliente por celular y validar PIN
  const phone = '999000001'
  const pin = '1234'
  const customerUser = await prisma.user.findFirst({
    where: {
      OR: [
        { phone },
        { email: { equals: phone.toLowerCase(), mode: 'insensitive' } },
        { username: { equals: phone, mode: 'insensitive' } },
        { customerProfile: { customerCode: { equals: phone.toUpperCase() } } },
      ],
    },
    include: { customerProfile: true },
  })

  if (!customerUser) {
    throw new Error('❌ Test 1 Falló: No se encontró el cliente demo')
  }
  const isPinValid = customerUser.pinHash ? await verifyPin(pin, customerUser.pinHash) : false
  if (!isPinValid) {
    throw new Error('❌ Test 1 Falló: PIN inválido para cliente demo')
  }
  console.log(`✅ Test 1 Superado: Cliente autenticado correctamente. Rol: ${customerUser.role}, Destino esperado: /cliente`)

  // Test 2: Buscar personal por correo y validar contraseña
  const staffEmail = 'operador@transportclub.pe'
  const staffPass = 'Staff@2024!'
  const staffUser = await prisma.user.findFirst({
    where: {
      OR: [
        { phone: staffEmail },
        { email: { equals: staffEmail.toLowerCase(), mode: 'insensitive' } },
        { username: { equals: staffEmail, mode: 'insensitive' } },
      ],
    },
  })

  if (!staffUser) {
    throw new Error('❌ Test 2 Falló: No se encontró el operador demo')
  }
  const isStaffPassValid = staffUser.passwordHash ? await verifyPassword(staffPass, staffUser.passwordHash) : false
  if (!isStaffPassValid) {
    throw new Error('❌ Test 2 Falló: Contraseña inválida para operador demo')
  }
  console.log(`✅ Test 2 Superado: Operador autenticado correctamente. Rol: ${staffUser.role}, Destino esperado: /personal`)

  // Test 3: Buscar admin por correo y validar contraseña
  const adminEmail = 'admin@transportclub.pe'
  const adminPass = 'Admin@2024!'
  const adminUser = await prisma.user.findFirst({
    where: {
      OR: [
        { phone: adminEmail },
        { email: { equals: adminEmail.toLowerCase(), mode: 'insensitive' } },
        { username: { equals: adminEmail, mode: 'insensitive' } },
      ],
    },
  })

  if (!adminUser) {
    throw new Error('❌ Test 3 Falló: No se encontró el administrador demo')
  }
  const isAdminPassValid = adminUser.passwordHash ? await verifyPassword(adminPass, adminUser.passwordHash) : false
  if (!isAdminPassValid) {
    throw new Error('❌ Test 3 Falló: Contraseña inválida para administrador demo')
  }
  console.log(`✅ Test 3 Superado: Administrador autenticado correctamente. Rol: ${adminUser.role}, Destino esperado: /admin`)

  // Test 4: Buscar admin por username "admin"
  const adminUsername = 'admin'
  const adminUserByUsername = await prisma.user.findFirst({
    where: {
      OR: [
        { email: { equals: adminUsername.toLowerCase(), mode: 'insensitive' } },
        { username: { equals: adminUsername, mode: 'insensitive' } },
      ],
    },
  })
  if (!adminUserByUsername || !adminUserByUsername.passwordHash) {
    throw new Error('❌ Test 4 Falló: No se encontró admin por username')
  }
  const isUsernameAuthValid = await verifyPassword(adminPass, adminUserByUsername.passwordHash)
  if (!isUsernameAuthValid) {
    throw new Error('❌ Test 4 Falló: Contraseña inválida buscando por username')
  }
  console.log(`✅ Test 4 Superado: Administrador autenticado por username ('admin'). Rol: ${adminUserByUsername.role}`)

  console.log('\n🎉 ¡TODAS LAS PRUEBAS DEL LOGIN UNIFICADO PASARON EXITOSAMENTE!')
}

runUnifiedLoginTest()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

