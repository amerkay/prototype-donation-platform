import {
  defineForm,
  textField,
  textareaField,
  selectField,
  toggleField,
  fieldGroup
} from '~/features/_library/form-builder/api'

export const useCertificateTemplateForm = defineForm('certificateTemplate', () => {
  const title = textField('title', {
    label: 'Title'
  })

  const subtitle = textField('subtitle', {
    label: 'Subtitle'
  })

  const bodyText = textareaField('bodyText', {
    label: 'Body Text',
    description: 'Available variables: {{ DONOR_NAME }}, {{ AMOUNT }}, {{ DATE }}',
    rows: 3
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

  const content = fieldGroup('content', {
    label: 'Certificate Content',
    description: 'Colors and fonts are inherited from Branding Settings.',
    wrapperClass: 'px-4 py-6 sm:px-6 bg-muted/50 rounded-xl border',
    fields: { title, subtitle, bodyText, borderStyle },
    $storePath: {
      title: 'title',
      subtitle: 'subtitle',
      bodyText: 'bodyText',
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
    visibleWhen: (ctx) => !!ctx.values.showSignature
  })

  const signatureTitle = textField('signatureTitle', {
    label: 'Signatory Title',
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

  return { content, display }
})
