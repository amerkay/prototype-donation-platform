import {
  defineForm,
  textField,
  textareaField,
  imageUploadField,
  selectField,
  currencyField,
  toggleField,
  alertField,
  fieldGroup
} from '~/features/_library/form-builder/api'
import { useCertificateTemplates } from '~/features/templates/admin/composables/useCertificateTemplates'

export const productOpenAccordionId = ref<string | undefined>(undefined)

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
    label: 'Product Image',
    optional: true
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

  const certificateTitle = textField('certificateTitle', {
    label: 'Certificate Title',
    placeholder: 'e.g., Maya',
    optional: true,
    description: 'Short title shown on certificates instead of full product title',
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
    wrapperClass: 'px-4 py-6 sm:px-6 bg-muted/50 rounded-xl border',
    fields: {
      certificateTemplateId,
      certificateTemplateAlert,
      certificateTitle,
      certificateText
    },
    $storePath: {
      certificateTemplateId: 'certificateTemplateId',
      certificateTitle: 'certificateTitle',
      certificateText: 'certificateText'
    }
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
    optional: true,
    visibleWhen: (ctx) => ctx.values.frequency === 'once'
  })

  const minPrice = currencyField('minPrice', {
    label: 'Min Price',
    placeholder: '5',
    min: 0,
    optional: true,
    visibleWhen: (ctx) => ctx.values.frequency !== 'once'
  })

  const defaultPrice = currencyField('default', {
    label: 'Default Price',
    placeholder: '10',
    min: 0,
    optional: true,
    visibleWhen: (ctx) => ctx.values.frequency !== 'once'
  })

  const isShippingRequired = toggleField('isShippingRequired', {
    label: 'Requires Shipping',
    description: 'Product requires a shipping address'
  })

  const basic = fieldGroup('basic', {
    label: 'Basic',
    description: 'Product image and short description shown to donors.',
    collapsible: true,
    collapsibleDefaultOpen: false,
    wrapperClass: 'px-4 py-6 sm:px-6 bg-muted/50 rounded-xl border',
    fields: { title, description, image },
    $storePath: {
      title: 'title',
      description: 'description',
      image: 'image'
    }
  })

  const pricing = fieldGroup('pricing', {
    label: 'Pricing',
    description: 'Set fixed or flexible pricing and donation frequency.',
    collapsible: true,
    collapsibleDefaultOpen: false,
    wrapperClass: 'px-4 py-6 sm:px-6 bg-muted/50 rounded-xl border',
    fields: { frequency, price, minPrice, default: defaultPrice },
    $storePath: {
      frequency: 'frequency',
      price: 'price',
      minPrice: 'minPrice',
      default: 'default'
    }
  })

  const shipping = fieldGroup('shipping', {
    label: 'Shipping',
    description: 'Require a shipping address for physical products.',
    collapsible: true,
    collapsibleDefaultOpen: false,
    wrapperClass: 'px-4 py-6 sm:px-6 bg-muted/50 rounded-xl border',
    fields: { isShippingRequired },
    $storePath: {
      isShippingRequired: 'isShippingRequired'
    }
  })

  return { basic, certificateSettings, pricing, shipping }
})
