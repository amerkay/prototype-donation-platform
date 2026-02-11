import {
  defineForm,
  textField,
  richTextField,
  selectField,
  radioGroupField,
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
  titleLine1: 'certificate.header.titleLine1',
  titleLine2: 'certificate.header.titleLine2',
  header: 'certificate.header',
  awardBlock: 'certificate.awardBlock',
  body: 'certificate.body',
  productSettings: 'certificate.productSettings',
  signatureSettings: 'certificate.signatureSettings',
  date: 'certificate.dateSettings',
  footer: 'certificate.footerSettings',
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

  const titleLine1 = textField('titleLine1', {
    label: 'Title Line 1',
    description: 'Smaller text above main title (e.g., "Certificate of").',
    maxLength: 30
  })

  const titleLine2 = textField('titleLine2', {
    label: 'Title Line 2',
    description: 'Main title text, uses title color.',
    maxLength: 35,
    showSeparatorAfter: true
  })

  const logoPosition = radioGroupField('logoPosition', {
    label: 'Logo Position',
    description: 'Position of logo relative to title.',
    orientation: 'horizontal',
    options: [
      { value: 'center', label: 'Center' },
      { value: 'left', label: 'Left of Title' }
    ],
    visibleWhen: (ctx) => !!ctx.values.showLogo
  })

  const bodyText = richTextField('bodyText', {
    label: 'Body Text',
    description: 'Main supporting message.',
    variables: CERTIFICATE_TEMPLATE_VARIABLES
  })

  const layout = radioGroupField('layout', {
    label: 'Layout',
    description: 'Choose certificate orientation.',
    orientation: 'horizontal',
    options: [
      { value: 'portrait-classic', label: 'Portrait' },
      { value: 'landscape-classic', label: 'Landscape' }
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

  const noLogoAlert = alertField('noLogoAlert', {
    variant: 'info',
    description: 'Upload a logo in branding settings to enable this option.',
    cta: {
      label: 'Go to branding',
      to: '/admin/settings/branding#logo',
      inline: true
    },
    visibleWhen: () => !branding.logoUrl
  })

  const showLogo = toggleField('showLogo', {
    label: 'Show Logo',
    description: 'Show organization logo.',
    disabled: () => !branding.logoUrl,
    onChange: ({ value, setValue }) => {
      // Force false if no logo available
      if (value && !branding.logoUrl) {
        setValue('showLogo', false)
      }
    }
  })

  const logoSize = radioGroupField('logoSize', {
    label: 'Logo Size',
    description: 'Height of the logo (width adapts automatically).',
    orientation: 'horizontal',
    options: [
      { value: 'small', label: 'Small' },
      { value: 'medium', label: 'Medium' },
      { value: 'large', label: 'Large' }
    ],
    visibleWhen: (ctx) => !!ctx.values.showLogo
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

  const awardTextLine1 = textField('awardTextLine1', {
    label: 'Award Text Line 1',
    description: 'Plain text above donor name (e.g., "This certificate is awarded to").',
    maxLength: 60
  })

  const showDonorName = toggleField('showDonorName', {
    label: 'Show Donor Name',
    description: 'Display donor name decoratively in award block.'
  })

  const donorNameFontFamily = componentField('donorNameFontFamily', {
    component: FontFamilySelector,
    label: 'Donor Name Font',
    description: 'Decorative font for donor name.',
    visibleWhen: (ctx) => !!ctx.values.showDonorName,
    props: {
      options: SIGNATURE_FONT_OPTIONS
    }
  })

  const awardTextLine2 = richTextField('awardTextLine2', {
    label: 'Award Text Line 2',
    description: 'Rich text below donor name (e.g., "for your symbolic adoption of").',
    variables: CERTIFICATE_TEMPLATE_VARIABLES
  })

  const showDate = toggleField('showDate', {
    label: 'Show Date',
    description: 'Display donation date.'
  })

  const footerText = textField('footerText', {
    label: 'Footer Text',
    description: 'Optional text at bottom (e.g., website).',
    maxLength: 100
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
    fields: {
      showLogo,
      noLogoAlert,
      logoSize,
      logoPosition,
      titleLine1,
      titleLine2,
      titleTextColor
    },
    $storePath: {
      showLogo: 'showLogo',
      logoSize: 'logoSize',
      logoPosition: 'logoPosition',
      titleLine1: 'titleLine1',
      titleLine2: 'titleLine2',
      titleTextColor: 'titleTextColor'
    },
    showSeparatorAfter: true
  })

  const body = fieldGroup('body', {
    label: 'Body',
    collapsible: true,
    collapsibleDefaultOpen: false,
    fields: { bodyText },
    $storePath: {
      bodyText: 'bodyText'
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

  const awardBlock = fieldGroup('awardBlock', {
    label: 'Award Block',
    collapsible: true,
    collapsibleDefaultOpen: false,
    fields: { awardTextLine1, showDonorName, donorNameFontFamily, awardTextLine2 },
    $storePath: {
      awardTextLine1: 'awardTextLine1',
      showDonorName: 'showDonorName',
      donorNameFontFamily: 'donorNameFontFamily',
      awardTextLine2: 'awardTextLine2'
    },
    showSeparatorAfter: true
  })

  const dateSettings = fieldGroup('dateSettings', {
    label: 'Date',
    collapsible: true,
    collapsibleDefaultOpen: false,
    fields: { showDate },
    $storePath: {
      showDate: 'showDate'
    },
    showSeparatorAfter: true
  })

  const footerSettings = fieldGroup('footerSettings', {
    label: 'Footer',
    collapsible: true,
    collapsibleDefaultOpen: false,
    fields: { footerText },
    $storePath: {
      footerText: 'footerText'
    },
    showSeparatorAfter: true
  })

  const design = fieldGroup('design', {
    label: 'Design',
    collapsible: true,
    collapsibleDefaultOpen: false,
    fields: {
      brandingNotice,
      layout,
      backgroundImage,
      pageBorderStyle,
      pageBorderThickness,
      separatorsAndBordersColor
    },
    $storePath: {
      layout: 'layout',
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
    fields: {
      design,
      header,
      awardBlock,
      body,
      productSettings,
      dateSettings,
      footerSettings,
      signatureSettings
    }
  })

  return { certificate }
})
