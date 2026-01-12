import * as z from 'zod'
import {
  defineForm,
  toggleField,
  fieldGroup,
  textField,
  textareaField,
  sliderField
} from '~/features/form-builder/api'

/**
 * Create cover costs config section definition
 * Returns the form configuration for editing cover costs settings
 */
export const useCoverCostsConfigSection = defineForm('coverCosts', (_ctx) => {
  // ctx.title = 'Cover Costs'
  // ctx.description = 'Configure cover costs feature displayed to donors'

  const enabled = toggleField('enabled', {
    label: 'Enable Cover Costs Feature',
    description: 'Allow donors to optionally cover operational costs',
    labelClass: 'font-bold',
    isSeparatorAfter: true
  })

  const heading = textField('heading', {
    label: 'Heading',
    description: 'The heading shown above the cover costs option',
    placeholder: 'Send 100% to the [Your Cause]',
    rules: z.string().min(1, 'Heading is required when enabled')
  })

  const description = textareaField('description', {
    label: 'Description',
    description: 'The description text explaining cover costs benefit',
    placeholder:
      'By covering operational costs, your entire donation goes directly to [your cause].',
    rules: z.string().min(1, 'Description is required when enabled')
  })

  const defaultPercentage = sliderField('defaultPercentage', {
    label: 'Default Percentage',
    description: 'The default percentage donors will see (0-30%)',
    placeholder: '10',
    min: 3,
    max: 30,
    suffix: '%',
    rules: z.number().min(0).max(30)
  })

  const settings = fieldGroup('settings', {
    label: 'Cover Costs Settings',
    visibleWhen: ({ values }) => values.enabled === true,
    collapsible: true,
    collapsibleDefaultOpen: false,
    isSeparatorAfter: true,
    fields: { heading, description, defaultPercentage }
  })

  return { enabled, settings }
})
