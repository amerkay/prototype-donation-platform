import * as z from 'zod'
import {
  arrayField,
  fieldGroup,
  currencyField,
  textField,
  imageUploadField
} from '~/features/_library/form-builder/api'
import type { FieldContext } from '~/features/_library/form-builder/types'
import { getCurrencySymbol } from '~/features/donation-form/shared/composables/useCurrency'

/**
 * Creates an array field for preset donation amounts with optional descriptions
 * Supports dynamic rendering based on enableAmountDescriptions toggle
 */
export function createPresetAmountsField() {
  return arrayField('presetAmounts', {
    label: 'Preset Amounts',
    description: 'Preset donation amounts (in base currency)',
    visibleWhen: ({ values }: FieldContext) => !!(values?.enabled as boolean | undefined),
    class: ({ values }: FieldContext) => {
      const enableDescriptions = values.enableAmountDescriptions as boolean | undefined
      return enableDescriptions
        ? 'grid grid-cols-1 gap-2'
        : 'grid grid-cols-1 gap-2 items-start sm:grid-cols-2'
    },
    sortable: true,
    itemField: (itemValues: Record<string, unknown>, context) => {
      // Access parent frequency values from root context to check if descriptions are enabled
      const rootValues = context.root as Record<string, unknown>
      const enableDescriptions = rootValues.enableAmountDescriptions as boolean | undefined

      // Dynamic label based on amount value
      const amount = itemValues.amount as number | undefined
      const shortText = itemValues.shortText as string | undefined
      const displayLabel =
        amount && shortText && enableDescriptions
          ? `£${amount} — ${shortText.length > 25 ? shortText.substring(0, 25) + '...' : shortText}`
          : amount
            ? `£${amount}`
            : 'New Amount'

      // Always return fieldGroup with 3 fields for consistent data structure
      return fieldGroup('', {
        label: enableDescriptions ? displayLabel : undefined,
        collapsible: enableDescriptions,
        collapsibleDefaultOpen: false,
        wrapperClass: enableDescriptions ? '' : 'my-2.5!',
        fields: {
          amount: currencyField('amount', {
            label: enableDescriptions ? 'Amount' : undefined,
            placeholder: '25',
            min: 1,
            currencySymbol: ({ values }: FieldContext) => {
              const donationAmounts = (values as Record<string, unknown>).donationAmounts as
                | Record<string, unknown>
                | undefined
              const baseDefaultCurrency = (donationAmounts?.baseDefaultCurrency as string) || 'GBP'
              return getCurrencySymbol(baseDefaultCurrency)
            },
            rules: ({ values }: FieldContext) => {
              const minAmount = (values.customAmount as Record<string, unknown> | undefined)
                ?.min as number | undefined
              const effectiveMin = minAmount ?? 1
              return z
                .number({ message: 'Amount is required' })
                .min(effectiveMin, `Must be at least ${effectiveMin}`)
            }
          }),
          shortText: textField('shortText', {
            label: 'Short Description',
            placeholder: 'e.g., Feed a family for a day',
            maxLength: 30,
            visibleWhen: ({ root }: FieldContext) => {
              return !!(root.enableAmountDescriptions as boolean | undefined)
            }
          }),
          image: imageUploadField('image', {
            label: 'Square Image',
            accept: 'image/*',
            recommendedDimensions: '400x400px (square)',
            visibleWhen: ({ root }: FieldContext) => {
              return !!(root.enableAmountDescriptions as boolean | undefined)
            }
          })
        }
      })
    },
    addButtonText: 'Add Amount',
    rules: ({ values }: FieldContext) => {
      const enabled = values.enabled as boolean | undefined
      if (!enabled) return z.array(z.any())

      // Validate array of objects with conditional field requirements
      return z
        .array(
          z.object({
            amount: z.number().min(1, 'Amount is required'),
            shortText: z.string().nullish(),
            image: z.string().nullish()
          })
        )
        .min(1, 'At least one preset required')
    }
  })
}
