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
    await page.evaluate(async () => {
      if ('fonts' in document) {
        await document.fonts.ready
      }

      const images = Array.from(document.images)
      await Promise.all(
        images.map((img) => {
          if (img.complete) return Promise.resolve()
          return new Promise<void>((resolve) => {
            img.addEventListener('load', () => resolve(), { once: true })
            img.addEventListener('error', () => resolve(), { once: true })
          })
        })
      )
    })

    await page.evaluate(() => {
      const fitter = (
        window as Window & {
          __fitCertificateAdaptiveText?: (root?: ParentNode) => void
        }
      ).__fitCertificateAdaptiveText
      fitter?.(document)
    })

    await page.evaluate(
      () =>
        new Promise<void>((resolve) => {
          requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
        })
    )

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
