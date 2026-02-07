import {
  defineForm,
  textField,
  selectField,
  imageUploadField,
  textareaField,
  toggleField
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

  const bodyText = textareaField('bodyText', {
    label: 'Body Content',
    description:
      'Available: {{ FIRST_NAME }}, {{ LAST_NAME }}, {{ DONOR_NAME }}, {{ AMOUNT }}, {{ DATE }}, {{ HONOREE_NAME }}. Blank lines create paragraphs.',
    placeholder: 'Dear {{ FIRST_NAME }},\n\nThank you for your generous gift...',
    rows: 5
  })

  const isActive = toggleField('isActive', {
    label: 'Active'
  })

  return { name, category, subject, imageUrl, bodyText, isActive }
})
