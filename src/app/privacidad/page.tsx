import Link from 'next/link'
import { ArrowLeft, Shield } from 'lucide-react'

export default function PrivacidadPage() {
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
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Política de Privacidad</h1>
              <p className="text-gray-500 text-sm">Protección de datos personales - Ley 29733</p>
            </div>
          </div>
          <div className="prose prose-blue max-w-none text-gray-600 space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">1. Responsable del tratamiento</h2>
              <p>Luxuri Private Travel es responsable del banco de datos personales denominado "Programa de Fidelización", debidamente registrado ante la ANPD conforme a la Ley N° 29733, Ley de Protección de Datos Personales del Perú.</p>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">2. Datos que recopilamos</h2>
              <p>Recopilamos: nombres y apellidos, número de celular, correo electrónico (opcional), fecha de nacimiento (opcional), historial de servicios de transporte utilizados.</p>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">3. Finalidad del tratamiento</h2>
              <p>Los datos son utilizados exclusivamente para: gestionar su participación en el programa de fidelización, acreditar puntos por servicios de transporte, enviar comunicaciones relacionadas con el programa (con su consentimiento).</p>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">4. Derechos ARCOP</h2>
              <p>Conforme a la Ley 29733, usted tiene derecho de Acceso, Rectificación, Cancelación, Oposición y Portabilidad de sus datos. Para ejercerlos contacte a: privacidad@transportclub.pe</p>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">5. Seguridad</h2>
              <p>Implementamos medidas técnicas y organizativas apropiadas para proteger sus datos personales contra acceso no autorizado, pérdida o alteración.</p>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">6. Comunicaciones promocionales</h2>
              <p>Solo enviaremos comunicaciones promocionales si usted otorgó su consentimiento expreso durante el registro. Puede revocar este consentimiento en cualquier momento desde su perfil.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
