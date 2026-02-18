import { computed } from 'vue'
import { defineForm, toggleField, selectField } from '~/features/_library/form-builder/api'
import type { FormContext, FieldContext } from '~/features/_library/form-builder/types'
import type { ContextSchema } from '~/features/_library/form-builder/conditions'
import type { CustomFieldType } from '~/features/_library/custom-fields/fields'
import { useCustomFieldsConfigForm } from '~/features/_library/custom-fields/forms/custom-fields-config-form'
import type { Product } from '~/features/donation-form/features/product/shared/types'

/** Entry field types: simple input types suitable for per-entry data collection */
const ENTRY_FIELD_TYPES: CustomFieldType[] = [
  'text',
  'textarea',
  'number',
  'select',
  'radio-group',
  'checkbox'
]

const mockFormContext: FormContext = {
  values: computed(() => ({})),
  form: computed(() => ({}))
}

export function createEntryFieldsConfigSection(products: Product[], supportedCurrencies: string[]) {
  /** Context schema for entry field visibility conditions */
  const entryContextSchema: ContextSchema = {
    cartProducts: {
      label: 'Cart Has Product',
      type: 'array',
      description: 'Products currently in donor cart (all frequencies)',
      options: products.map((p) => ({ value: p.id, label: p.name }))
    },
    cartItemCount: {
      label: 'Cart Item Count',
      type: 'number',
      description: 'Number of items in cart'
    },
    cartTotal: {
      label: 'Cart Total',
      type: 'number',
      description: 'Current cart total value'
    },
    currency: {
      label: 'Currency',
      type: 'array',
      options: supportedCurrencies.map((code) => ({ value: code, label: code }))
    }
  }

  const entryFieldsConfig = useCustomFieldsConfigForm(
    entryContextSchema,
    undefined,
    ENTRY_FIELD_TYPES
  )
  const entryFieldsSetup = entryFieldsConfig.setup(mockFormContext)
  const entryFieldsArray = entryFieldsSetup.fields
  if (!entryFieldsArray || entryFieldsArray.type !== 'array') {
    throw new Error('Expected entry fields to be an array field')
  }

  return defineForm('entryFields', () => {
    const enabled = toggleField('enabled', {
      label: 'Enable Entry Fields',
      description: 'Collect additional data when items are added to cart',
      labelClass: 'font-bold',
      showSeparatorAfter: true
    })

    const mode = selectField('mode', {
      label: 'Entry Mode',
      description:
        'Shared: fields appear once below cart (e.g., one dog, many categories). Per-item: fields appear per cart add (e.g., each stall needs unique data).',
      options: [
        { value: 'shared', label: 'Shared (once below cart)' },
        { value: 'per-item', label: 'Per-item (in add modal)' }
      ],
      defaultValue: 'shared',
      visibleWhen: ({ values }: FieldContext) => values.enabled === true
    })

    return {
      enabled,
      mode,
      fields: entryFieldsArray
    }
  })
}
