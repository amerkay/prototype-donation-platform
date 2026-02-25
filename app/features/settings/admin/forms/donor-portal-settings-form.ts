import {
  defineForm,
  toggleField,
  sliderField,
  selectField,
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
      return `${label} enabled if ${parts.join(' AND ')}.`
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
 * Actions are eligible when ALL conditions are met (AND logic).
 */
export const useDonorPortalSettingsForm = defineForm('donorPortal', (_ctx) => {
  const currencyStore = useCurrencySettingsStore()

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

  const refund = fieldGroup('refund', {
    label: 'Request Refund',
    description: 'Control when donors can request a refund on a donation within the refund window.',
    wrapperClass: 'px-4 py-6 sm:px-6 bg-muted/50 rounded-xl border',
    fields: {
      refundEnabled: toggleField('refundEnabled', {
        label: 'Enable',
        description: (ctx) => {
          const isEnabled = ctx.values['refundEnabled']
          if (!isEnabled) return 'Disabled for all donors.'
          const windowDays = (ctx.values['refundWindowDays'] as number) ?? 30
          const duration = (ctx.values['refundDuration'] as number) ?? 0
          const minValue = (ctx.values['refundMinValue'] as number) ?? 0
          const symbol = getCurrencySymbol(currencyStore.defaultCurrency)
          const parts: string[] = [`within ${windowDays} days of payment`]
          if (duration > 0) parts.push(`subscription active for ${formatDuration(duration)}+`)
          if (minValue > 0) parts.push(`donor value above ${symbol}${minValue}`)
          return `Refund enabled if ${parts.join(' AND ')}.`
        },
        optional: true
      }),
      refundWindowDays: selectField('refundWindowDays', {
        label: 'Refund window',
        helpText: 'Donors can only request a refund within this many days of the payment.',
        options: [
          { value: 30, label: '30 days' },
          { value: 60, label: '60 days' },
          { value: 90, label: '90 days' },
          { value: 180, label: '180 days' }
        ],
        visibleWhen: (ctx) => ctx.values['refundEnabled'] === true
      }),
      refundDuration: sliderField('refundDuration', {
        label: 'Minimum subscription duration',
        helpText: 'Applies to subscription refunds only. One-time payment refunds skip this check.',
        min: 0,
        max: 18,
        step: 1,
        formatValue: formatDuration,
        visibleWhen: (ctx) => ctx.values['refundEnabled'] === true
      }),
      refundMinValue: currencyField('refundMinValue', {
        label: 'Minimum donor value (last 12 months)',
        helpText:
          'Applies to all refunds (subscription and one-time). Set to 0 for no minimum. Non-default currency donations are converted using their exchange rate.',
        min: 0,
        step: 1,
        currencySymbol: () => getCurrencySymbol(currencyStore.defaultCurrency),
        visibleWhen: (ctx) => ctx.values['refundEnabled'] === true
      })
    },
    $storePath: {
      refundEnabled: 'refund.enabled',
      refundWindowDays: 'refund.windowDays',
      refundDuration: 'refund.minDurationMonths',
      refundMinValue: 'refund.minDonorValueLastYear'
    }
  })

  const changeAmount = actionSection(
    'changeAmount',
    'Subscription Change Amount',
    'Control when donors can change their subscription amount.',
    'changeAmount'
  )

  return { cancel, changeAmount, pause, refund }
})
