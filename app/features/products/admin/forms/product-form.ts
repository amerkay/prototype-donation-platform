import {
  defineForm,
  textField,
  textareaField,
  imageUploadField,
  selectField,
  numberField,
  toggleField,
  alertField,
  fieldGroup
} from '~/features/_library/form-builder/api'
import { useCertificateTemplates } from '~/features/templates/admin/composables/useCertificateTemplates'

export const useProductForm = defineForm('product', () => {
  const { templateOptions } = useCertificateTemplates()

  const description = textareaField('description', {
    label: 'Short Description',
    placeholder: 'Brief description...',
    rows: 2,
    maxLength: 85,
    showMaxLengthIndicator: true
  })

  const image = imageUploadField('image', {
    label: 'Product Image',
    optional: true,
    showSeparatorAfter: true
  })

  const certificateTemplateId = selectField('certificateTemplateId', {
    label: 'Certificate Template',
    description: 'Select a template to email certificates when this product is purchased.',
    placeholder: 'No certificate',
    optional: true,
    options: () => templateOptions.value
  })

  const certificateTemplateAlert = alertField('certificateTemplateAlert', {
    variant: 'info',
    description: 'Certificate templates can be customized in the Templates section.',
    cta: {
      label: 'Edit template',
      to: (ctx) =>
        ctx.values.certificateTemplateId
          ? `/admin/templates/certificates/${ctx.values.certificateTemplateId}`
          : '/admin/templates/certificates',
      inline: true
    },
    visibleWhen: (ctx) => !!ctx.values.certificateTemplateId
  })

  const certificateOverrideName = textField('certificateOverrideName', {
    label: 'Certificate Display Name',
    placeholder: 'e.g., Maya',
    optional: true,
    description: 'Short name shown on certificates instead of full product name',
    maxLength: 50,
    visibleWhen: (ctx) => !!ctx.values.certificateTemplateId
  })

  const certificateText = textareaField('certificateText', {
    label: 'Certificate Description',
    description: 'Text shown next to product image on certificates',
    placeholder: 'e.g., Your support helps provide food, shelter, and medical care...',
    rows: 3,
    optional: true,
    maxLength: 250,
    visibleWhen: (ctx) => !!ctx.values.certificateTemplateId
  })

  const certificateSettings = fieldGroup('certificateSettings', {
    label: 'Certificate Settings',
    description: 'Customize how this product appears on donation certificates.',
    collapsible: true,
    collapsibleDefaultOpen: false,
    fields: {
      certificateTemplateId,
      certificateTemplateAlert,
      certificateOverrideName,
      certificateText
    },
    $storePath: {
      certificateTemplateId: 'certificateTemplateId',
      certificateOverrideName: 'certificateOverrideName',
      certificateText: 'certificateText'
    },
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
