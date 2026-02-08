interface ExportColumn {
  key: string
  header: string
}

interface ExportOptions {
  data: Record<string, unknown>[]
  columns: ExportColumn[]
  format: 'csv' | 'xlsx'
  filename: string
}

export function useExport() {
  const isExporting = ref(false)

  async function exportData(options: ExportOptions) {
    isExporting.value = true
    try {
      const response = await $fetch('/api/export', {
        method: 'POST',
        body: options,
        responseType: 'blob'
      })

      const blob = response as unknown as Blob
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${options.filename}.${options.format}`
      link.click()
      URL.revokeObjectURL(url)
    } finally {
      isExporting.value = false
    }
  }

  return { isExporting, exportData }
}
