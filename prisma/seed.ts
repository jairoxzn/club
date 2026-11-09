import { PrismaClient, Role, ServiceStatus, RoundingMode } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed de base de datos LUXURI PRIVATE TRAVEL...')

  // ============================================================
  // USUARIO ADMINISTRADOR
  // ============================================================
  const adminPasswordHash = await bcrypt.hash('Admin@2024!', 12)
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@transportclub.pe' },
    update: {
      username: 'admin',
    },
    create: {
      email: 'admin@transportclub.pe',
      username: 'admin',
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
      isActive: true,
    },
  })
  console.log('✅ Admin verificado:', admin.email)

  // ============================================================
  // PERSONAL OPERATIVO DEMO
  // ============================================================
  const staffPasswordHash = await bcrypt.hash('Staff@2024!', 12)
  
  const staff = await prisma.user.upsert({
    where: { email: 'operador@transportclub.pe' },
    update: {
      username: 'operador',
    },
    create: {
      email: 'operador@transportclub.pe',
      username: 'operador',
      passwordHash: staffPasswordHash,
      role: Role.STAFF,
      isActive: true,
    },
  })
  console.log('✅ Operador verificado:', staff.email)

  // ============================================================
  // CONFIGURACIÓN DEL SISTEMA (LUXURI PRIVATE TRAVEL)
  // ============================================================
  const configs = [
    { key: 'company_name', value: 'LUXURI PRIVATE TRAVEL', description: 'Nombre oficial de la empresa' },
    { key: 'loyalty_program_name', value: 'Club Luxuri VIP', description: 'Nombre del programa de fidelización' },
    { key: 'company_ruc', value: '20601234567', description: 'RUC de la empresa' },
    { key: 'company_address', value: 'Aeropuerto Internacional Rodríguez Ballón / Arequipa, Perú', description: 'Dirección o base operativa' },
    { key: 'company_phone', value: '+51 922 895 355', description: 'Teléfono oficial de contacto / WhatsApp' },
    { key: 'company_email', value: 'luxurycarstravel@gmail.com', description: 'Correo oficial de la empresa' },
    { key: 'points_expiry_enabled', value: 'false', description: 'Habilitar vencimiento de puntos' },
    { key: 'points_expiry_days', value: '365', description: 'Días para vencimiento de puntos' },
    { key: 'max_failed_logins', value: '5', description: 'Intentos máximos de login fallido' },
    { key: 'lockout_duration_minutes', value: '15', description: 'Minutos de bloqueo por intentos fallidos' },
    { key: 'primary_color', value: '#D4AF37', description: 'Color dorado primario VIP' },
    { key: 'secondary_color', value: '#F59E0B', description: 'Color secundario oro cálido' },
  ]

  for (const config of configs) {
    await prisma.systemConfig.upsert({
      where: { key: config.key },
      update: { value: config.value, description: config.description },
      create: {
        key: config.key,
        value: config.value,
        description: config.description,
        updatedById: admin.id,
      },
    })
  }
  console.log('✅ Configuraciones de LUXURI PRIVATE TRAVEL actualizadas')

  // ============================================================
  // CATEGORÍAS DE TRANSPORTE SEGÚN EL FLYER OFICIAL
  // ============================================================
  const categories = [
    {
      name: 'Traslado de Aeropuerto',
      description: 'Traslados exclusivos del aeropuerto a tu destino y viceversa en autos y camionetas modernas',
      color: '#D4AF37',
      icon: 'Plane',
    },
    {
      name: 'Viajes Privados & Interprovincial',
      description: 'Viajes a Moquegua, Tacna, Mollendo, Cocachacra, Valle del Tambo, Juliaca - Puno',
      color: '#F59E0B',
      icon: 'Car',
    },
    {
      name: 'Destinos & Tours Turísticos',
      description: 'City tours, Campiña tour, Ruta del sillar, Chapi, Cañón del Colca',
      color: '#10B981',
      icon: 'Compass',
    },
    {
      name: 'Mensajería & Encomiendas',
      description: 'Envíos locales y nacionales de documentos y paquetes con entregas rápidas y seguras',
      color: '#6366F1',
      icon: 'Package',
    },
    {
      name: 'Servicio Empresarial & Corporativo',
      description: 'Trámites, gestiones, traslados para grupos, eventos y viajes ejecutivos personalizados',
      color: '#EC4899',
      icon: 'Briefcase',
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
    console.log('✅ Categoría registrada:', cat.name)
  }

  // ============================================================
  // REGLAS DE PUNTOS
  // ============================================================
  const rulesData = [
    {
      categoryName: 'Traslado de Aeropuerto',
      pointsPerUnit: 2,
      amountBase: 10,
      minEligibleAmount: 20,
      maxPointsPerService: 200,
      notes: '2 puntos VIP por cada S/10 en traslados de aeropuerto.',
    },
    {
      categoryName: 'Viajes Privados & Interprovincial',
      pointsPerUnit: 3,
      amountBase: 10,
      minEligibleAmount: 50,
      maxPointsPerService: 1000,
      notes: '3 puntos VIP por cada S/10 en viajes interprovinciales (Tacna, Moquegua, Puno, etc.).',
    },
    {
      categoryName: 'Destinos & Tours Turísticos',
      pointsPerUnit: 4,
      amountBase: 10,
      minEligibleAmount: 50,
      maxPointsPerService: 1500,
      notes: '4 puntos VIP por cada S/10 en tours (Colca, Ruta del Sillar, Campiña, etc.).',
    },
    {
      categoryName: 'Mensajería & Encomiendas',
      pointsPerUnit: 1,
      amountBase: 10,
      minEligibleAmount: 10,
      maxPointsPerService: 100,
      notes: '1 punto VIP por cada S/10 en mensajería y paquetes.',
    },
    {
      categoryName: 'Servicio Empresarial & Corporativo',
      pointsPerUnit: 5,
      amountBase: 10,
      minEligibleAmount: 100,
      maxPointsPerService: 2500,
      notes: '5 puntos VIP por cada S/10 en servicios ejecutivos corporativos.',
    },
  ]

  for (const rule of rulesData) {
    const categoryId = createdCategories[rule.categoryName]
    if (!categoryId) continue

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
      console.log('✅ Regla de acumulación activada para:', rule.categoryName)
    }
  }

  // ============================================================
  // RECOMPENSAS EXCLUSIVAS LUXURI VIP
  // ============================================================
  const rewards = [
    {
      name: 'Traslado al Aeropuerto con 20% de Descuento',
      description: 'Obtén 20% de descuento en tu próximo traslado privado hacia o desde el aeropuerto.',
      pointsRequired: 150,
      stock: 100,
      conditions: 'Válido para servicio de traslado privado en auto o camioneta. Reserva con 24h de anticipación.',
      isActive: true,
    },
    {
      name: 'Envío de Mensajería Local Gratis',
      description: 'Un envío de documentos o encomienda ligera dentro de la ciudad sin costo.',
      pointsRequired: 100,
      stock: 50,
      conditions: 'Paquete de hasta 3 kg dentro de la zona urbana.',
      isActive: true,
    },
    {
      name: 'Tour Campiña o Ruta del Sillar con 50% de Descuento',
      description: 'Disfruta de medio día conociendo los mejores atractivos turísticos con tarifa especial.',
      pointsRequired: 400,
      stock: 30,
      conditions: 'Válido para un pasajero. Sujeto a programación de salidas.',
      isActive: true,
    },
    {
      name: 'Traslado Aeropuerto 100% Gratis',
      description: 'Un traslado exclusivo completo sin costo entre el aeropuerto y cualquier punto urbano.',
      pointsRequired: 600,
      stock: 25,
      conditions: 'Vehículo premium con chofer profesional y recepción con cartel personalizada.',
      isActive: true,
    },
    {
      name: 'Viaje Interprovincial VIP con S/50 de Descuento',
      description: 'Bono de S/50 de descuento directo en traslados a Moquegua, Tacna, Mollendo o Puno.',
      pointsRequired: 800,
      stock: 20,
      conditions: 'Aplica a traslados privados contratados en camioneta o auto exclusivo.',
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
      console.log('✅ Recompensa VIP creada:', reward.name)
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
        firstName: 'Carlos',
        lastName: 'Mendoza VIP',
        phone: '999000001',
        email: 'carlos.vip@luxuri.pe',
        customerCode: 'LUX-0001',
        totalPoints: 450,
        availablePoints: 450,
        reservedPoints: 0,
        redeemedPoints: 0,
        acceptedTerms: true,
        acceptedDataProcessing: true,
        acceptedPromotions: true,
      },
    })
    console.log('✅ Cliente VIP demo creado: 999000001 / PIN 1234 (450 puntos)')
  }

  console.log('\n🎉 ¡Seed de LUXURI PRIVATE TRAVEL completado exitosamente!')
  console.log('🔐 Portal Único de Acceso: /ingresar')
  console.log('   👑 Cliente VIP:  999000001 / PIN 1234')
  console.log('   💼 Operador:     operador@transportclub.pe (o operador) / Staff@2024!')
  console.log('   🛡️ Administrador: admin@transportclub.pe (o admin) / Admin@2024!')
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
