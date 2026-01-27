import * as z from 'zod'
import {
  defineForm,
  toggleField,
  fieldGroup,
  selectField
} from '~/features/_library/form-builder/api'

/**
 * Create multiple products config section definition
 * Returns the form configuration for editing multiple products feature settings
 */
export const useMultipleProductsConfigSection = defineForm('impactCart', (_ctx) => {
  // ctx.title = 'Multiple Products'
  // ctx.description = 'Configure support for adding multiple products to cart'

  const enabled = toggleField('enabled', {
    label: 'Enable Multiple Products',
    description: 'Allow donors to add multiple products to their cart',
    labelClass: 'font-bold',
    showSeparatorAfter: true
  })

  const productList = fieldGroup('productList', {
    label: 'Products Available',
    description: 'Define the products that donors can add to their cart',
    visibleWhen: ({ values }) => values.enabled === true,
    collapsible: true,
    collapsibleDefaultOpen: false,
    badgeLabel: 'On my TODO list',
    badgeVariant: 'secondary',
    disabled: true,
    showSeparatorAfter: true,
    fields: {}
  })

  const initialDisplay = selectField('initialDisplay', {
    label: 'Initial Products Displayed',
    description: 'Number of products shown initially before "Show More"',
    options: [
      { value: 2, label: '2' },
      { value: 3, label: '3' },
      { value: 4, label: '4' },
      { value: 5, label: '5' }
    ] as const,
    rules: z.number().min(2).max(5)
  })

  const settings = fieldGroup('settings', {
    label: 'Display Settings',
    visibleWhen: ({ values }) => values.enabled === true,
    collapsible: true,
    collapsibleDefaultOpen: false,
    showSeparatorAfter: true,
    fields: { initialDisplay }
  })

  return { enabled, productList, settings }
})
