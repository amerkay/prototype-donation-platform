import * as z from 'zod'
import {
  defineForm,
  colorField,
  imageUploadField,
  selectField,
  textareaField,
  fieldGroup
} from '~/features/_library/form-builder/api'

export const useBrandingSettingsForm = defineForm('brandingSettings', () => {
  const logoUrl = imageUploadField('logoUrl', {
    label: 'Logo',
    description: 'Organization logo (recommended: SVG or PNG, min 200px wide)',
    accept: 'image/*',
    maxSizeMB: 2,
    recommendedDimensions: '400x100',
    optional: true,
    rules: z.string().nullable().optional()
  })

  const faviconUrl = imageUploadField('faviconUrl', {
    label: 'Favicon',
    description: 'Browser tab icon (16x16 or 32x32 PNG)',
    accept: 'image/png,image/x-icon,image/svg+xml',
    maxSizeMB: 1,
    recommendedDimensions: '32x32',
    optional: true,
    rules: z.string().nullable().optional(),
    showSeparatorAfter: true
  })

  const primaryColor = colorField('primaryColor', {
    label: 'Primary Color',
    description: 'Main brand color used for buttons, links, and accents',
    rules: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Must be a valid hex color (e.g., #16a34a)')
  })

  const secondaryColor = colorField('secondaryColor', {
    label: 'Secondary Color',
    description: 'Used for secondary buttons and backgrounds',
    rules: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Must be a valid hex color')
  })

  const accentColor = colorField('accentColor', {
    label: 'Accent Color',
    description: 'Used for highlights, notifications, and call-to-action elements',
    rules: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Must be a valid hex color'),
    showSeparatorAfter: true
  })

  const fontFamily = selectField('fontFamily', {
    label: 'Font Family',
    description: 'Primary font used across donor-facing pages',
    options: [
      { value: 'Inter', label: 'Inter' },
      { value: 'Roboto', label: 'Roboto' },
      { value: 'Open Sans', label: 'Open Sans' },
      { value: 'Lato', label: 'Lato' },
      { value: 'Poppins', label: 'Poppins' },
      { value: 'Montserrat', label: 'Montserrat' }
    ],
    rules: z.string().min(1)
  })

  const customCss = textareaField('customCss', {
    label: 'Custom CSS',
    description: 'Advanced: add custom CSS for donor-facing pages',
    placeholder: '/* Custom styles */',
    rows: 4,
    optional: true,
    rules: z.string().optional()
  })

  const branding = fieldGroup('branding', {
    label: 'Branding',
    description: 'Customize the look and feel of your donation pages.',
    wrapperClass: 'px-4 py-6 sm:px-6 bg-muted/50 rounded-xl border',
    fields: {
      logoUrl,
      faviconUrl,
      primaryColor,
      secondaryColor,
      accentColor,
      fontFamily,
      customCss
    },
    $storePath: {
      logoUrl: 'logoUrl',
      faviconUrl: 'faviconUrl',
      primaryColor: 'primaryColor',
      secondaryColor: 'secondaryColor',
      accentColor: 'accentColor',
      fontFamily: 'fontFamily',
      customCss: 'customCss'
    }
  })

  return { branding }
})
