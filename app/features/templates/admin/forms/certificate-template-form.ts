import {
  defineForm,
  textField,
  richTextField,
  selectField,
  toggleField,
  colorField,
  imageUploadField,
  fieldGroup,
  componentField
} from '~/features/_library/form-builder/api'
import ColorPresetSelector from '@/components/ColorPresetSelector.vue'
import { useBrandingSettingsStore } from '~/features/settings/admin/stores/brandingSettings'

export const useCertificateTemplateForm = defineForm('certificateTemplate', () => {
  const branding = useBrandingSettingsStore()
  const title = textField('title', {
    label: 'Title',
    maxLength: 50
  })

  const subtitle = textField('subtitle', {
    label: 'Subtitle',
    maxLength: 80,
    showSeparatorAfter: true
  })

  const bodyText = richTextField('bodyText', {
    label: 'Body Text',
    description: 'Keep to 1–2 sentences for best results.',
    variables: [
      { value: 'DONOR_NAME', label: 'Donor Name' },
      { value: 'AMOUNT', label: 'Amount' },
      { value: 'DATE', label: 'Date' }
    ]
  })

  const content = fieldGroup('content', {
    label: 'Certificate Content',
    description: 'Colors and fonts are inherited from Branding Settings.',
    wrapperClass: 'px-4 py-6 sm:px-6 bg-muted/50 rounded-xl border',
    fields: { title, subtitle, bodyText },
    $storePath: {
      title: 'title',
      subtitle: 'subtitle',
      bodyText: 'bodyText'
    }
  })

  const orientation = selectField('orientation', {
    label: 'Orientation',
    options: [
      { value: 'landscape', label: 'Landscape' },
      { value: 'portrait', label: 'Portrait' }
    ]
  })

  const backgroundImage = imageUploadField('backgroundImage', {
    label: 'Background Image',
    description: 'Recommended: A4 at 300dpi (3508×2480 landscape, 2480×3508 portrait)',
    showSeparatorAfter: true
  })

  const borderStyle = selectField('borderStyle', {
    label: 'Border Style',
    options: [
      { value: 'classic', label: 'Classic' },
      { value: 'modern', label: 'Modern' },
      { value: 'minimal', label: 'Minimal' },
      { value: 'ornate', label: 'Ornate' }
    ],
    visibleWhen: (ctx) => !ctx.values.backgroundImage
  })

  const design = fieldGroup('design', {
    label: 'Design',
    wrapperClass: 'px-4 py-6 sm:px-6 bg-muted/50 rounded-xl border',
    fields: {
      orientation,
      backgroundImage,
      borderStyle
    },
    $storePath: {
      orientation: 'orientation',
      backgroundImage: 'backgroundImage',
      borderStyle: 'borderStyle'
    }
  })

  const showLogo = toggleField('showLogo', {
    label: 'Show Logo',
    description: 'Display organization logo on certificate'
  })

  const showDate = toggleField('showDate', {
    label: 'Show Date',
    description: 'Display the donation date'
  })

  const showSignature = toggleField('showSignature', {
    label: 'Show Signature',
    description: 'Include a signature block'
  })

  const signatureName = textField('signatureName', {
    label: 'Signatory Name',
    maxLength: 40,
    visibleWhen: (ctx) => !!ctx.values.showSignature
  })

  const signatureTitle = textField('signatureTitle', {
    label: 'Signatory Title',
    maxLength: 50,
    visibleWhen: (ctx) => !!ctx.values.showSignature
  })

  const display = fieldGroup('display', {
    label: 'Display Options',
    wrapperClass: 'px-4 py-6 sm:px-6 bg-muted/50 rounded-xl border',
    fields: { showLogo, showDate, showSignature, signatureName, signatureTitle },
    $storePath: {
      showLogo: 'showLogo',
      showDate: 'showDate',
      showSignature: 'showSignature',
      signatureName: 'signatureName',
      signatureTitle: 'signatureTitle'
    }
  })

  const showProduct = toggleField('showProduct', {
    label: 'Show Product',
    description: 'Display product badge on certificate',
    showSeparatorAfter: true
  })

  const productBorderRadius = selectField('productBorderRadius', {
    label: 'Border Shape',
    options: [
      { value: 'circle', label: 'Circle' },
      { value: 'rounded', label: 'Rounded' },
      { value: 'square', label: 'Square' }
    ],
    visibleWhen: (ctx) => !!ctx.values.showProduct
  })

  const productBorderColor = colorField('productBorderColor', {
    label: 'Border Color',
    description: 'Leave empty to use branding color',
    visibleWhen: (ctx) => !!ctx.values.showProduct
  })

  const productNameColor = componentField('productNameColor', {
    component: ColorPresetSelector,
    label: 'Product Name Color',
    description: 'Choose Primary, Secondary, or custom color',
    visibleWhen: (ctx) => !!ctx.values.showProduct,
    props: {
      primaryColor: branding.primaryColor,
      secondaryColor: branding.secondaryColor
    }
  })

  const product = fieldGroup('product', {
    label: 'Product Badge',
    wrapperClass: 'px-4 py-6 sm:px-6 bg-muted/50 rounded-xl border',
    fields: { showProduct, productBorderRadius, productBorderColor, productNameColor },
    $storePath: {
      showProduct: 'showProduct',
      productBorderRadius: 'productBorderRadius',
      productBorderColor: 'productBorderColor',
      productNameColor: 'productNameColor'
    }
  })

  const titleColor = componentField('titleColor', {
    component: ColorPresetSelector,
    label: 'Title Color',
    description: 'Choose Primary, Secondary, or custom color',
    props: {
      primaryColor: branding.primaryColor,
      secondaryColor: branding.secondaryColor
    }
  })

  const signatureColor = componentField('signatureColor', {
    component: ColorPresetSelector,
    label: 'Signature Color',
    description: 'Color for signature line and text',
    visibleWhen: (ctx) => !!ctx.values.showSignature,
    props: {
      primaryColor: branding.primaryColor,
      secondaryColor: branding.secondaryColor
    }
  })

  const colors = fieldGroup('colors', {
    label: 'Colors',
    wrapperClass: 'px-4 py-6 sm:px-6 bg-muted/50 rounded-xl border',
    fields: { titleColor, signatureColor },
    $storePath: {
      titleColor: 'titleColor',
      signatureColor: 'signatureColor'
    }
  })

  return { content, design, colors, product, display }
})
