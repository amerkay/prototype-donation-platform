/// <reference lib="dom" />
import type { PDFOptions } from 'puppeteer-core'

interface NavigatePdfOptions extends Partial<PDFOptions> {
  /** URL to navigate to for rendering */
  url: string
}

interface SetContentPdfOptions extends Partial<PDFOptions> {
  /** HTML content to render directly */
  html: string
}

type GeneratePdfOptions = NavigatePdfOptions | SetContentPdfOptions

function isNavigateOptions(opts: GeneratePdfOptions): opts is NavigatePdfOptions {
  return 'url' in opts && typeof opts.url === 'string'
}

/**
 * Generate a PDF buffer using Puppeteer + Chromium.
 *
 * Supports two modes:
 * 1. URL navigation: Puppeteer navigates to a URL (preferred for Vue SFC rendering)
 * 2. HTML content: Puppeteer sets HTML content directly (legacy mode for receipts)
 *
 * Uses @sparticuz/chromium for serverless environments (Netlify, AWS Lambda).
 * For local development, set CHROME_EXECUTABLE_PATH to your local Chrome path.
 */
export async function generatePdf(options: GeneratePdfOptions): Promise<Buffer> {
  const chromium = await import('@sparticuz/chromium')
  const puppeteer = await import('puppeteer-core')

  // Use local Chrome for development, @sparticuz/chromium for serverless
  const executablePath =
    process.env.CHROME_EXECUTABLE_PATH || (await chromium.default.executablePath())

  const browser = await puppeteer.default.launch({
    args: chromium.default.args,
    executablePath,
    headless: true
  })

  try {
    const page = await browser.newPage()

    if (isNavigateOptions(options)) {
      // Navigate to URL for Vue SFC rendering
      await page.goto(options.url, { waitUntil: 'networkidle0' })
    } else {
      // Set HTML content directly (legacy mode)
      await page.setContent(options.html, { waitUntil: 'networkidle0' })
    }

    // Wait for fonts to load
    await page.evaluate(async () => {
      if ('fonts' in document) {
        await document.fonts.ready
      }

      // Wait for all images to load
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

    // Run adaptive text fitter if available (certificate only)
    await page.evaluate(() => {
      const fitter = (
        window as Window & {
          __fitCertificateAdaptiveText?: (root?: ParentNode) => void
        }
      ).__fitCertificateAdaptiveText
      fitter?.(document)
    })

    // Wait for layout stabilization
    await page.evaluate(
      () =>
        new Promise<void>((resolve) => {
          requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
        })
    )

    const { url, html, ...pdfOptions } = options as NavigatePdfOptions & SetContentPdfOptions

    const pdfBuffer = await page.pdf({
      printBackground: true,
      preferCSSPageSize: true,
      ...pdfOptions
    })

    return Buffer.from(pdfBuffer)
  } finally {
    await browser.close()
  }
}
