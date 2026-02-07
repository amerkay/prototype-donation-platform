import {
  defineForm,
  textField,
  textareaField,
  emojiField,
  selectField,
  numberField,
  toggleField
} from '~/features/_library/form-builder/api'

export const useProductForm = defineForm('product', () => {
  const name = textField('name', {
    label: 'Name',
    placeholder: 'e.g., Plant 10 Trees'
  })

  const description = textareaField('description', {
    label: 'Description',
    placeholder: 'Brief description...',
    rows: 2
  })

  const icon = emojiField('icon', {
    label: 'Icon (emoji)',
    placeholder: '🌳'
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
    icon,
    frequency,
    price,
    minPrice,
    default: defaultPrice,
    isShippingRequired
  }
})

export const useProductEditForm = defineForm('productEdit', () => {
  const name = textField('name', {
    label: 'Name'
  })

  const description = textareaField('description', {
    label: 'Description',
    rows: 2
  })

  const icon = emojiField('icon', {
    label: 'Icon (emoji)'
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
    icon,
    frequency,
    price,
    minPrice,
    default: defaultPrice,
    isShippingRequired,
    status
  }
})
