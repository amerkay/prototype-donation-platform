import {
  defineForm,
  textField,
  textareaField,
  imageUploadField,
  selectField,
  currencyField,
  toggleField,
  alertField,
  fieldGroup,
  tabsField
} from '~/features/_library/form-builder/api'
import { useCertificateTemplates } from '~/features/templates/admin/composables/useCertificateTemplates'

export const useProductForm = defineForm('product', () => {
  const { templateOptions } = useCertificateTemplates()

  const title = textField('title', {
    label: 'Title',
    placeholder: 'e.g., Adopt Bumi the Rescued Baby',
    description: 'Public-facing title shown to donors',
    maxLength: 80
  })

  const description = textField('description', {
    label: 'Short Description',
    placeholder: 'Brief description...',
    maxLength: 85
  })

  const image = imageUploadField('image', {
    label: 'Product Image'
  })

  const certificateTemplateId = selectField('certificateTemplateId', {
    label: 'Certificate Template',
    description: 'Select a template to email certificates when this product is purchased.',
    placeholder: 'No certificate',
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

  const certificateTitle = textField('certificateTitle', {
    label: 'Certificate Title',
    placeholder: 'e.g., Maya',
    description: 'Short title shown on certificates instead of full product title',
    maxLength: 50,
    visibleWhen: (ctx) => !!ctx.values.certificateTemplateId
  })

  const certificateText = textareaField('certificateText', {
    label: 'Certificate Description',
    description: 'Text shown next to product image on certificates',
    placeholder: 'e.g., Your support helps provide food, shelter, and medical care...',
    rows: 3,
    maxLength: 250,
    visibleWhen: (ctx) => !!ctx.values.certificateTemplateId
  })

  const frequency = selectField('frequency', {
    label: 'Frequency',
    options: [
      { value: 'once', label: 'One-time' },
      { value: 'monthly', label: 'Monthly' },
      { value: 'yearly', label: 'Yearly' }
    ]
  })

  const price = currencyField('price', {
    label: 'Fixed Price',
    placeholder: '30',
    min: 0,
    visibleWhen: (ctx) => ctx.values.frequency === 'once'
  })

  const minPrice = currencyField('minPrice', {
    label: 'Min Price',
    placeholder: '5',
    min: 0,
    visibleWhen: (ctx) => ctx.values.frequency !== 'once'
  })

  const defaultPrice = currencyField('default', {
    label: 'Default Price',
    placeholder: '10',
    min: 0,
    visibleWhen: (ctx) => ctx.values.frequency !== 'once'
  })

  const isShippingRequired = toggleField('isShippingRequired', {
    label: 'Requires Shipping',
    description: 'Product requires a shipping address'
  })

  // --- Tabbed layout ---
  const productTabs = tabsField('productTabs', {
    label: 'Product Configuration',
    tabsListClass: 'w-full',
    defaultValue: 'basic',
    tabs: [
      {
        value: 'basic',
        label: 'Basic',
        fields: { title, description, image }
      },
      {
        value: 'certificateSettings',
        label: 'Certificate',
        fields: {
          certificateTemplateId,
          certificateTitle,
          certificateText,
          certificateTemplateAlert
        }
      },
      {
        value: 'pricing',
        label: 'Pricing',
        fields: { frequency, price, minPrice, default: defaultPrice }
      },
      {
        value: 'shipping',
        label: 'Shipping',
        fields: { isShippingRequired }
      }
    ]
  })

  const product = fieldGroup('product', {
    wrapperClass: 'px-4 py-6 sm:px-6 bg-muted/50 rounded-xl border',
    fields: { productTabs },
    $storePath: 'flatten'
  })

  return { product }
})
