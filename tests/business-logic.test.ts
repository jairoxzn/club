import 'dotenv/config'
import {
  calculatePoints,
  awardPointsForService,
  reservePointsForRedemption,
  releaseReservedPoints,
  confirmRedemption,
  adjustPoints,
} from '../src/lib/points'
import {
  hashPin,
  verifyPin,
  hashPassword,
  verifyPassword,
  generateCustomerCode,
  generateValidationCode,
} from '../src/lib/auth'
import { prisma } from '../src/lib/prisma'

async function runTests() {
  console.log('🧪 Iniciando pruebas automatizadas del sistema...\n')
  let passed = 0
  let failed = 0

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`)
      passed++
    } else {
      console.error(`  ❌ FAIL: ${testName}`)
      failed++
    }
  }

  try {
    // 1. Pruebas de Hashing y PIN
    console.log('1. Pruebas de Seguridad y Hashing:')
    const testPin = '9876'
    const pinHash = await hashPin(testPin)
    assert(await verifyPin(testPin, pinHash), 'Verificación de PIN correcto')
    assert(!(await verifyPin('0000', pinHash)), 'Rechazo de PIN incorrecto')

    const testPassword = 'AdminPassword123!'
    const passHash = await hashPassword(testPassword)
    assert(await verifyPassword(testPassword, passHash), 'Verificación de contraseña segura')
    assert(!(await verifyPassword('wrongpass', passHash)), 'Rechazo de contraseña incorrecta')

    // 2. Pruebas de Generación de Códigos Únicos
    console.log('\n2. Pruebas de Códigos Únicos:')
    const customerCode1 = generateCustomerCode()
    const customerCode2 = generateCustomerCode()
    assert(customerCode1.length === 8, 'Código de cliente tiene longitud de 8 caracteres')
    assert(customerCode1 !== customerCode2, 'Códigos de cliente consecutivos son únicos')

    const valCode = generateValidationCode()
    assert(valCode.length === 14, 'Código de validación de canje tiene formato correcto con guiones')

    // 3. Pruebas de Motor de Puntos con BD Real
    console.log('\n3. Pruebas del Motor de Acumulación:')
    const category = await prisma.serviceCategory.findFirst({
      where: { name: 'Transporte Interprovincial' },
    })

    if (category) {
      // Regla de interprovincial: 2 puntos por cada S/10
      const calc100 = await calculatePoints(category.id, 100)
      assert(calc100 !== null && calc100.points === 20, 'Cálculo de S/100 en interprovincial otorga 20 puntos')

      const calc50 = await calculatePoints(category.id, 50)
      assert(calc50 !== null && calc50.points === 10, 'Cálculo de S/50 en interprovincial otorga 10 puntos')

      const calcBelowMin = await calculatePoints(category.id, 10)
      // minEligibleAmount es 20 en interprovincial
      assert(calcBelowMin === null, 'Monto por debajo del mínimo elegible no otorga puntos')
    } else {
      console.warn('  ⚠️ No se encontró categoría de prueba')
    }

    // 4. Pruebas de Integridad de Transacciones
    console.log('\n4. Pruebas de Integridad de Datos en BD:')
    const client = await prisma.customerProfile.findFirst()
    assert(client !== null, 'Cliente demo existe en base de datos PostgreSQL')
    assert(client !== null && client.availablePoints >= 0, 'Saldo de puntos disponible no es negativo')

    console.log(`\n========================================`)
    console.log(`Resultado: ${passed} pasadas, ${failed} fallidas`)
    console.log(`========================================\n`)

    if (failed > 0) process.exit(1)
  } catch (error) {
    console.error('Error durante la ejecución de pruebas:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

runTests()
