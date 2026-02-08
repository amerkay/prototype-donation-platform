import {
  defineForm,
  textField,
  richTextField,
  selectField,
  toggleField,
  imageUploadField,
  fieldGroup
} from '~/features/_library/form-builder/api'

export const useCertificateTemplateForm = defineForm('certificateTemplate', () => {
  const title = textField('title', {
    label: 'Title',
    maxLength: 50
  })

  const subtitle = textField('subtitle', {
    label: 'Subtitle',
    maxLength: 80
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
    description: 'Recommended: A4 at 300dpi (3508×2480 landscape, 2480×3508 portrait)'
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

  return { content, design, display }
})
