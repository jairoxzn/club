import { PrismaClient, Role, ServiceStatus, RoundingMode } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed de base de datos...')

  // ============================================================
  // USUARIO ADMINISTRADOR
  // ============================================================
  const adminPasswordHash = await bcrypt.hash('Admin@2024!', 12)
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@transportclub.pe' },
    update: {},
    create: {
      email: 'admin@transportclub.pe',
      username: 'admin',
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
      isActive: true,
    },
  })
  console.log('✅ Admin creado:', admin.email)

  // ============================================================
  // PERSONAL OPERATIVO DEMO
  // ============================================================
  const staffPasswordHash = await bcrypt.hash('Staff@2024!', 12)
  
  const staff = await prisma.user.upsert({
    where: { email: 'operador@transportclub.pe' },
    update: {},
    create: {
      email: 'operador@transportclub.pe',
      username: 'operador1',
      passwordHash: staffPasswordHash,
      role: Role.STAFF,
      isActive: true,
    },
  })
  console.log('✅ Operador creado:', staff.email)

  // ============================================================
  // CONFIGURACIÓN DEL SISTEMA
  // ============================================================
  const configs = [
    { key: 'company_name', value: 'TransportClub', description: 'Nombre de la empresa' },
    { key: 'loyalty_program_name', value: 'Club de Viajeros', description: 'Nombre del programa de fidelización' },
    { key: 'company_ruc', value: '20123456789', description: 'RUC de la empresa' },
    { key: 'company_address', value: 'Av. Principal 123, Lima, Perú', description: 'Dirección de la empresa' },
    { key: 'company_phone', value: '+51 1 234-5678', description: 'Teléfono de la empresa' },
    { key: 'company_email', value: 'contacto@transportclub.pe', description: 'Correo de la empresa' },
    { key: 'points_expiry_enabled', value: 'false', description: 'Habilitar vencimiento de puntos' },
    { key: 'points_expiry_days', value: '365', description: 'Días para vencimiento de puntos' },
    { key: 'max_failed_logins', value: '5', description: 'Intentos máximos de login fallido' },
    { key: 'lockout_duration_minutes', value: '15', description: 'Minutos de bloqueo por intentos fallidos' },
    { key: 'primary_color', value: '#1E40AF', description: 'Color primario del sistema' },
    { key: 'secondary_color', value: '#0EA5E9', description: 'Color secundario del sistema' },
  ]

  for (const config of configs) {
    await prisma.systemConfig.upsert({
      where: { key: config.key },
      update: { value: config.value },
      create: {
        key: config.key,
        value: config.value,
        description: config.description,
        updatedById: admin.id,
      },
    })
  }
  console.log('✅ Configuraciones del sistema creadas')

  // ============================================================
  // CATEGORÍAS DE TRANSPORTE
  // ============================================================
  const categories = [
    {
      name: 'Transporte Urbano',
      description: 'Servicio de transporte dentro de la ciudad',
      color: '#3B82F6',
      icon: 'Bus',
    },
    {
      name: 'Transporte Interprovincial',
      description: 'Servicio de transporte entre provincias o ciudades',
      color: '#8B5CF6',
      icon: 'TruckIcon',
    },
    {
      name: 'Transporte Empresarial',
      description: 'Servicio de transporte para empresas y grupos',
      color: '#10B981',
      icon: 'Building2',
    },
    {
      name: 'Transporte Corporativo',
      description: 'Servicio premium para clientes corporativos',
      color: '#F59E0B',
      icon: 'Crown',
    },
  ]

  const createdCategories: Record<string, string> = {}
  
  for (const cat of categories) {
    const category = await prisma.serviceCategory.upsert({
      where: { name: cat.name },
      update: cat,
      create: { ...cat, isActive: true },
    })
    createdCategories[cat.name] = category.id
    console.log('✅ Categoría creada:', cat.name)
  }

  // ============================================================
  // REGLAS DE PUNTOS (VALORES DEMO - CONFIGURABLES)
  // ============================================================
  const rulesData = [
    {
      categoryName: 'Transporte Urbano',
      pointsPerUnit: 1,
      amountBase: 10,
      minEligibleAmount: 5,
      maxPointsPerService: 100,
      notes: 'DEMO: 1 punto por cada S/10. Configurable desde el panel.',
    },
    {
      categoryName: 'Transporte Interprovincial',
      pointsPerUnit: 2,
      amountBase: 10,
      minEligibleAmount: 20,
      maxPointsPerService: 500,
      notes: 'DEMO: 2 puntos por cada S/10. Configurable desde el panel.',
    },
    {
      categoryName: 'Transporte Empresarial',
      pointsPerUnit: 3,
      amountBase: 10,
      minEligibleAmount: 50,
      maxPointsPerService: 1000,
      notes: 'DEMO: 3 puntos por cada S/10. Configurable desde el panel.',
    },
    {
      categoryName: 'Transporte Corporativo',
      pointsPerUnit: 5,
      amountBase: 10,
      minEligibleAmount: 100,
      maxPointsPerService: 2000,
      notes: 'DEMO: 5 puntos por cada S/10. Configurable desde el panel.',
    },
  ]

  for (const rule of rulesData) {
    const categoryId = createdCategories[rule.categoryName]
    if (!categoryId) continue

    // Solo crear si no existe regla activa para esta categoría
    const existingRule = await prisma.pointsRule.findFirst({
      where: { categoryId, isActive: true },
    })

    if (!existingRule) {
      await prisma.pointsRule.create({
        data: {
          categoryId,
          pointsPerUnit: rule.pointsPerUnit,
          amountBase: rule.amountBase,
          roundingMode: RoundingMode.FLOOR,
          minEligibleAmount: rule.minEligibleAmount,
          maxPointsPerService: rule.maxPointsPerService,
          isActive: true,
          notes: rule.notes,
          createdById: admin.id,
        },
      })
      console.log('✅ Regla creada para:', rule.categoryName)
    }
  }

  // ============================================================
  // RECOMPENSAS DEMO
  // ============================================================
  const rewards = [
    {
      name: 'Descuento 10% en próximo servicio',
      description: 'Obtén un descuento del 10% en tu próximo servicio de transporte urbano.',
      pointsRequired: 100,
      stock: null,
      conditions: 'Válido para servicios de transporte urbano. No acumulable con otras ofertas.',
      isActive: true,
    },
    {
      name: 'Viaje interprovincial con descuento',
      description: 'S/20 de descuento en tu próximo viaje interprovincial.',
      pointsRequired: 300,
      stock: 50,
      conditions: 'Válido para rutas seleccionadas. Sujeto a disponibilidad.',
      isActive: true,
    },
    {
      name: 'Servicio empresarial gratuito',
      description: 'Un servicio de transporte empresarial sin costo (hasta S/80 de valor).',
      pointsRequired: 800,
      stock: 20,
      conditions: 'Válido para grupos de hasta 10 personas. Con reserva previa.',
      isActive: true,
    },
    {
      name: 'Beneficio corporativo premium',
      description: 'Acceso a nuestro servicio corporativo con descuento del 25% por un mes.',
      pointsRequired: 1500,
      stock: 10,
      conditions: 'Para clientes con cuenta activa mínimo 6 meses. Un beneficio por cliente.',
      isActive: true,
    },
    {
      name: 'Kit de viajero frecuente',
      description: 'Mochila de viaje, almohada cervical y artículos de regalo de la marca.',
      pointsRequired: 500,
      stock: 30,
      conditions: 'Stock limitado. Recojo en oficinas de la empresa.',
      isActive: true,
    },
  ]

  for (const reward of rewards) {
    const existing = await prisma.reward.findFirst({
      where: { name: reward.name, isDeleted: false },
    })
    if (!existing) {
      await prisma.reward.create({
        data: { ...reward, createdById: admin.id },
      })
      console.log('✅ Recompensa creada:', reward.name)
    }
  }

  // ============================================================
  // CLIENTE DEMO
  // ============================================================
  const clientPinHash = await bcrypt.hash('1234', 12)
  
  const clientUser = await prisma.user.upsert({
    where: { phone: '999000001' },
    update: {},
    create: {
      phone: '999000001',
      pinHash: clientPinHash,
      role: Role.CUSTOMER,
      isActive: true,
    },
  })

  const existingProfile = await prisma.customerProfile.findUnique({
    where: { userId: clientUser.id },
  })

  if (!existingProfile) {
    await prisma.customerProfile.create({
      data: {
        userId: clientUser.id,
        firstName: 'Juan',
        lastName: 'Pérez Demo',
        phone: '999000001',
        email: 'juan.demo@email.com',
        customerCode: 'DEMO0001',
        totalPoints: 350,
        availablePoints: 350,
        reservedPoints: 0,
        redeemedPoints: 0,
        acceptedTerms: true,
        acceptedDataProcessing: true,
        acceptedPromotions: false,
      },
    })
    console.log('✅ Cliente demo creado: celular 999000001, PIN 1234')
  }

  console.log('\n🎉 Seed completado exitosamente!')
  console.log('\n📋 Credenciales de acceso:')
  console.log('   Admin:    admin@transportclub.pe / Admin@2024!')
  console.log('   Operador: operador@transportclub.pe / Staff@2024!')
  console.log('   Cliente:  celular 999000001 / PIN 1234')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Error en seed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
