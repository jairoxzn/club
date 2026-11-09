'use client'

import React, { useState, useEffect } from 'react'
import {
  ShieldAlert,
  Search,
  RefreshCw,
} from 'lucide-react'
import { formatDateTime } from '@/lib/utils'

export default function AdminAuditoriaPage() {
  const [logs, setLogs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLog, setSelectedLog] = useState<any>(null)

  const fetchLogs = () => {
    setIsLoading(true)
    fetch('/api/admin/auditoria')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.logs) {
          setLogs(data.logs)
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    fetchLogs()
  }, [])

  const filteredLogs = logs.filter((log) => {
    if (!searchTerm) return true
    const term = searchTerm.toLowerCase()
    const action = (log.action || '').toLowerCase()
    const user = (log.user?.username || log.user?.email || '').toLowerCase()
    const entity = (log.entityType || '').toLowerCase()
    return action.includes(term) || user.includes(term) || entity.includes(term)
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <ShieldAlert className="w-7 h-7 text-amber-400" />
            Auditoría del Sistema
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Bitácora inmutable de eventos, autenticación, acreditaciones y cambios de configuración en <span className="text-amber-400 font-semibold">Luxuri Private Travel</span>.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="inline-flex items-center gap-1.5 text-xs font-bold bg-[#0B0F19] border border-amber-500/20 text-slate-200 hover:text-amber-300 px-4 py-2 rounded-xl hover:bg-[#121827] shadow-lg transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
          Actualizar
        </button>
      </div>

      {/* Buscador Black & Gold */}
      <div className="bg-[#0B0F19] rounded-2xl p-4 border border-amber-500/20 shadow-xl">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filtrar por acción, usuario o entidad afectada..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-[#121827] border border-amber-500/20 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400"
          />
        </div>
      </div>

      {/* Tabla de Logs Black & Gold */}
      <div className="bg-[#0B0F19] rounded-2xl border border-amber-500/20 shadow-xl overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400 text-sm flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
            Cargando logs de auditoría...
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            No se han registrado eventos de auditoría aún.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#121827] uppercase font-bold text-slate-400 border-b border-amber-500/10">
                <tr>
                  <th className="px-5 py-3.5">Fecha y Hora</th>
                  <th className="px-5 py-3.5">Usuario Responsable</th>
                  <th className="px-5 py-3.5">Acción</th>
                  <th className="px-5 py-3.5">Entidad Afectada</th>
                  <th className="px-5 py-3.5">IP</th>
                  <th className="px-5 py-3.5 text-right">Detalles</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-500/10">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#121827]/70 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-slate-400 whitespace-nowrap">
                      {formatDateTime(log.createdAt)}
                    </td>
                    <td className="px-5 py-3.5 font-bold text-white whitespace-nowrap">
                      {log.user?.username || log.user?.email || 'Sistema'}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className="font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-200 whitespace-nowrap">
                      {log.entityType} {log.entityId ? `#${log.entityId.slice(0, 8)}` : ''}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-slate-500 whitespace-nowrap">
                      {log.ipAddress || '127.0.0.1'}
                    </td>
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      {(log.oldValues || log.newValues) && (
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="text-amber-400 hover:text-amber-300 font-bold hover:underline"
                        >
                          Ver JSON
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Detalle JSON Black & Gold */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="bg-[#0B0F19] rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-amber-500/30 text-white">
            <div className="flex items-center justify-between pb-4 border-b border-amber-500/10">
              <h3 className="font-bold text-white text-sm">
                Auditoría: {selectedLog.action}
              </h3>
              <button onClick={() => setSelectedLog(null)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs max-h-[60vh] overflow-y-auto">
              {selectedLog.oldValues && (
                <div>
                  <span className="font-bold text-slate-300 block mb-1">Valores Anteriores:</span>
                  <pre className="p-3 bg-[#070A11] text-rose-300 rounded-xl overflow-x-auto font-mono text-[11px] border border-amber-500/10">
                    {JSON.stringify(selectedLog.oldValues, null, 2)}
                  </pre>
                </div>
              )}
              {selectedLog.newValues && (
                <div>
                  <span className="font-bold text-slate-300 block mb-1">Valores Nuevos:</span>
                  <pre className="p-3 bg-[#070A11] text-amber-300 rounded-xl overflow-x-auto font-mono text-[11px] border border-amber-500/10">
                    {JSON.stringify(selectedLog.newValues, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 text-xs font-bold bg-[#121827] hover:bg-[#1A2234] border border-amber-500/20 text-slate-200 rounded-xl"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
