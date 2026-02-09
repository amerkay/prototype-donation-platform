import * as z from 'zod'
import {
  defineForm,
  colorField,
  imageUploadField,
  textareaField,
  fieldGroup,
  componentField
} from '~/features/_library/form-builder/api'
import BrandingTemplatePicker from '~/features/settings/admin/components/BrandingTemplatePicker.vue'
import FontFamilySelector from '@/components/FontFamilySelector.vue'
import { BRANDING_FONT_OPTIONS } from '~/features/settings/admin/utils/fonts'

export const useBrandingSettingsForm = defineForm('brandingSettings', () => {
  const primaryColor = colorField('primaryColor', {
    label: 'Primary Color',
    description: 'Buttons, links, accents',
    rules: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Must be a valid hex color (e.g., #16a34a)')
  })

  const secondaryColor = colorField('secondaryColor', {
    label: 'Secondary Color',
    description: 'Highlights, notifications',
    rules: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Must be a valid hex color')
  })

  const templatePicker = componentField('templatePicker', {
    component: BrandingTemplatePicker,
    label: 'Color Template',
    description: 'Start with a curated palette or choose Custom to pick your own colors.'
  })

  const colors = fieldGroup('colors', {
    class: 'grid grid-cols-1 lg:grid-cols-2 gap-4',
    fields: { primaryColor, secondaryColor },
    showSeparatorAfter: true
    // No $storePath — handled by parent branding group
  })

  const fontFamily = componentField('fontFamily', {
    component: FontFamilySelector,
    label: 'Font Family',
    description: 'Primary font used across donor-facing pages',
    rules: z.string().min(1),
    showSeparatorAfter: true,
    props: {
      options: BRANDING_FONT_OPTIONS
    }
  })

  const logoUrl = imageUploadField('logoUrl', {
    label: 'Logo',
    description: 'Organization logo (recommended: SVG or PNG, min 200px wide)',
    accept: 'image/*',
    maxSizeMB: 2,
    recommendedDimensions: '400x100',
    optional: true,
    rules: z.string().nullable().optional(),
    showSeparatorAfter: true
  })

  const customCss = textareaField('customCss', {
    label: 'Custom CSS',
    description: 'Advanced: add custom CSS for donor-facing pages',
    placeholder: '/* Custom styles */',
    rows: 4,
    optional: true,
    rules: z.string().optional()
  })

  const customCssGroup = fieldGroup('customCssGroup', {
    label: 'Custom CSS',
    description: 'Advanced styling overrides for donor-facing pages.',
    collapsible: true,
    collapsibleDefaultOpen: false,
    fields: { customCss }
    // No $storePath — handled by parent branding group
  })

  const branding = fieldGroup('branding', {
    label: 'Branding',
    description: 'Customize the look and feel of your donation pages.',
    wrapperClass: 'px-4 py-6 sm:px-6 bg-muted/50 rounded-xl border',
    fields: { templatePicker, colors, fontFamily, logoUrl, customCssGroup },
    $storePath: {
      'colors.primaryColor': 'primaryColor',
      'colors.secondaryColor': 'secondaryColor',
      fontFamily: 'fontFamily',
      logoUrl: 'logoUrl',
      'customCssGroup.customCss': 'customCss'
    }
  })

  return { branding }
})
