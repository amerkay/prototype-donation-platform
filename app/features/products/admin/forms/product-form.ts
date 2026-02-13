import {
  defineForm,
  textField,
  textareaField,
  imageUploadField,
  selectField,
  numberField,
  toggleField
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
    maxLength: 200
  })

  const image = imageUploadField('image', {
    label: 'Product Image',
    optional: true
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
    certificateOverrideName,
    certificateText,
    frequency,
    price,
    minPrice,
    default: defaultPrice,
    isShippingRequired
  }
})

export const useProductEditForm = defineForm('productEdit', () => {
  const name = textField('name', {
    label: 'Name',
    maxLength: 25
  })

  const description = textareaField('description', {
    label: 'Description',
    rows: 2,
    maxLength: 60
  })

  const image = imageUploadField('image', {
    label: 'Product Image',
    optional: true
  })

  const certificateOverrideName = textField('certificateOverrideName', {
    label: 'Certificate Display Name',
    placeholder: 'e.g., Maya',
    optional: true,
    description: 'Short name shown on certificates instead of full product name',
    maxLength: 60
  })

  const certificateText = textareaField('certificateText', {
    label: 'Certificate Description',
    description: 'Text shown next to product image on certificates',
    placeholder: 'e.g., Your support helps provide food, shelter, and medical care...',
    rows: 3,
    optional: true,
    maxLength: 250
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
    optional: true
  })

  const minPrice = numberField('minPrice', {
    label: 'Min Price',
    optional: true
  })

  const defaultPrice = numberField('default', {
    label: 'Default Price',
    optional: true
  })

  const isShippingRequired = toggleField('isShippingRequired', {
    label: 'Requires Shipping',
    description: 'Product requires a shipping address'
  })

  const status = selectField('status', {
    label: 'Status',
    options: [
      { value: 'active', label: 'Active' },
      { value: 'draft', label: 'Draft' },
      { value: 'archived', label: 'Archived' }
    ]
  })

  return {
    name,
    description,
    image,
    certificateOverrideName,
    certificateText,
    frequency,
    price,
    minPrice,
    default: defaultPrice,
    isShippingRequired,
    status
  }
})
