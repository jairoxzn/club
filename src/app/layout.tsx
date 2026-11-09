import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'sonner'

export const metadata: Metadata = {
  title: {
    default: 'Luxuri Private Travel - Club de Fidelización',
    template: '%s | Luxuri Private Travel',
  },
  description:
    'Del aeropuerto a tu destino. Traslados privados, interprovinciales, tours y mensajería en Arequipa y el sur del Perú. Acumula puntos y canjea viajes y recompensas exclusivas.',
  keywords: [
    'Luxuri Private Travel',
    'traslado aeropuerto arequipa',
    'viajes privados',
    'tours arequipa',
    'colca',
    'ruta del sillar',
    'fidelizacion',
    'puntos',
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className="dark">
      <body className="antialiased bg-[#070A11] text-slate-100 min-h-screen">
        {children}
        <Toaster richColors position="top-right" theme="dark" />
      </body>
    </html>
  )
}
