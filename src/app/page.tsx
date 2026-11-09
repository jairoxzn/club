'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Crown,
  Plane,
  ShieldCheck,
  Car,
  Package,
  MapPin,
  Compass,
  Briefcase,
  Phone,
  Mail,
  ChevronRight,
  Star,
  CheckCircle2,
  Gift,
  QrCode,
  Sparkles,
  ArrowRight,
  MessageCircle,
} from 'lucide-react'

export default function HomePage() {
  const whatsappNumber = '51922895355'
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=Hola%20Luxuri%20Private%20Travel,%20deseo%20solicitar%20un%20servicio%20y%20conocer%20m%C3%A1s%20sobre%20el%20Club%20de%20Puntos.`

  const destinosInterprovinciales = [
    { name: 'Moquegua', desc: 'Viaje directo y privado con máxima comodidad' },
    { name: 'Tacna', desc: 'Ruta comercial y turística sin escalas' },
    { name: 'Mollendo', desc: 'Playas y costa con servicio puerta a puerta' },
    { name: 'Cocachacra', desc: 'Traslados ágiles y seguros todo el año' },
    { name: 'Valle del Tambo', desc: 'Atención personalizada para familias y empresas' },
    { name: 'Juliaca – Puno', desc: 'Conexión con el altiplano en camionetas acondicionadas' },
  ]

  const tours = [
    { title: 'Ruta del Sillar', desc: 'Descubre las canteras milenarias de Arequipa.', icon: '🏛️' },
    { title: 'Cañón del Colca', desc: 'El vuelo del cóndor y los paisajes más impresionantes.', icon: '🦅' },
    { title: 'Campiña Tour', desc: 'Molino de Sabandía, Mansión del Fundador y miradores.', icon: '🌾' },
    { title: 'City Tours Arequipa', desc: 'Centro histórico, claustros coloniales y miradores.', icon: '🌆' },
    { title: 'Santuario de Chapi', desc: 'Peregrinación y viajes devocionales con total confort.', icon: '⛪' },
  ]

  const serviciosCorporativos = [
    { title: 'Trámites y Gestiones', desc: 'Diligencias urgentes, encomiendas y gestiones administrativas de confianza.' },
    { title: 'Servicio Empresarial', desc: 'Transporte de ejecutivos, personal corporativo y clientes VIP.' },
    { title: 'Grupos y Eventos', desc: 'Logística de traslado para bodas, congresos y recepciones.' },
    { title: 'Viajes Personalizados', desc: 'Itinerarios a tu medida, a cualquier hora del día o noche.' },
  ]

  return (
    <div className="min-h-screen bg-[#070A11] text-slate-100 selection:bg-amber-500 selection:text-black">
      {/* Topbar Dorado */}
      <div className="bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-700 text-slate-950 px-4 py-2 text-xs font-bold text-center tracking-wide flex items-center justify-center gap-4 flex-wrap">
        <span className="flex items-center gap-1.5">
          <Crown className="w-3.5 h-3.5 fill-slate-950" />
          Club de Fidelización Luxuri: Acumula puntos en cada viaje y canjea premios
        </span>
        <span className="hidden sm:inline opacity-40">|</span>
        <a
          href={`tel:${whatsappNumber}`}
          className="hover:underline flex items-center gap-1 font-extrabold"
        >
          <Phone className="w-3.5 h-3.5" /> 92 28 95 355
        </a>
      </div>

      {/* Header Principal */}
      <header className="sticky top-0 z-50 bg-[#0B0F19]/90 backdrop-blur-md border-b border-amber-500/20 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-700 p-0.5 shadow-lg shadow-amber-500/10 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#0B0F19] rounded-[14px] flex items-center justify-center">
                <Crown className="w-6 h-6 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="text-xl sm:text-2xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500">
                  LUXURI
                </span>
                <span className="text-[10px] uppercase font-bold text-amber-300/80 tracking-widest border border-amber-500/30 px-1.5 py-0.2 rounded">
                  Private
                </span>
              </div>
              <p className="text-[10px] text-slate-400 tracking-wider uppercase font-semibold">
                Del aeropuerto a tu destino ♡
              </p>
            </div>
          </Link>

          {/* Contacto & Acciones */}
          <div className="flex items-center gap-3 sm:gap-4">
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:flex items-center gap-2 text-xs font-bold text-amber-400 hover:text-amber-300 bg-amber-500/10 border border-amber-500/30 px-3.5 py-2 rounded-xl transition-all"
            >
              <MessageCircle className="w-4 h-4 text-green-400" />
              WhatsApp: 92 28 95 355
            </a>

            <Link
              href="/ingresar"
              className="text-xs sm:text-sm font-semibold text-slate-300 hover:text-white px-3 sm:px-4 py-2 rounded-xl hover:bg-white/5 transition-colors"
            >
              Iniciar Sesión
            </Link>

            <Link
              href="/registro"
              className="bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs sm:text-sm px-4 sm:px-5 py-2.5 rounded-xl shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 transition-all flex items-center gap-1.5"
            >
              <QrCode className="w-4 h-4" />
              <span>Unirme al Club</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-16 lg:pb-28">
        {/* Glows de fondo */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-0 right-10 w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Texto Hero */}
            <div className="lg:col-span-7 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 px-4 py-1.5 rounded-full text-xs font-bold text-amber-300 mb-6 backdrop-blur-xs">
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span>SERVICIO DE TRANSPORTE & FIDELIZACIÓN VIP</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] mb-6">
                Del aeropuerto a tu destino.{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 block mt-2">
                  Tu viaje, nuestra prioridad ♡
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 mb-8 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
                Especialistas en <strong>traslados de aeropuerto</strong>, <strong>viajes privados</strong>, <strong>rutas interprovinciales</strong>, <strong>tours turísticos</strong> y servicio express de <strong>mensajería</strong> en autos y camionetas de alta gama.
                <br />
                <span className="text-amber-400/90 font-medium mt-2 inline-block">
                  Regístrate gratis, obtén tu código QR personal y acumula puntos en cada servicio para canjear viajes gratis y premios exclusivos.
                </span>
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center">
                <Link
                  href="/registro"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black px-8 py-4 rounded-2xl text-base shadow-xl shadow-amber-500/25 hover:shadow-amber-500/40 hover:-translate-y-0.5 transition-all"
                >
                  <Sparkles className="w-5 h-5" />
                  Crear mi cuenta y recibir puntos
                  <ChevronRight className="w-5 h-5" />
                </Link>

                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white font-bold px-7 py-4 rounded-2xl text-base border border-slate-700/80 hover:border-amber-500/40 transition-all backdrop-blur-xs"
                >
                  <MessageCircle className="w-5 h-5 text-green-400" />
                  Reservar por WhatsApp
                </a>
              </div>

              {/* Badges de confianza */}
              <div className="mt-10 pt-8 border-t border-slate-800/80 grid grid-cols-3 gap-4 text-center lg:text-left">
                <div>
                  <div className="text-2xl font-black text-amber-400">100%</div>
                  <div className="text-xs text-slate-400">Puntualidad & Confort</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-amber-400">24/7</div>
                  <div className="text-xs text-slate-400">Disponibilidad Total</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-amber-400">+ Puntos</div>
                  <div className="text-xs text-slate-400">En cada servicio</div>
                </div>
              </div>
            </div>

            {/* Imagen Banner Oficial */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden border-2 border-amber-500/30 shadow-2xl shadow-amber-500/10 group">
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-transparent to-transparent z-10 pointer-events-none opacity-40" />
                <img
                  src="/branding/luxuri-banner.jpg"
                  alt="Luxuri Private Travel - Tarjeta de Presentación Oficial"
                  className="w-full h-auto object-cover group-hover:scale-102 transition-transform duration-500"
                />
              </div>

              {/* Floating Pill */}
              <div className="absolute -bottom-5 -left-5 bg-[#0F172A]/90 border border-amber-500/40 backdrop-blur-md p-4 rounded-2xl shadow-2xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider block">
                    Contacto Directo
                  </span>
                  <span className="text-sm font-black text-white">92 28 95 355</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5 Pilares de Servicio */}
      <section className="py-12 bg-[#0B0F19] border-y border-amber-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { title: 'Viajes Privados', icon: <Plane className="w-6 h-6 text-amber-400" />, desc: 'A todo destino con chofer profesional' },
              { title: 'Traslado de Aeropuerto', icon: <Plane className="w-6 h-6 text-amber-400 rotate-45" />, desc: 'Recepción y traslado puntual garantizado' },
              { title: 'Máxima Seguridad', icon: <ShieldCheck className="w-6 h-6 text-amber-400" />, desc: 'Vehículos monitoreados y choferes calificados' },
              { title: 'Autos y Camionetas', icon: <Car className="w-6 h-6 text-amber-400" />, desc: 'Flota moderna, limpia y climatizada' },
              { title: 'Mensajería Express', icon: <Package className="w-6 h-6 text-amber-400" />, desc: 'Envíos locales y nacionales de documentos' },
            ].map((pilar, i) => (
              <div
                key={i}
                className="bg-[#0F172A]/60 border border-slate-800 hover:border-amber-500/30 rounded-2xl p-5 text-center transition-all hover:-translate-y-1"
              >
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-3">
                  {pilar.icon}
                </div>
                <h3 className="font-bold text-white text-sm mb-1">{pilar.title}</h3>
                <p className="text-[11px] text-slate-400 leading-snug">{pilar.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Destinos Interprovinciales */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-widest mb-3">
            <MapPin className="w-4 h-4" />
            <span>Rutas Conectadas</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white">
            También hacemos viajes a:
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Traslados interprovinciales directos sin escalas, seguros y con recojo a domicilio o aeropuerto.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinosInterprovinciales.map((dest, i) => (
            <div
              key={i}
              className="bg-[#0F172A]/40 border border-slate-800 hover:border-amber-500/40 rounded-3xl p-6 transition-all hover:bg-[#0F172A]/70 group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-sm border border-amber-500/20">
                  <MapPin className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                  Acumula Puntos VIP
                </span>
              </div>
              <h3 className="text-xl font-bold text-white group-hover:text-amber-300 transition-colors mb-2">
                {dest.name}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">{dest.desc}</p>
              <a
                href={`https://wa.me/${whatsappNumber}?text=Deseo%20cotizar%20un%20viaje%20privado%20a%20${encodeURIComponent(dest.name)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
              >
                Cotizar viaje <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Tours Turísticos Exclusivos */}
      <section className="py-20 bg-gradient-to-b from-[#0B0F19] to-[#070A11] border-y border-amber-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-widest mb-3">
              <Compass className="w-4 h-4" />
              <span>Turismo de Clase Mundial</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Más destinos y tours
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              Explora los atractivos más representativos de Arequipa y el sur del país a tu propio ritmo.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {tours.map((tour, i) => (
              <div
                key={i}
                className="bg-[#0F172A]/70 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-5 text-center flex flex-col justify-between transition-all hover:-translate-y-1"
              >
                <div>
                  <div className="text-4xl mb-3">{tour.icon}</div>
                  <h3 className="font-bold text-white text-base mb-2">{tour.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{tour.desc}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800">
                  <span className="text-[11px] font-bold text-amber-400">
                    Gana puntos por tour
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sección Mensajería & Otros Servicios */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Mensajería */}
          <div className="bg-gradient-to-br from-amber-950/40 via-[#0F172A] to-[#0B0F19] border border-amber-500/30 rounded-3xl p-8 relative overflow-hidden">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                  NUEVO SERVICIO
                </span>
                <h3 className="text-2xl font-black text-white">Mensajería Express</h3>
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed mb-6">
              Envíos locales y nacionales con entrega rápida, confidencial y segura. Manejamos tus documentos, paquetes y encomiendas urgentes.
            </p>

            <div className="space-y-3 mb-8">
              {[
                'Envíos locales y nacionales',
                'Documentos y paquetes confidenciales',
                'Entregas rápidas y seguras',
                'Rastreo y confirmación de entrega',
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2.5 text-xs text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <a
              href={`https://wa.me/${whatsappNumber}?text=Hola,%20deseo%20solicitar%20el%20servicio%20de%20mensajer%C3%ADa`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-6 py-3 rounded-xl text-xs transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Solicitar Mensajería
            </a>
          </div>

          {/* Otros Servicios Corporativos */}
          <div className="bg-[#0F172A]/40 border border-slate-800 rounded-3xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold">
                <Briefcase className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-blue-400 uppercase tracking-wider block">
                  SOLUCIONES A MEDIDA
                </span>
                <h3 className="text-2xl font-black text-white">Otros Servicios</h3>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {serviciosCorporativos.map((srv, i) => (
                <div key={i} className="bg-white/5 border border-white/5 rounded-2xl p-4">
                  <h4 className="font-bold text-white text-sm mb-1">{srv.title}</h4>
                  <p className="text-xs text-slate-400 leading-snug">{srv.desc}</p>
                </div>
              ))}
            </div>

            <p className="text-xs text-slate-400">
              Contamos con tarifas corporativas especiales y facturación para empresas.
            </p>
          </div>
        </div>
      </section>

      {/* Cómo Funciona el Club de Puntos */}
      <section className="py-20 bg-[#0B0F19] border-t border-amber-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 bg-amber-500/10 text-amber-400 text-xs font-bold px-4 py-1.5 rounded-full border border-amber-500/20 mb-3">
              <Gift className="w-4 h-4" />
              <span>SISTEMA DE PUNTOS & PREMIOS</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              ¿Cómo funciona el Club Luxuri?
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              Convierte tus viajes diarios y traslados de aeropuerto en recompensas directas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Regístrate y recibe tu QR',
                desc: 'Crea tu cuenta con tu celular en 1 minuto. El sistema genera tu código QR digital único de cliente.',
                icon: <QrCode className="w-8 h-8 text-amber-400" />,
              },
              {
                step: '02',
                title: 'Muestra tu código al viajar',
                desc: 'Presenta tu QR al chofer antes de abordar. El personal lo escanea y tus puntos se acreditan al instante según el servicio y monto pagado.',
                icon: <Car className="w-8 h-8 text-amber-400" />,
              },
              {
                step: '03',
                title: 'Canjea viajes y beneficios',
                desc: 'Usa tus puntos acumulados para solicitar descuentos, traslados gratuitos, kits de viajero y promociones exclusivas.',
                icon: <Gift className="w-8 h-8 text-amber-400" />,
              },
            ].map((st, i) => (
              <div
                key={i}
                className="bg-[#0F172A]/60 border border-slate-800 rounded-3xl p-8 relative overflow-hidden text-center group hover:border-amber-500/30 transition-all"
              >
                <span className="text-6xl font-black text-slate-800/40 absolute top-4 right-6 group-hover:text-amber-500/10 transition-colors">
                  {st.step}
                </span>
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-6">
                  {st.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{st.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{st.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/registro"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black px-8 py-3.5 rounded-xl text-sm shadow-xl shadow-amber-500/20"
            >
              Registrarme gratis ahora
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="bg-gradient-to-r from-amber-950/60 via-slate-900 to-amber-950/60 border border-amber-500/30 rounded-3xl p-10 sm:p-14 shadow-2xl">
            <Crown className="w-12 h-12 text-amber-400 mx-auto mb-4" />
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
              ¿Listo para viajar con Luxuri Private Travel?
            </h2>
            <p className="text-slate-300 max-w-xl mx-auto text-sm mb-8 leading-relaxed">
              Reserva tu próximo traslado o afíliate hoy al programa de fidelización más completo de la región sur.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/registro"
                className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-8 py-3.5 rounded-xl text-sm shadow-lg shadow-amber-500/20"
              >
                Crear Mi Cuenta
              </Link>
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold px-8 py-3.5 rounded-xl text-sm border border-slate-700"
              >
                <Phone className="w-4 h-4 text-green-400" />
                Llamar / WhatsApp: 92 28 95 355
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Oficial */}
      <footer className="bg-[#05070D] border-t border-slate-800/80 py-12 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <Crown className="w-5 h-5 text-amber-400" />
                <span className="font-black text-white text-base tracking-wider">
                  LUXURI PRIVATE TRAVEL
                </span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed max-w-md mb-4">
                Del aeropuerto a tu destino ♡. Tu viaje, nuestra prioridad. Transporte privado, traslados interprovinciales, tours y mensajería en Arequipa y todo el sur del Perú.
              </p>
              <p className="text-[11px] text-amber-400/80 font-mono">
                RUC y operaciones autorizadas • Base Central Arequipa, Perú
              </p>
            </div>

            <div>
              <h4 className="font-bold text-white text-sm mb-3">Contacto Directo</h4>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-amber-400" />
                  <a href="tel:51922895355" className="hover:text-white font-mono">
                    92 28 95 355
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-amber-400" />
                  <a href="mailto:luxurycarstravel@gmail.com" className="hover:text-white font-mono">
                    luxurycarstravel@gmail.com
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  <span>Aeropuerto y Terminales de Arequipa</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white text-sm mb-3">Enlaces y Legal</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/terminos" className="hover:text-white">
                    Términos y Condiciones
                  </Link>
                </li>
                <li>
                  <Link href="/privacidad" className="hover:text-white">
                    Política de Privacidad (Ley 29733)
                  </Link>
                </li>
                <li>
                  <Link href="/ingresar" className="hover:text-amber-400 text-amber-300 font-medium">
                    Iniciar Sesión (Portal Único)
                  </Link>
                </li>
                <li>
                  <Link href="/registro" className="hover:text-white">
                    Registrarse en el Club
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
            <p>© {new Date().getFullYear()} LUXURI PRIVATE TRAVEL. Todos los derechos reservados.</p>
            <p className="text-amber-400/80 font-medium">Del aeropuerto a tu destino ♡</p>
          </div>
        </div>
      </footer>

      {/* Botón Flotante de WhatsApp */}
      <a
        href={whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contactar por WhatsApp"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform shadow-green-500/30"
      >
        <MessageCircle className="w-7 h-7 fill-white text-green-500" />
      </a>
    </div>
  )
}
