/**
 * Wraps a template fragment in a full HTML page for Puppeteer PDF generation.
 *
 * The fragment is rendered at a canonical A4 CSS pixel geometry so
 * preview and PDF use the same layout metrics.
 */

import { getBunnyFontUrls } from '~~/app/features/settings/admin/utils/fonts'
import {
  getCertificateRenderGeometry,
  getCertificateContentGeometry
} from '~~/app/features/templates/admin/builders/render-geometry'

interface WrapOptions {
  orientation: 'portrait' | 'landscape'
  fontFamilies?: string[]
  baseUrl: string
}

export function wrapInPdfPage(fragment: string, options: WrapOptions): string {
  const { orientation, fontFamilies, baseUrl } = options
  const isLandscape = orientation === 'landscape'
  const pageWidth = isLandscape ? '297mm' : '210mm'
  const pageHeight = isLandscape ? '210mm' : '297mm'
  const { canvasWidthPx, canvasHeightPx } = getCertificateRenderGeometry(orientation)
  const { widthPx: contentWidthPx, heightPx: contentHeightPx } =
    getCertificateContentGeometry(orientation)
  const contentScale = canvasWidthPx / contentWidthPx

  const fontLinks = getBunnyFontUrls(fontFamilies ?? [])
    .map((href) => `<link href="${href}" rel="stylesheet" />`)
    .join('\n  ')

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <base href="${baseUrl}/" />
  <style>
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: system-ui, -apple-system, sans-serif;
      -webkit-font-smoothing: antialiased;
      color: #000;
    }
    img {
      max-width: 100%;
      display: block;
    }
    @page {
      size: ${pageWidth} ${pageHeight};
      margin: 0;
    }
    html, body {
      width: ${pageWidth};
      height: ${pageHeight};
      margin: 0;
      padding: 0;
    }
    .page {
      width: ${pageWidth};
      height: ${pageHeight};
      overflow: hidden;
    }
    .content {
      width: ${canvasWidthPx}px;
      height: ${canvasHeightPx}px;
      overflow: hidden;
    }
    .content-inner {
      width: ${contentWidthPx}px;
      height: ${contentHeightPx}px;
      transform: scale(${contentScale.toFixed(4)});
      transform-origin: top left;
      overflow: hidden;
    }
  </style>
  ${fontLinks}
</head>
<body>
  <div class="page">
    <div class="content">
      <div class="content-inner">
        ${fragment}
      </div>
    </div>
  </div>
</body>
</html>`
}
