import * as z from 'zod'
import {
  defineForm,
  textField,
  textareaField,
  sliderField,
  currencyField,
  dateField,
  imageUploadField
} from '~/features/_library/form-builder/api'
import type { ComposableForm } from '~/features/_library/form-builder/types'
import type { MatchPeriod } from '~/features/campaigns/features/matched-giving/shared/types'
import { useCampaignConfigStore } from '~/features/campaigns/shared/stores/campaignConfig'
import { getCurrencySymbol } from '~/features/donation-form/shared/composables/useCurrency'

/**
 * Match period add/edit dialog form.
 *
 * Rendered inside BaseDialogOrDrawer by MatchPeriodsList.
 * Uses defineForm + FormRenderer per codebase conventions.
 *
 * @param existingPeriods - Other periods (for overlap validation)
 * @param editingPeriodId - ID of the period being edited (null for add)
 */
export function createMatchPeriodForm(
  existingPeriods: MatchPeriod[],
  editingPeriodId: string | null
): ComposableForm {
  return defineForm(
    'match-period',
    () => {
      const store = useCampaignConfigStore()

      const name = textField('name', {
        label: 'Period Name',
        placeholder: 'e.g., Launch Week Double Match',
        rules: z.string().min(1, 'Name is required')
      })

      const matchMultiplier = sliderField('matchMultiplier', {
        label: 'Match Multiplier',
        description: (ctx) => {
          const m = (ctx.values.matchMultiplier as number) || 2
          return `A £10 donation becomes £${10 * m}`
        },
        min: 2,
        max: 10,
        step: 1,
        suffix: 'x',
        showSeparatorAfter: true
      })

      const poolAmount = currencyField('poolAmount', {
        label: 'Pool Amount',
        description: 'Total match fund committed by the matcher',
        currencySymbol: () => getCurrencySymbol(store.currency),
        min: 1,
        rules: z.number().min(1, 'Pool amount must be greater than 0')
      })

      const startDate = dateField('startDate', {
        label: 'Start Date',
        rules: z.string().min(1, 'Start date is required')
      })

      const endDate = dateField('endDate', {
        label: 'End Date',
        rules: z.string().min(1, 'End date is required'),
        showSeparatorAfter: true
      })

      const matcherName = textField('matcherName', {
        label: 'Matcher Name',
        description: 'Shown to donors as "Matched by [name]". Leave blank to omit.',
        placeholder: 'e.g., The Wilkinson Foundation'
      })

      const matcherLogo = imageUploadField('matcherLogo', {
        label: 'Matcher Logo',
        description: 'Logo displayed alongside the matcher name on the campaign page.',
        accept: 'image/*',
        recommendedDimensions: '200x200px'
      })

      const displayMessage = textareaField('displayMessage', {
        label: 'Display Message',
        description:
          'Custom message shown to donors about the matching. Leave blank for auto-generated.',
        placeholder: 'e.g., Every pound you donate is matched pound for pound!',
        maxLength: 120
      })

      return {
        name,
        matchMultiplier,
        poolAmount,
        startDate,
        endDate,
        matcherName,
        matcherLogo,
        displayMessage
      }
    },
    createMatchPeriodSchema(existingPeriods, editingPeriodId)
  )
}

/**
 * Root-level schema for cross-field validation:
 * - End date must be after start date
 * - Date range must not overlap with existing periods
 */
function createMatchPeriodSchema(existingPeriods: MatchPeriod[], editingPeriodId: string | null) {
  return z
    .object({
      name: z.string(),
      matchMultiplier: z.number(),
      poolAmount: z.number(),
      startDate: z.string(),
      endDate: z.string(),
      matcherName: z.string().optional().default(''),
      matcherLogo: z.string().optional().default(''),
      displayMessage: z.string().optional().default('')
    })
    .refine(
      (data) => {
        if (!data.startDate || !data.endDate) return true
        return new Date(data.endDate) > new Date(data.startDate)
      },
      { message: 'End date must be after start date', path: ['endDate'] }
    )
    .refine(
      (data) => {
        if (!data.startDate || !data.endDate) return true
        const s = new Date(data.startDate).getTime()
        const e = new Date(data.endDate).getTime()
        return !existingPeriods.some((p) => {
          if (p.id === editingPeriodId) return false
          const ps = new Date(p.startDate).getTime()
          const pe = new Date(p.endDate).getTime()
          return s < pe && e > ps
        })
      },
      { message: 'Date range overlaps with another match period', path: ['startDate'] }
    )
}
