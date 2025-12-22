import * as z from 'zod'
import type { FieldMetaMap } from '~/features/form-builder/form-builder-types'
import { getCurrencySymbol } from '../../composables/useCurrency'

/**
 * Create reusable cover costs field with fixed amount slider
 *
 * Provides a slider to cover platform/processing costs with:
 * - Fixed currency amount slider (0-5 in local currency)
 * - Large formatted display showing fee amount
 * - Appeal message with link to terms dialog
 * - Used for small donations below threshold
 *
 * @param options Configuration options
 * @param options.defaultValue Default amount value in currency units
 * @param options.maxValue Maximum amount in currency units (default: 5)
 * @param options.visibilityCondition Function that determines when field should be visible
 * @returns FieldMetaMap object with coverFeesAmount field and supporting fields
 *
 * @example
 * ```typescript
 * const fields = {
 *   donationAmount: { type: 'number', label: 'Amount' },
 *   ...createCoverFeesAmountField({
 *     defaultValue: 1,
 *     maxValue: 5
 *   })
 * }
 * ```
 *
 * Usage in form:
 * - Field value is stored as fixed amount (0-5)
 * - Access via `formValues.coverFeesAmount`
 */
export function createCoverFeesAmountField(options?: {
  defaultValue?: number
  minValue?: number
  maxValue?: number
  visibilityCondition?: (values: Record<string, unknown>) => boolean
  heading?: string
  description?: string
}): FieldMetaMap {
  const {
    minValue = 0,
    maxValue = 5,
    visibilityCondition,
    heading = 'Send 100% to the Cause',
    description = 'By covering operational costs, your entire donation goes directly to the cause.'
  } = options || {}

  return {
    coverFeesInfo: {
      type: 'card',
      label: heading,
      content: `
        <p class="text-sm text-muted-foreground mb-2">
          ${description}
          <button 
            type="button" 
            class="text-primary underline-offset-4 hover:underline"
            data-cover-costs-terms-trigger
          >
            See cost breakdown
          </button>
        </p>
      `,
      visibleWhen: visibilityCondition,
      isNoSeparatorAfter: true
    },

    coverFeesAmount: {
      type: 'slider',
      label: 'Operational Cost Contribution',
      description: (values: Record<string, unknown>) => {
        const amount = (values.coverFeesAmount as number) || 0
        const currency = (values.currency as string) || 'GBP'

        const symbol = getCurrencySymbol(currency)

        if (amount === 0) {
          return 'Move the slider to help cover operational costs'
        }

        return `You're adding ${symbol}${amount.toFixed(2)} to help offset running costs`
      },
      min: minValue,
      max: maxValue,
      step: 0.5,
      formatValue: (value: number, formValues?: Record<string, unknown>) => {
        const currency = (formValues?.currency as string) || 'GBP'
        const symbol = getCurrencySymbol(currency)
        return `${symbol}${value.toFixed(2)}`
      },
      showMinMax: true,
      minMaxFormatter: (value: number, formValues?: Record<string, unknown>) => {
        const currency = (formValues?.currency as string) || 'GBP'
        const symbol = getCurrencySymbol(currency)
        return `${symbol}${value.toFixed(2)}`
      },
      visibleWhen: visibilityCondition,
      rules: z.number().min(minValue).max(maxValue),
      class: '**:data-[slot=slider-track]:h-2.5 **:data-[slot=slider-thumb]:size-6'
    }
  }
}
