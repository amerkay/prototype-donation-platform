import * as z from 'zod'
import {
  defineForm,
  toggleField,
  fieldGroup,
  sliderField,
  componentField,
  alertField
} from '~/features/_library/form-builder/api'
import FormProductList from '~/features/donation-form/admin/components/FormProductList.vue'
import { useFormConfigStore } from '~/features/donation-form/shared/stores/formConfig'

function isRegistration() {
  const store = useFormConfigStore()
  return (store.form?.formType ?? 'donation') === 'registration'
}

/**
 * Create multiple products config section definition
 * Returns the form configuration for editing multiple products feature settings
 */
export const useMultipleProductsConfigSection = defineForm('impactCart', (_ctx) => {
  const alwaysEnabledInfo = alertField('alwaysEnabled', {
    variant: 'info',
    label: 'Multiple Products',
    description:
      'Multiple products is always enabled for registration forms. Configure display settings below.',
    visibleWhen: () => isRegistration()
  })

  const enabled = toggleField('enabled', {
    label: 'Enable Multiple Products',
    description: 'Allow donors to add multiple products to their cart',
    labelClass: 'font-bold',
    showSeparatorAfter: true,
    visibleWhen: () => !isRegistration()
  })

  const productList = componentField('productList', {
    label: 'Products Available',
    description: 'Products that donors can add to their cart.',
    component: FormProductList,
    visibleWhen: ({ values }) => values.enabled === true,
    showSeparatorAfter: true
  })

  const initialDisplay = sliderField('initialDisplay', {
    label: 'Initial Products Displayed',
    description: 'Number of products shown initially before "Show More"',
    defaultValue: 3,
    min: 1,
    max: 10,
    step: 1,
    rules: z.number().min(1).max(10)
  })

  const settings = fieldGroup('settings', {
    label: 'Display Settings',
    visibleWhen: ({ values }) => values.enabled === true,
    collapsible: true,
    collapsibleDefaultOpen: false,
    showSeparatorAfter: true,
    fields: { initialDisplay }
  })

  return { alwaysEnabledInfo, enabled, productList, settings }
})
