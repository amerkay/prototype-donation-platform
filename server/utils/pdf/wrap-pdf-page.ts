/**
 * Wraps a template fragment in a full HTML page for Puppeteer PDF generation.
 *
 * The fragment is rendered at PREVIEW_WIDTH_PX and scaled up to fill the A4 page,
 * so it looks identical to the Vue preview component.
 */

import { getScaleFactor, getContentHeight, PREVIEW_WIDTH_PX } from './templates/styles'
import { getBunnyFontUrl } from '~~/app/features/settings/admin/utils/fonts'

interface WrapOptions {
  orientation: 'portrait' | 'landscape'
  fontFamily?: string
  baseUrl: string
}

export function wrapInPdfPage(fragment: string, options: WrapOptions): string {
  const { orientation, fontFamily, baseUrl } = options
  const isLandscape = orientation === 'landscape'
  const pageWidth = isLandscape ? '297mm' : '210mm'
  const pageHeight = isLandscape ? '210mm' : '297mm'
  const scale = getScaleFactor(orientation)
  const contentHeight = getContentHeight(orientation)

  const fontLink = fontFamily
    ? `<link href="${getBunnyFontUrl(fontFamily)}" rel="stylesheet" />`
    : ''

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
      width: ${PREVIEW_WIDTH_PX}px;
      height: ${contentHeight}px;
      transform: scale(${scale.toFixed(4)});
      transform-origin: top left;
      overflow: hidden;
    }
  </style>
  ${fontLink}
</head>
<body>
  <div class="page">
    <div class="content">
      ${fragment}
    </div>
  </div>
</body>
</html>`
}
