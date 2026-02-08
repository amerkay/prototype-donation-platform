import ExcelJS from 'exceljs'

interface ExportColumn {
  key: string
  header: string
}

interface ExportBody {
  data: Record<string, unknown>[]
  columns: ExportColumn[]
  format: 'csv' | 'xlsx'
  filename: string
}

function escapeCSV(value: unknown): string {
  const str = String(value ?? '')
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export default defineEventHandler(async (event) => {
  const body = await readBody<ExportBody>(event)
  const { data, columns, format, filename } = body

  if (format === 'csv') {
    const header = columns.map((c) => escapeCSV(c.header)).join(',')
    const rows = data.map((row) => columns.map((c) => escapeCSV(row[c.key])).join(','))
    const csv = [header, ...rows].join('\n')

    setResponseHeaders(event, {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}.csv"`
    })
    return csv
  }

  // XLSX
  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet('Export')

  sheet.columns = columns.map((c) => ({
    header: c.header,
    key: c.key,
    width: Math.max(c.header.length + 4, 15)
  }))

  // Style header row
  const headerRow = sheet.getRow(1)
  headerRow.font = { bold: true }
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFF3F4F6' }
  }

  for (const row of data) {
    sheet.addRow(
      columns.reduce<Record<string, unknown>>((acc, c) => {
        acc[c.key] = row[c.key]
        return acc
      }, {})
    )
  }

  const buffer = await workbook.xlsx.writeBuffer()

  setResponseHeaders(event, {
    'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'Content-Disposition': `attachment; filename="${filename}.xlsx"`
  })
  return buffer
})
