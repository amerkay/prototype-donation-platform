import {
  defineForm,
  textField,
  richTextField,
  selectField,
  toggleField,
  imageUploadField,
  fieldGroup,
  componentField
} from '~/features/_library/form-builder/api'
import ColorPresetSelector from '@/components/ColorPresetSelector.vue'
import FontFamilySelector from '@/components/FontFamilySelector.vue'
import { useBrandingSettingsStore } from '~/features/settings/admin/stores/brandingSettings'
import { SIGNATURE_FONT_OPTIONS } from '~/features/settings/admin/utils/fonts'

const CERTIFICATE_TEMPLATE_VARIABLES = [
  { value: 'DONOR_NAME', label: 'Donor Name' },
  { value: 'AMOUNT', label: 'Amount' },
  { value: 'DATE', label: 'Date' }
] as const

export const CERTIFICATE_TEMPLATE_TARGETS = {
  showLogo: 'certificate.header.showLogo',
  title: 'certificate.header.title',
  subtitle: 'certificate.header.subtitle',
  header: 'certificate.header',
  body: 'certificate.body',
  productSettings: 'certificate.productSettings',
  signatureSettings: 'certificate.signatureSettings',
  design: 'certificate.design'
} as const

export const certificateOpenAccordionId = ref<string | undefined>(undefined)

export const useCertificateTemplateForm = defineForm('certificateTemplate', () => {
  const branding = useBrandingSettingsStore()

  const title = textField('title', {
    label: 'Title',
    maxLength: 50
  })

  const subtitle = richTextField('subtitle', {
    label: 'Subtitle',
    variables: CERTIFICATE_TEMPLATE_VARIABLES,
    showSeparatorAfter: true
  })

  const bodyText = richTextField('bodyText', {
    label: 'Body Text',
    description: 'Keep to 1–2 sentences for best results.',
    variables: CERTIFICATE_TEMPLATE_VARIABLES
  })

  const bodyTextFontSize = selectField('bodyTextFontSize', {
    label: 'Body Text Size',
    options: [
      { value: 'small', label: 'Small' },
      { value: 'medium', label: 'Medium' },
      { value: 'large', label: 'Large' }
    ]
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
    ]
  })

  const borderThickness = selectField('borderThickness', {
    label: 'Border Thickness',
    options: [
      { value: 'thin', label: 'Thin' },
      { value: 'medium', label: 'Medium' },
      { value: 'thick', label: 'Thick' }
    ]
  })

  const showLogo = toggleField('showLogo', {
    label: 'Show Logo',
    description: 'Display organization logo on certificate'
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

  const signatureFontFamily = componentField('signatureFontFamily', {
    component: FontFamilySelector,
    label: 'Signature Font',
    description: 'Choose a script font for the signatory name',
    visibleWhen: (ctx) => !!ctx.values.showSignature,
    props: {
      options: SIGNATURE_FONT_OPTIONS
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

  const titleColor = componentField('titleColor', {
    component: ColorPresetSelector,
    label: 'Title Color',
    description: 'Choose Primary, Secondary, or custom color',
    props: {
      primaryColor: branding.primaryColor,
      secondaryColor: branding.secondaryColor
    }
  })

  const separatorsAndBorders = componentField('separatorsAndBorders', {
    component: ColorPresetSelector,
    label: 'Separators and Borders',
    description: 'Color for separators and border accents',
    props: {
      primaryColor: branding.primaryColor,
      secondaryColor: branding.secondaryColor
    }
  })

  const header = fieldGroup('header', {
    label: 'Header',
    collapsible: true,
    collapsibleDefaultOpen: false,
    fields: { showLogo, title, titleColor, subtitle },
    $storePath: {
      showLogo: 'showLogo',
      title: 'title',
      titleColor: 'titleColor',
      subtitle: 'subtitle'
    },
    showSeparatorAfter: true
  })

  const body = fieldGroup('body', {
    label: 'Body',
    collapsible: true,
    collapsibleDefaultOpen: false,
    fields: { bodyText, bodyTextFontSize },
    $storePath: {
      bodyText: 'bodyText',
      bodyTextFontSize: 'bodyTextFontSize'
    },
    showSeparatorAfter: true
  })

  const productSettings = fieldGroup('productSettings', {
    label: 'Product Settings',
    collapsible: true,
    collapsibleDefaultOpen: false,
    fields: { showProduct, productBorderRadius },
    $storePath: {
      showProduct: 'showProduct',
      productBorderRadius: 'productBorderRadius'
    },
    showSeparatorAfter: true
  })

  const signatureSettings = fieldGroup('signatureSettings', {
    label: 'Signature Settings',
    collapsible: true,
    collapsibleDefaultOpen: false,
    fields: { showSignature, signatureName, signatureTitle, signatureFontFamily },
    $storePath: {
      showSignature: 'showSignature',
      signatureName: 'signatureName',
      signatureTitle: 'signatureTitle',
      signatureFontFamily: 'signatureFontFamily'
    },
    showSeparatorAfter: true
  })

  const design = fieldGroup('design', {
    label: 'Design',
    collapsible: true,
    collapsibleDefaultOpen: false,
    fields: { orientation, backgroundImage, borderStyle, borderThickness, separatorsAndBorders },
    $storePath: {
      orientation: 'orientation',
      backgroundImage: 'backgroundImage',
      borderStyle: 'borderStyle',
      borderThickness: 'borderThickness',
      separatorsAndBorders: 'separatorsAndBorders'
    },
    showSeparatorAfter: true
  })

  const certificate = fieldGroup('certificate', {
    label: 'Certificate Settings',
    description: 'Configure content, design, product, and signature sections.',
    wrapperClass: 'px-4 py-6 sm:px-6 bg-muted/50 rounded-xl border',
    fields: { design, header, productSettings, body, signatureSettings }
  })

  return { certificate }
})
