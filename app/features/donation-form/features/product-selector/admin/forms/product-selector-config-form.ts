import * as z from 'zod'
import {
  defineForm,
  toggleField,
  fieldGroup,
  emojiField,
  textField
} from '~/features/_library/form-builder/api'

/**
 * Create product selector config section definition
 * Returns the form configuration for editing product selector feature settings
 */
export const useProductSelectorConfigSection = defineForm('productSelector', (_ctx) => {
  // ctx.title = 'Product Selector'
  // ctx.description = 'Configure the product selection interface and terminology'

  const enabled = toggleField('enabled', {
    label: 'Enable Product Selector',
    description: 'Show product selector interface to donors',
    labelClass: 'font-bold',
    isSeparatorAfter: true
  })

  const productList = fieldGroup('productList', {
    label: 'Products Available',
    visibleWhen: ({ values }) => values.enabled === true,
    collapsible: true,
    collapsibleDefaultOpen: false,
    badgeLabel: 'On my TODO list',
    badgeVariant: 'secondary',
    isDisabled: true,
    isSeparatorAfter: true,
    fields: {}
  })

  const icon = emojiField('icon', {
    label: 'Selector Icon',
    placeholder: '🎯',
    rules: z.string().min(1, 'Required').max(2, 'Must be a single emoji')
  })

  const singular = textField('singular', {
    label: 'Singular Form',
    placeholder: 'project',
    rules: z.string().min(1, 'Required')
  })

  const plural = textField('plural', {
    label: 'Plural Form',
    placeholder: 'projects',
    rules: z.string().min(1, 'Required')
  })

  const entity = fieldGroup('entity', {
    // label: 'Entity Labels',
    class: 'grid grid-cols-2 gap-x-3',
    fields: { singular, plural }
  })

  const verb = textField('verb', {
    label: 'Action Verb',
    placeholder: 'support',
    rules: z.string().min(1, 'Required')
  })

  const noun = textField('noun', {
    label: 'Action Noun',
    placeholder: 'project',
    rules: z.string().min(1, 'Required')
  })

  const action = fieldGroup('action', {
    // label: 'Action Labels',
    class: 'grid grid-cols-2 gap-x-3',
    fields: { verb, noun }
  })

  const config = fieldGroup('config', {
    label: 'Selector Configuration',
    visibleWhen: ({ values }) => values.enabled === true,
    collapsible: true,
    collapsibleDefaultOpen: false,
    isSeparatorAfter: true,
    fields: { icon, entity, action }
  })

  return { enabled, productList, config }
})
