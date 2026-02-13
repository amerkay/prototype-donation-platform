import {
  defineForm,
  textField,
  textareaField,
  imageUploadField,
  selectField,
  numberField,
  toggleField,
  fieldGroup
} from '~/features/_library/form-builder/api'

export const useProductForm = defineForm('product', () => {
  const name = textField('name', {
    label: 'Name',
    placeholder: 'e.g., Plant 10 Trees',
    maxLength: 50
  })

  const description = textareaField('description', {
    label: 'Short Description',
    placeholder: 'Brief description...',
    rows: 2,
    maxLength: 60
  })

  const image = imageUploadField('image', {
    label: 'Product Image',
    optional: true,
    showSeparatorAfter: true
  })

  const certificateOverrideName = textField('certificateOverrideName', {
    label: 'Certificate Display Name',
    placeholder: 'e.g., Maya',
    optional: true,
    description: 'Short name shown on certificates instead of full product name',
    maxLength: 50
  })

  const certificateText = textareaField('certificateText', {
    label: 'Certificate Description',
    description: 'Text shown next to product image on certificates',
    placeholder: 'e.g., Your support helps provide food, shelter, and medical care...',
    rows: 3,
    optional: true,
    maxLength: 250
  })

  const certificateSettings = fieldGroup('certificateSettings', {
    label: 'Certificate Settings',
    description: 'Customize how this product appears on donation certificates.',
    collapsible: true,
    collapsibleDefaultOpen: false,
    fields: { certificateOverrideName, certificateText },
    showSeparatorAfter: true
  })

  const frequency = selectField('frequency', {
    label: 'Frequency',
    options: [
      { value: 'once', label: 'One-time' },
      { value: 'monthly', label: 'Monthly' },
      { value: 'yearly', label: 'Yearly' }
    ]
  })

  const price = numberField('price', {
    label: 'Fixed Price',
    placeholder: '30',
    optional: true
  })

  const minPrice = numberField('minPrice', {
    label: 'Min Price',
    placeholder: '5',
    optional: true
  })

  const defaultPrice = numberField('default', {
    label: 'Default Price',
    placeholder: '10',
    optional: true
  })

  const isShippingRequired = toggleField('isShippingRequired', {
    label: 'Requires Shipping',
    description: 'Product requires a shipping address'
  })

  return {
    name,
    description,
    image,
    certificateSettings,
    frequency,
    price,
    minPrice,
    default: defaultPrice,
    isShippingRequired
  }
})
