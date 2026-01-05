import * as z from 'zod'
import type { FieldMetaMap, FieldContext } from '~/features/form-builder/types'
import { getCurrencySymbol } from '../../composables/useCurrency'

/**
 * Universal cover costs field that adapts between percentage and fixed amount modes
 *
 * Automatically switches behavior based on donation amount:
 * - Donations ≥ £10: Percentage mode (0-30%, step 1)
 * - Donations < £10: Fixed amount mode (0-5 currency units, step 0.5)
 *
 * @param options Configuration options
 * @returns FieldMetaMap with adaptive coverCostsValue field
 */
export function createCoverCostsField(options: {
  heading: string
  description: string
  thresholdAmount?: number
}): FieldMetaMap {
  const { heading, description, thresholdAmount = 10 } = options

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
      `
    },

    coverCostsValue: {
      type: 'slider',
      label: 'Operational Cost Contribution',
      defaultValue: 0,

      // Dynamic description based on mode
      description: ({ values }) => {
        const value = (values.coverCostsValue as number) || 0
        const donationAmount = (values.donationAmount as number) || 0
        const currency = (values.currency as string) || 'GBP'
        const symbol = getCurrencySymbol(currency)

        if (value === 0) {
          return 'Move the slider to help cover operational costs'
        }

        // Determine mode based on donation amount
        const isPercentageMode = donationAmount >= thresholdAmount

        if (isPercentageMode) {
          // Percentage mode: value is percentage, calculate amount
          const feeAmount = donationAmount * (value / 100)
          return `You're adding ${symbol}${feeAmount.toFixed(2)} to help offset running costs`
        } else {
          // Fixed amount mode: value is already the amount
          return `You're adding ${symbol}${value.toFixed(2)} to help offset running costs`
        }
      },

      // Dynamic min/max/step based on mode
      min: 0,
      max: ({ values }) => {
        const donationAmount = (values.donationAmount as number) || 0
        return donationAmount >= thresholdAmount ? 30 : 5
      },
      step: ({ values }) => {
        const donationAmount = (values.donationAmount as number) || 0
        return donationAmount >= thresholdAmount ? 1 : 0.5
      },

      // Dynamic value formatting
      formatValue: (value: number, ctx?: FieldContext) => {
        const donationAmount = (ctx?.values?.donationAmount as number) || 0
        const isPercentageMode = donationAmount >= thresholdAmount

        if (isPercentageMode) {
          return `${value}%`
        } else {
          const currency = (ctx?.values?.currency as string) || 'GBP'
          const symbol = getCurrencySymbol(currency)
          return `${symbol}${value.toFixed(2)}`
        }
      },

      showMinMax: true,
      minMaxFormatter: (value: number, ctx?: FieldContext) => {
        const donationAmount = (ctx?.values?.donationAmount as number) || 0
        const isPercentageMode = donationAmount >= thresholdAmount

        if (isPercentageMode) {
          return `${value}%`
        } else {
          const currency = (ctx?.values?.currency as string) || 'GBP'
          const symbol = getCurrencySymbol(currency)
          return `${symbol}${value.toFixed(2)}`
        }
      },

      rules: z.number().min(0).max(30),
      class: '**:data-[slot=slider-track]:h-2.5 **:data-[slot=slider-thumb]:size-6'
    }
  }
}
