import type { PDFOptions } from 'puppeteer-core'

/**
 * Generate a PDF buffer from an HTML string using Puppeteer + Chromium.
 *
 * Uses @sparticuz/chromium for a lightweight Chromium binary that works
 * in serverless environments (~50MB compressed vs ~280MB full Chrome).
 */
export async function generatePdf(html: string, options?: Partial<PDFOptions>): Promise<Buffer> {
  const chromium = await import('@sparticuz/chromium')
  const puppeteer = await import('puppeteer-core')

  const browser = await puppeteer.default.launch({
    args: chromium.default.args,
    executablePath: await chromium.default.executablePath(),
    headless: true
  })

  try {
    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'networkidle0' })

    const pdfBuffer = await page.pdf({
      printBackground: true,
      preferCSSPageSize: true,
      ...options
    })

    return Buffer.from(pdfBuffer)
  } finally {
    await browser.close()
  }
}
