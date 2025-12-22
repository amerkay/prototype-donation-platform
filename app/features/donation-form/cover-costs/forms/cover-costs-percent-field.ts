import * as z from 'zod'
import type { FieldMetaMap } from '~/features/form-builder/form-builder-types'
import { getCurrencySymbol } from '../../composables/useCurrency'

/**
 * Create reusable cover costs field with percentage slider
 *
 * Provides a slider to cover platform/processing costs with:
 * - Percentage-based slider (0-30% default range)
 * - Large formatted display showing fee amount and percentage
 * - Appeal message with link to terms dialog
 * - Automatic calculation based on donation amount
 *
 * @param options Configuration options
 * @param options.defaultValue Default percentage value (default: 10)
 * @param options.minValue Minimum percentage (default: 0)
 * @param options.maxValue Maximum percentage (default: 30)
 * @param options.visibleWhen Function that determines when field should be visible
 * @returns FieldMetaMap object with coverFeesPercentage field and supporting fields
 *
 * @example
 * ```typescript
 * const fields = {
 *   donationAmount: { type: 'number', label: 'Amount' },
 *   ...createCoverFeesField({
 *     defaultValue: 10,
 *     minValue: 0,
 *     maxValue: 30
 *   })
 * }
 * ```
 *
 * Usage in form:
 * - Field value is stored as percentage (0-30)
 * - Access via `formValues.coverFeesPercentage`
 * - Calculate actual fee: `donationAmount * (coverFeesPercentage / 100)`
 */
export function createCoverFeesField(options?: {
  defaultValue?: number
  minValue?: number
  maxValue?: number
  visibleWhen?: (values: Record<string, unknown>) => boolean
  heading?: string
  description?: string
}): FieldMetaMap {
  const {
    minValue = 0,
    maxValue = 30,
    visibleWhen,
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
      visibleWhen,
      isNoSeparatorAfter: true
    },

    coverFeesPercentage: {
      type: 'slider',
      label: 'Operational Cost Contribution',
      description: (values: Record<string, unknown>) => {
        const percentage = (values.coverFeesPercentage as number) || 0
        const donationAmount = (values.donationAmount as number) || 0
        const currency = (values.currency as string) || 'GBP'

        const symbol = getCurrencySymbol(currency)

        if (percentage === 0) {
          return 'Move the slider to help cover operational costs'
        }

        const feeAmount = donationAmount * (percentage / 100)
        return `You're adding ${symbol}${feeAmount.toFixed(2)} to help offset running costs`
      },
      min: minValue,
      max: maxValue,
      step: 1,
      formatValue: (value: number) => `${value}%`,
      showMinMax: true,
      minMaxFormatter: (value: number) => `${value}%`,
      visibleWhen,
      rules: z.number().min(minValue).max(maxValue),
      class: '**:data-[slot=slider-track]:h-2.5 **:data-[slot=slider-thumb]:size-6'
    },

    // Hidden field to store dialog state (workaround for card action)
    // Note: In production, enhance card field type to support button actions
    _coverFeesDialogOpen: {
      type: 'toggle',
      label: '', // Hidden
      optional: true,
      visibleWhen: () => false // Always hidden
    }
  }
}

/**
 * Component to handle cover costs upsell modal
 *
 * This should be included once in the parent component that uses createCoverFeesField
 *
 * @example
 * ```vue
 * <script setup>
 * import CoverCostsUpsellModal from '~/features/donation-form/cover-costs/CoverCostsUpsellModal.vue'
 * const showUpsellModal = ref(false)
 * </script>
 *
 * <template>
 *   <FormRenderer :section="section" v-model="formData" />
 *   <CoverCostsUpsellModal v-model:open="showUpsellModal" />
 *
 *   <!-- Use event delegation to open modal from card button -->
 *   <div @click="handleCardClick">
 *     <FormRenderer ... />
 *   </div>
 * </template>
 *
 * <script>
 * const handleCardClick = (e) => {
 *   if (e.target.hasAttribute('data-cover-costs-terms-trigger')) {
 *     showUpsellModal.value = true
 *   }
 * }
 * </script>
 * ```
 */
