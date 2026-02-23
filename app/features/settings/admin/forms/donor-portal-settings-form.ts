import {
  defineForm,
  toggleField,
  sliderField,
  currencyField,
  fieldGroup
} from '~/features/_library/form-builder/api'
import { useCurrencySettingsStore } from '~/features/settings/admin/stores/currencySettings'
import { getCurrencySymbol } from '~/features/donation-form/shared/composables/useCurrency'

const formatDuration = (v: number) => (v === 0 ? 'No minimum' : v === 1 ? '1 month' : `${v} months`)

function actionSection(key: string, label: string, description: string, storePath: string) {
  const currencyStore = useCurrencySettingsStore()

  const enabled = toggleField(`${key}Enabled`, {
    label: `Enable`,
    description: (ctx) => {
      const isEnabled = ctx.values[`${key}Enabled`]
      if (!isEnabled) return 'Disabled for all donors.'

      const duration = (ctx.values[`${key}Duration`] as number) ?? 0
      const minValue = (ctx.values[`${key}MinValue`] as number) ?? 0
      const symbol = getCurrencySymbol(currencyStore.defaultCurrency)

      const parts: string[] = []
      if (duration > 0) parts.push(`subscription active for ${formatDuration(duration)}+`)
      if (minValue > 0) parts.push(`donor value above ${symbol}${minValue}`)

      if (parts.length === 0) return 'Enabled for all donors (no restrictions).'
      return `${label} enabled if ${parts.join(' OR ')}.`
    },
    optional: true
  })

  const duration = sliderField(`${key}Duration`, {
    label: 'Minimum subscription duration',
    min: 0,
    max: 18,
    step: 1,
    formatValue: formatDuration,
    visibleWhen: (ctx) => ctx.values[`${key}Enabled`] === true
  })

  const minValue = currencyField(`${key}MinValue`, {
    label: 'Minimum donor value (last 12 months)',
    helpText:
      'Set to 0 for no minimum. Non-default currency donations are converted using their exchange rate.',
    min: 0,
    step: 1,
    currencySymbol: () => getCurrencySymbol(currencyStore.defaultCurrency),
    visibleWhen: (ctx) => ctx.values[`${key}Enabled`] === true
  })

  return fieldGroup(key, {
    label,
    description,
    wrapperClass: 'px-4 py-6 sm:px-6 bg-muted/50 rounded-xl border',
    fields: {
      [`${key}Enabled`]: enabled,
      [`${key}Duration`]: duration,
      [`${key}MinValue`]: minValue
    },
    $storePath: {
      [`${key}Enabled`]: `${storePath}.enabled`,
      [`${key}Duration`]: `${storePath}.minDurationMonths`,
      [`${key}MinValue`]: `${storePath}.minDonorValueLastYear`
    }
  })
}

/**
 * Donor Portal settings form (org-level)
 * Configures eligibility gates for subscription pause/cancel and refund actions.
 * Actions are eligible when ANY condition is met (OR logic).
 */
export const useDonorPortalSettingsForm = defineForm('donorPortal', (_ctx) => {
  const pause = actionSection(
    'pause',
    'Pause Subscription',
    'Control when donors can pause their subscriptions.',
    'pauseSubscription'
  )

  const cancel = actionSection(
    'cancel',
    'Cancel Subscription',
    'Control when donors can cancel their subscriptions.',
    'cancelSubscription'
  )

  const refund = actionSection(
    'refund',
    'Request Refund',
    'Control when donors can request a refund on a donation.',
    'requestRefund'
  )

  return { pause, cancel, refund }
})
