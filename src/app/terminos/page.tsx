import Link from 'next/link'
import { ArrowLeft, Bus } from 'lucide-react'

export default function TerminosPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="mb-8 flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </Link>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Bus className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Términos y Condiciones</h1>
              <p className="text-gray-500 text-sm">Programa de Fidelización Luxuri Private Travel</p>
            </div>
          </div>
          <div className="prose prose-blue max-w-none text-gray-600 space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">1. Aceptación de los términos</h2>
              <p>Al registrarse en el programa de fidelización Luxuri Private Travel, el usuario acepta cumplir con los presentes Términos y Condiciones.</p>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">2. Elegibilidad</h2>
              <p>Pueden participar en el programa personas naturales mayores de 18 años con un número de celular válido en Perú.</p>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">3. Acumulación de puntos</h2>
              <p>Los puntos se acreditan por cada servicio de transporte completado. Las tasas de acumulación son configurables y pueden variar según la categoría del servicio y el monto pagado.</p>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">4. Canjes</h2>
              <p>Las solicitudes de canje requieren aprobación administrativa. Los puntos reservados para una solicitud pendiente no estarán disponibles para otros canjes hasta que la solicitud sea resuelta.</p>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">5. Vigencia</h2>
              <p>La empresa se reserva el derecho de modificar, suspender o cancelar el programa con previo aviso a los participantes.</p>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">6. Uso del PIN</h2>
              <p>El usuario es responsable de mantener la confidencialidad de su PIN. Se recomienda no compartirlo con terceros.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
