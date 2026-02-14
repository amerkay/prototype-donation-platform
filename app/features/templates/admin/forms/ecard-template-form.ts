import {
  defineForm,
  textField,
  selectField,
  imageUploadField,
  richTextField,
  fieldGroup
} from '~/features/_library/form-builder/api'

export const useECardTemplateForm = defineForm('ecardTemplate', () => {
  const category = selectField('category', {
    label: 'Category',
    options: [
      { value: 'thank-you', label: 'Thank You' },
      { value: 'tribute', label: 'Tribute' },
      { value: 'celebration', label: 'Celebration' },
      { value: 'custom', label: 'Custom' }
    ]
  })

  const subject = textField('subject', {
    label: 'Email Subject',
    placeholder: 'Thank you, {{ FIRST_NAME }}!'
  })

  const imageUrl = imageUploadField('imageUrl', {
    label: 'Card Image',
    accept: 'image/*',
    maxSizeMB: 5
  })

  const bodyHtml = richTextField('bodyHtml', {
    label: 'Body Content',
    variables: [
      { value: 'FIRST_NAME', label: 'First Name' },
      { value: 'LAST_NAME', label: 'Last Name' },
      { value: 'DONOR_NAME', label: 'Donor Name' },
      { value: 'AMOUNT', label: 'Amount' },
      { value: 'DATE', label: 'Date' },
      { value: 'HONOREE_NAME', label: 'Honoree Name' }
    ]
  })

  const ecardSettings = fieldGroup('ecard', {
    collapsible: false,
    label: 'eCard Settings',
    description: 'Configure category, subject, image, and message content.',
    wrapperClass: 'px-4 py-6 sm:px-6 bg-muted/50 rounded-xl border',
    fields: { category, subject, imageUrl, bodyHtml },
    $storePath: {
      category: 'category',
      subject: 'subject',
      imageUrl: 'imageUrl',
      bodyHtml: 'bodyHtml'
    }
  })

  return { ecard: ecardSettings }
})
