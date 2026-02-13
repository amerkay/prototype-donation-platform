# Templates Feature

PDF and print templates for certificates and receipts using a model-driven Vue SFC architecture.

## Architecture

**Print route + model-driven SFC + Puppeteer-core + @sparticuz/chromium in Nitro endpoint.**

### Why This Architecture

- **Single source of truth:** Preview and PDF output render the exact same Vue components via the browser engine
- **Avoids Nitro `.vue` import issues:** No fighting with Rollup config for SFC imports in server routes
- **Netlify-compatible:** Puppeteer-core + @sparticuz/chromium works in serverless environments
- **Tailwind stays simple:** Static classes for layout, CSS variables for dynamic theming (no safelist pain)

### How It Works

```
┌───────────────────┐     ┌────────────────────┐     ┌─────────────────┐
│  Admin Preview    │     │   Print Route      │     │  Nitro Endpoint │
│                   │     │                    │     │                 │
│ CertificatePreview│     │ /print/certificate │     │ /api/pdf.post   │
│ ReceiptPreview    │     │ /print/receipt     │     │                 │
└────────┬──────────┘     └────────┬───────────┘     └────────┬────────┘
         │                         │                          │
         ▼                         ▼                          │
┌──────────────────────────────────────────┐                  │
│         Shared Layout Components         │◄─────────────────┘
│                                          │  Puppeteer navigates
│  CertificateLayout / ReceiptLayout       │  to print route
│  (Vue SFC with model prop)               │
└──────────────────────────────────────────┘
```

## Directory Structure

```
app/features/templates/
├── admin/                          # Admin configuration
│   ├── components/
│   │   ├── CertificatePreview.vue  # Live preview with edit overlay
│   │   ├── CertificateTemplateConfig.vue
│   │   ├── ReceiptPreview.vue
│   │   └── ReceiptTemplateConfig.vue
│   ├── composables/
│   │   ├── useGeneratePdf.ts       # PDF download composable
│   │   └── usePreviewEditable.ts   # Click-to-edit preview fields
│   ├── forms/                      # Form definitions
│   ├── stores/                     # Pinia stores for template config
│   ├── types.ts                    # Admin config types
│   └── utils/
│       ├── page-geometry.ts        # A4 page dimensions (CSS px)
│       └── template-rich-text.ts   # Rich text sanitization + variables
│
├── shared/                         # Used by both admin preview and print
│   ├── components/
│   │   ├── certificate/
│   │   │   ├── CertificateLayout.vue    # Router (portrait/landscape)
│   │   │   ├── CertificatePortrait.vue  # Portrait layout
│   │   │   ├── CertificateLandscape.vue # Landscape layout (compact)
│   │   │   └── sections/                # Reusable section components
│   │   │       ├── CertBackground.vue
│   │   │       ├── CertBody.vue
│   │   │       ├── CertBottomRow.vue
│   │   │       ├── CertDate.vue
│   │   │       ├── CertDonorName.vue
│   │   │       ├── CertFooter.vue
│   │   │       ├── CertLogo.vue
│   │   │       ├── CertProduct.vue
│   │   │       ├── CertSeparator.vue
│   │   │       ├── CertSignature.vue
│   │   │       ├── CertSubtitle.vue
│   │   │       └── CertTitle.vue
│   │   └── receipt/
│   │       └── ReceiptLayout.vue
│   ├── composables/
│   │   ├── useAdaptiveText.ts      # Font shrinking for long names
│   │   └── useCertificateColors.ts # Color resolution logic
│   └── types.ts                    # Shared model types
│
└── README.md
```

## Key Concepts

### 1. Model-Driven Components

Layout components accept a `model` prop containing all render data:

```typescript
interface CertificateModel {
  layout: 'portrait-classic' | 'landscape-classic'
  branding: { logoUrl, primaryColor, fontFamily, ... }
  design: { pageBorderStyle, backgroundImage, ... }
  header: { showLogo, title, titleTextColor, ... }
  subtitleHtml: string  // Pre-sanitized HTML
  bodyHtml: string      // Pre-sanitized HTML
  product?: { name, image, imageShape }
  donorName?: { value, fontFamily, position }
  date?: { value }
  signature?: { name, title, fontFamily }
  footer?: { text }
}
```

### 2. Print Routes

Dedicated pages for Puppeteer to render:

- `/print/certificate?token=xxx` - Certificate PDF
- `/print/receipt?token=xxx` - Receipt PDF

These use a minimal `print` layout and fetch model data via a short-lived token.

### 3. PDF Generation Flow

```
1. Client calls POST /api/pdf with template data
2. Server builds model, stores with temporary token
3. Puppeteer navigates to /print/{type}?token=xxx
4. Print page fetches model, renders Vue component
5. Puppeteer waits for fonts/images, runs adaptive text
6. Puppeteer exports PDF buffer
7. Server returns PDF to client
```

### 4. Compact Mode (Landscape)

Landscape certificates use `compact={true}` on section components for tighter spacing:

```vue
<CertTitle :title="..." :compact="true" />
<!-- text-5xl instead of text-6xl -->
<CertBody :body-html="..." :compact="true" />
<!-- text-lg instead of text-xl -->
```

### 5. Adaptive Text

Long donor names automatically shrink to fit using `useAdaptiveText`:

```vue
<p class="template-adaptive" :data-min-font="16">{{ donorName }}</p>
```

## Adding New Templates

1. Create model type in `shared/types.ts`
2. Create layout component in `shared/components/{type}/`
3. Create print page in `app/pages/print/{type}.vue`
4. Add case to `server/api/pdf.post.ts`
5. Create admin preview in `admin/components/`

## Technical Notes

- **Page geometry:** A4 at 96 DPI = 794 x 1123 CSS pixels (portrait)
- **No content scaling:** Components render at 1:1 with canvas dimensions
- **Fonts:** Loaded via Bunny Fonts, waited for in Puppeteer
- **Token TTL:** 30 seconds, single-use (deleted after retrieval)
