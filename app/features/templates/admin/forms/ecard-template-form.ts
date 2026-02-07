import {
  defineForm,
  textField,
  selectField,
  imageUploadField,
  richTextField
} from '~/features/_library/form-builder/api'

export const useECardTemplateForm = defineForm('ecardTemplate', () => {
  const name = textField('name', {
    label: 'Name',
    placeholder: 'Template name'
  })

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

  const bodyText = richTextField('bodyText', {
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

  return { name, category, subject, imageUrl, bodyText }
})
