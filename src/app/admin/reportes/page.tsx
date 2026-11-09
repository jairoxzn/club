'use client'

import React, { useState, useEffect } from 'react'
import {
  FileBarChart,
  Download,
  Filter,
  Calendar,
  RefreshCw,
  FileSpreadsheet,
  FileText,
  Users,
  Bus,
  Coins,
  Gift,
  Crown,
} from 'lucide-react'
import { exportToExcel, exportToCSV } from '@/lib/export'
import { formatCurrency, formatPoints, formatDate } from '@/lib/utils'
import { toast } from 'sonner'

type ReportType = 'services' | 'customers' | 'points' | 'redemptions'

export default function AdminReportesPage() {
  const [reportType, setReportType] = useState<ReportType>('services')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [reportData, setReportData] = useState<any[]>([])

  const fetchReport = async () => {
    setIsLoading(true)
    try {
      if (reportType === 'services') {
        let url = '/api/servicios'
        const params = new URLSearchParams()
        if (startDate) params.append('startDate', startDate)
        if (endDate) params.append('endDate', endDate)
        if (params.toString()) url += `?${params.toString()}`

        const res = await fetch(url)
        const data = await res.json()
        setReportData(data.services || [])
      } else if (reportType === 'customers') {
        const res = await fetch('/api/admin/clientes')
        const data = await res.json()
        setReportData(data.customers || [])
      } else if (reportType === 'redemptions') {
        const res = await fetch('/api/admin/canjes')
        const data = await res.json()
        setReportData(data.redemptions || [])
      } else if (reportType === 'points') {
        const res = await fetch('/api/servicios')
        const data = await res.json()
        setReportData(data.services || [])
      }
    } catch (err) {
      console.error(err)
      toast.error('Error al generar reporte')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchReport()
  }, [reportType])

  const handleExportExcel = () => {
    if (reportData.length === 0) {
      toast.error('No hay datos para exportar')
      return
    }

    if (reportType === 'services') {
      exportToExcel(
        reportData,
        [
          { header: 'Fecha', key: (s: any) => formatDate(s.serviceDate || s.createdAt) },
          { header: 'Cliente', key: (s: any) => `${s.customer?.firstName} ${s.customer?.lastName}` },
          { header: 'Código Cliente', key: (s: any) => s.customer?.customerCode },
          { header: 'Celular', key: (s: any) => s.customer?.phone },
          { header: 'Categoría', key: (s: any) => s.category?.name },
          { header: 'Boleto / Ref', key: 'referenceNumber' },
          { header: 'Monto (S/)', key: 'amount' },
          { header: 'Puntos Otorgados', key: 'pointsAwarded' },
          { header: 'Estado', key: 'status' },
          { header: 'Operador', key: (s: any) => s.staff?.username || s.staff?.email },
        ],
        `servicios_luxuri_${new Date().toISOString().split('T')[0]}`
      )
    } else if (reportType === 'customers') {
      exportToExcel(
        reportData,
        [
          { header: 'Código VIP', key: 'customerCode' },
          { header: 'Nombres', key: 'firstName' },
          { header: 'Apellidos', key: 'lastName' },
          { header: 'Celular', key: 'phone' },
          { header: 'Email', key: 'email' },
          { header: 'Puntos Disponibles', key: 'availablePoints' },
          { header: 'Puntos Reservados', key: 'reservedPoints' },
          { header: 'Total Acumulado', key: 'totalPoints' },
          { header: 'Fecha Registro', key: (c: any) => formatDate(c.createdAt) },
        ],
        `clientes_vip_luxuri_${new Date().toISOString().split('T')[0]}`
      )
    } else if (reportType === 'redemptions') {
      exportToExcel(
        reportData,
        [
          { header: 'Fecha Solicitud', key: (r: any) => formatDate(r.requestedAt || r.createdAt) },
          { header: 'Cliente', key: (r: any) => `${r.customer?.firstName} ${r.customer?.lastName}` },
          { header: 'Código Cliente', key: (r: any) => r.customer?.customerCode },
          { header: 'Premio', key: (r: any) => r.reward?.name },
          { header: 'Puntos Redimidos', key: 'pointsUsed' },
          { header: 'Código Validación', key: 'validationCode' },
          { header: 'Estado', key: 'status' },
          { header: 'Motivo Rechazo', key: 'rejectionReason' },
        ],
        `canjes_luxuri_${new Date().toISOString().split('T')[0]}`
      )
    }
    toast.success('Archivo Excel descargado exitosamente')
  }

  const handleExportCSV = () => {
    if (reportData.length === 0) {
      toast.error('No hay datos para exportar')
      return
    }

    if (reportType === 'services') {
      exportToCSV(
        reportData,
        [
          { header: 'Fecha', key: (s: any) => formatDate(s.serviceDate || s.createdAt) },
          { header: 'Cliente', key: (s: any) => `${s.customer?.firstName} ${s.customer?.lastName}` },
          { header: 'Codigo', key: (s: any) => s.customer?.customerCode },
          { header: 'Categoria', key: (s: any) => s.category?.name },
          { header: 'Monto', key: 'amount' },
          { header: 'Puntos', key: 'pointsAwarded' },
        ],
        `servicios_luxuri_${new Date().toISOString().split('T')[0]}`
      )
    } else {
      exportToCSV(
        reportData,
        [
          { header: 'Codigo', key: 'customerCode' },
          { header: 'Cliente', key: (c: any) => `${c.firstName} ${c.lastName}` },
          { header: 'Celular', key: 'phone' },
          { header: 'PuntosDisponibles', key: 'availablePoints' },
          { header: 'TotalAcumulado', key: 'totalPoints' },
        ],
        `clientes_luxuri_${new Date().toISOString().split('T')[0]}`
      )
    }
    toast.success('Archivo CSV exportado exitosamente')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <FileBarChart className="w-7 h-7 text-amber-400" />
            Reportes & Exportación de Datos
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Genera auditorías y exporta información operativa en formatos estándar (Excel y CSV) de <span className="text-amber-400 font-semibold">Luxuri Private Travel</span>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="inline-flex items-center gap-2 bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-amber-500/20 transition-all active:scale-95"
          >
            <FileSpreadsheet className="w-4 h-4 text-slate-950" />
            Descargar Excel (.xlsx)
          </button>
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 bg-[#121827] hover:bg-[#1A2234] border border-amber-500/20 text-slate-200 hover:text-white font-bold text-xs px-3.5 py-2.5 rounded-xl transition-all"
          >
            <Download className="w-4 h-4 text-amber-400" />
            CSV
          </button>
        </div>
      </div>

      {/* Selector de Tipo de Reporte Black & Gold */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          onClick={() => setReportType('services')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            reportType === 'services'
              ? 'bg-[#121827] border-amber-400 ring-1 ring-amber-400/40 shadow-lg'
              : 'bg-[#0B0F19] border-amber-500/20 hover:border-amber-500/40'
          }`}
        >
          <div className="flex items-center gap-2 font-bold text-white mb-1 text-sm">
            <Bus className="w-4 h-4 text-amber-400" />
            Servicios Realizados
          </div>
          <p className="text-xs text-slate-400">Historial de traslados, montos y puntos otorgados</p>
        </button>

        <button
          onClick={() => setReportType('customers')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            reportType === 'customers'
              ? 'bg-[#121827] border-amber-400 ring-1 ring-amber-400/40 shadow-lg'
              : 'bg-[#0B0F19] border-amber-500/20 hover:border-amber-500/40'
          }`}
        >
          <div className="flex items-center gap-2 font-bold text-white mb-1 text-sm">
            <Users className="w-4 h-4 text-amber-400" />
            Clientes VIP Registrados
          </div>
          <p className="text-xs text-slate-400">Padrón de pasajeros, saldos y actividad</p>
        </button>

        <button
          onClick={() => setReportType('redemptions')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            reportType === 'redemptions'
              ? 'bg-[#121827] border-amber-400 ring-1 ring-amber-400/40 shadow-lg'
              : 'bg-[#0B0F19] border-amber-500/20 hover:border-amber-500/40'
          }`}
        >
          <div className="flex items-center gap-2 font-bold text-white mb-1 text-sm">
            <Gift className="w-4 h-4 text-amber-400" />
            Canjes de Recompensas
          </div>
          <p className="text-xs text-slate-400">Solicitudes, entregas y códigos de validación</p>
        </button>
      </div>

      {/* Filtros de Fecha para Servicios Black & Gold */}
      {reportType === 'services' && (
        <div className="bg-[#0B0F19] rounded-2xl p-4 border border-amber-500/20 shadow-xl flex flex-wrap items-center gap-3">
          <span className="text-xs font-bold text-slate-300">Rango de Fechas:</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-1.5 text-xs bg-[#121827] border border-amber-500/20 rounded-xl text-white focus:outline-hidden focus:border-amber-400"
            title="Desde"
          />
          <span className="text-xs text-slate-500">hasta</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-1.5 text-xs bg-[#121827] border border-amber-500/20 rounded-xl text-white focus:outline-hidden focus:border-amber-400"
            title="Hasta"
          />
          <button
            onClick={fetchReport}
            className="px-4 py-1.5 bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs transition-all shadow-md shadow-amber-500/20"
          >
            Filtrar
          </button>
        </div>
      )}

      {/* Previsualización de Datos Black & Gold */}
      <div className="bg-[#0B0F19] rounded-2xl border border-amber-500/20 shadow-xl overflow-hidden">
        <div className="p-4 border-b border-amber-500/10 flex items-center justify-between bg-[#070A11]/60">
          <span className="font-bold text-white text-sm">
            Vista Previa ({reportData.length} registros)
          </span>
          <button
            onClick={fetchReport}
            className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Recargar
          </button>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-slate-400 text-sm flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
            Generando reporte...
          </div>
        ) : reportData.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            No hay registros para mostrar con los filtros seleccionados.
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[500px]">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#121827] sticky top-0 uppercase font-bold text-slate-400 border-b border-amber-500/10">
                <tr>
                  {reportType === 'services' ? (
                    <>
                      <th className="px-4 py-3">Fecha</th>
                      <th className="px-4 py-3">Cliente</th>
                      <th className="px-4 py-3">Categoría</th>
                      <th className="px-4 py-3">Boleto</th>
                      <th className="px-4 py-3">Monto</th>
                      <th className="px-4 py-3">Puntos</th>
                      <th className="px-4 py-3">Estado</th>
                    </>
                  ) : reportType === 'customers' ? (
                    <>
                      <th className="px-4 py-3">Código VIP</th>
                      <th className="px-4 py-3">Cliente</th>
                      <th className="px-4 py-3">Celular</th>
                      <th className="px-4 py-3">Puntos Disp.</th>
                      <th className="px-4 py-3">Total Acumulado</th>
                      <th className="px-4 py-3">Registrado</th>
                    </>
                  ) : (
                    <>
                      <th className="px-4 py-3">Fecha</th>
                      <th className="px-4 py-3">Cliente</th>
                      <th className="px-4 py-3">Premio</th>
                      <th className="px-4 py-3">Puntos</th>
                      <th className="px-4 py-3">Código</th>
                      <th className="px-4 py-3">Estado</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-500/10">
                {reportData.slice(0, 50).map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#121827]/70 transition-colors">
                    {reportType === 'services' ? (
                      <>
                        <td className="px-4 py-3 text-slate-400">{formatDate(row.serviceDate || row.createdAt)}</td>
                        <td className="px-4 py-3 font-bold text-white">{row.customer?.firstName} {row.customer?.lastName}</td>
                        <td className="px-4 py-3 text-amber-300">{row.category?.name}</td>
                        <td className="px-4 py-3 font-mono">{row.referenceNumber || '-'}</td>
                        <td className="px-4 py-3 font-black text-white">{formatCurrency(row.amount)}</td>
                        <td className="px-4 py-3 font-black text-amber-400">+{row.pointsAwarded}</td>
                        <td className="px-4 py-3 text-emerald-400 font-bold">{row.status}</td>
                      </>
                    ) : reportType === 'customers' ? (
                      <>
                        <td className="px-4 py-3 font-mono text-amber-400 font-black">{row.customerCode}</td>
                        <td className="px-4 py-3 font-bold text-white">{row.firstName} {row.lastName}</td>
                        <td className="px-4 py-3 font-mono">{row.phone}</td>
                        <td className="px-4 py-3 font-black text-amber-400">{row.availablePoints} pts</td>
                        <td className="px-4 py-3 font-bold text-white">{row.totalPoints} pts</td>
                        <td className="px-4 py-3 text-slate-400">{formatDate(row.createdAt)}</td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-3 text-slate-400">{formatDate(row.requestedAt || row.createdAt)}</td>
                        <td className="px-4 py-3 font-bold text-white">{row.customer?.firstName} {row.customer?.lastName}</td>
                        <td className="px-4 py-3 font-bold text-slate-200">{row.reward?.name}</td>
                        <td className="px-4 py-3 font-black text-amber-400">{row.pointsUsed} pts</td>
                        <td className="px-4 py-3 font-mono text-emerald-400 font-black">{row.validationCode || '-'}</td>
                        <td className="px-4 py-3 font-bold text-amber-300">{row.status}</td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
