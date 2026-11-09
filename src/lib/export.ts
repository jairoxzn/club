import * as XLSX from 'xlsx'
import Papa from 'papaparse'

export interface ExportColumn<T> {
  header: string
  key: keyof T | ((item: T) => any)
}

/**
 * Exporta un conjunto de datos a un archivo Excel (.xlsx) y dispara la descarga en el navegador.
 */
export function exportToExcel<T>(
  data: T[],
  columns: ExportColumn<T>[],
  filename: string = 'reporte.xlsx'
) {
  const formattedData = data.map((item) => {
    const row: Record<string, any> = {}
    columns.forEach((col) => {
      row[col.header] = typeof col.key === 'function' ? col.key(item) : item[col.key]
    })
    return row
  })

  const worksheet = XLSX.utils.json_to_sheet(formattedData)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Reporte')
  
  // Guardar archivo
  XLSX.writeFile(workbook, filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`)
}

/**
 * Exporta un conjunto de datos a un archivo CSV y dispara la descarga en el navegador con soporte UTF-8 BOM.
 */
export function exportToCSV<T>(
  data: T[],
  columns: ExportColumn<T>[],
  filename: string = 'reporte.csv'
) {
  const formattedData = data.map((item) => {
    const row: Record<string, any> = {}
    columns.forEach((col) => {
      row[col.header] = typeof col.key === 'function' ? col.key(item) : item[col.key]
    })
    return row
  })

  const csv = Papa.unparse(formattedData)
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

