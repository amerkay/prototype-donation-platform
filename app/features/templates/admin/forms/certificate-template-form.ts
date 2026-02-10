import {
  defineForm,
  textField,
  richTextField,
  selectField,
  toggleField,
  imageUploadField,
  fieldGroup,
  componentField,
  alertField
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

  const brandingNotice = alertField('branding', {
    variant: 'info',
    description:
      'Branding is configured at the organization level and applies to all donor-facing pages.',
    cta: {
      label: 'Edit branding settings',
      to: '/admin/settings/branding',
      inline: true
    }
  })

  const title = textField('title', {
    label: 'Title',
    description: 'Main certificate heading.',
    maxLength: 50
  })

  const subtitle = richTextField('subtitle', {
    label: 'Subtitle',
    description: 'Short intro under title.',
    variables: CERTIFICATE_TEMPLATE_VARIABLES,
    showSeparatorAfter: true
  })

  const bodyText = richTextField('bodyText', {
    label: 'Body Text',
    description: 'Main supporting message.',
    variables: CERTIFICATE_TEMPLATE_VARIABLES
  })

  const bodyTextFontSize = selectField('bodyTextFontSize', {
    label: 'Body Text Size',
    description: 'Text size for body.',
    options: [
      { value: 'small', label: 'Small' },
      { value: 'medium', label: 'Medium' },
      { value: 'large', label: 'Large' }
    ]
  })

  const orientation = selectField('orientation', {
    label: 'Orientation',
    description: 'Choose page direction.',
    options: [
      { value: 'landscape', label: 'Landscape' },
      { value: 'portrait', label: 'Portrait' }
    ]
  })

  const backgroundImage = imageUploadField('backgroundImage', {
    label: 'Background Image',
    description: 'Optional full-page background.',
    showSeparatorAfter: true
  })

  const pageBorderStyle = selectField('pageBorderStyle', {
    label: 'Page Border Style',
    description: 'Choose page border look.',
    options: [
      { value: 'none', label: 'No border' },
      { value: 'border', label: 'Border' },
      { value: 'rounded', label: 'Rounded corners border' },
      { value: 'double', label: 'Double border' }
    ]
  })

  const pageBorderThickness = selectField('pageBorderThickness', {
    label: 'Border Thickness',
    description: 'Border width strength.',
    options: [
      { value: 'thin', label: 'Thin' },
      { value: 'medium', label: 'Medium' },
      { value: 'thick', label: 'Thick' }
    ]
  })

  const showLogo = toggleField('showLogo', {
    label: 'Show Logo',
    description: 'Show organization logo.'
  })

  const showSignature = toggleField('showSignature', {
    label: 'Show Signature',
    description: 'Show signature section.'
  })

  const signatureName = textField('signatureName', {
    label: 'Signatory Name',
    description: 'Name shown in signature.',
    maxLength: 40,
    visibleWhen: (ctx) => !!ctx.values.showSignature
  })

  const signatureTitle = textField('signatureTitle', {
    label: 'Signatory Title',
    description: 'Role shown under name.',
    maxLength: 50,
    visibleWhen: (ctx) => !!ctx.values.showSignature
  })

  const signatureFontFamily = componentField('signatureFontFamily', {
    component: FontFamilySelector,
    label: 'Signature Font',
    description: 'Font for signature name.',
    visibleWhen: (ctx) => !!ctx.values.showSignature,
    props: {
      options: SIGNATURE_FONT_OPTIONS
    }
  })

  const showProduct = toggleField('showProduct', {
    label: 'Show Product',
    description: 'Show adopted product badge.',
    showSeparatorAfter: true
  })

  const productImageShape = selectField('productImageShape', {
    label: 'Product Image Shape',
    description: 'Shape of product image.',
    options: [
      { value: 'circle', label: 'Circle' },
      { value: 'rounded', label: 'Rounded' },
      { value: 'square', label: 'Square' }
    ],
    visibleWhen: (ctx) => !!ctx.values.showProduct
  })

  const titleTextColor = componentField('titleTextColor', {
    component: ColorPresetSelector,
    label: 'Title Color',
    description: 'Color for heading text.',
    props: {
      primaryColor: branding.primaryColor,
      secondaryColor: branding.secondaryColor
    }
  })

  const separatorsAndBordersColor = componentField('separatorsAndBordersColor', {
    component: ColorPresetSelector,
    label: 'Separators and Borders',
    description: 'Color for lines and borders.',
    props: {
      primaryColor: branding.primaryColor,
      secondaryColor: branding.secondaryColor
    }
  })

  const header = fieldGroup('header', {
    label: 'Header',
    collapsible: true,
    collapsibleDefaultOpen: false,
    fields: { showLogo, title, titleTextColor, subtitle },
    $storePath: {
      showLogo: 'showLogo',
      title: 'title',
      titleTextColor: 'titleTextColor',
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
    fields: { showProduct, productImageShape },
    $storePath: {
      showProduct: 'showProduct',
      productImageShape: 'productImageShape'
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
    fields: {
      brandingNotice,
      orientation,
      backgroundImage,
      pageBorderStyle,
      pageBorderThickness,
      separatorsAndBordersColor
    },
    $storePath: {
      orientation: 'orientation',
      backgroundImage: 'backgroundImage',
      pageBorderStyle: 'pageBorderStyle',
      pageBorderThickness: 'pageBorderThickness',
      separatorsAndBordersColor: 'separatorsAndBordersColor'
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
