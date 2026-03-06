import {
  defineForm,
  toggleField,
  sliderField,
  selectField,
  currencyField,
  fieldGroup,
  tabsField,
  alertField
} from '~/features/_library/form-builder/api'
import { useCurrencySettingsStore } from '~/features/settings/admin/stores/currencySettings'
import { getCurrencySymbol } from '~/features/donation-form/shared/composables/useCurrency'

const formatDuration = (v: number) => (v === 0 ? 'No minimum' : v === 1 ? '1 month' : `${v} months`)

const WINDOW_OPTIONS = [
  { value: 30, label: '30 days' },
  { value: 60, label: '60 days' },
  { value: 90, label: '90 days' },
  { value: 180, label: '180 days' }
]

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
    }
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

function refundSection(
  key: string,
  label: string,
  description: string,
  opts: { showDuration?: boolean; showMinValue?: boolean; showAlert?: boolean } = {}
) {
  const currencyStore = useCurrencySettingsStore()
  const { showDuration = false, showMinValue = false, showAlert = false } = opts

  const enabled = toggleField(`${key}Enabled`, {
    label: 'Enable',
    description: (ctx) => {
      const isEnabled = ctx.values[`${key}Enabled`]
      if (!isEnabled) return 'Disabled for all donors.'
      const windowDays = (ctx.values[`${key}WindowDays`] as number) ?? 30
      const parts: string[] = [`within ${windowDays} days of payment`]

      if (showDuration) {
        const duration = (ctx.values[`${key}Duration`] as number) ?? 0
        if (duration > 0) parts.push(`subscription active for ${formatDuration(duration)}+`)
      }
      if (showMinValue) {
        const minValue = (ctx.values[`${key}MinValue`] as number) ?? 0
        const symbol = getCurrencySymbol(currencyStore.defaultCurrency)
        if (minValue > 0) parts.push(`donor value above ${symbol}${minValue}`)
      }

      return `Refund enabled if ${parts.join(' AND ')}.`
    }
  })

  const windowDays = selectField(`${key}WindowDays`, {
    label: 'Refund window',
    helpText: 'Donors can only request a refund within this many days of the payment.',
    options: WINDOW_OPTIONS,
    visibleWhen: (ctx) => ctx.values[`${key}Enabled`] === true
  })

  const campaignEnded = toggleField(`${key}CampaignEnded`, {
    label: 'Disable refund for ended campaigns',
    description:
      'When enabled, refunds are blocked for donations to campaigns that have completed or ended.',
    visibleWhen: (ctx) => ctx.values[`${key}Enabled`] === true
  })

  const fields: Record<
    string,
    ReturnType<
      | typeof toggleField
      | typeof selectField
      | typeof sliderField
      | typeof currencyField
      | typeof alertField
    >
  > = {}

  if (showAlert) {
    fields[`${key}Alert`] = alertField(`${key}Alert`, {
      variant: 'info',
      description:
        'These settings override Standard and P2P refund settings when a donation has matched giving active.'
    })
  }

  fields[`${key}Enabled`] = enabled
  fields[`${key}WindowDays`] = windowDays

  if (showDuration) {
    fields[`${key}Duration`] = sliderField(`${key}Duration`, {
      label: 'Minimum subscription duration',
      helpText: 'Applies to subscription refunds only. One-time payment refunds skip this check.',
      min: 0,
      max: 18,
      step: 1,
      formatValue: formatDuration,
      visibleWhen: (ctx) => ctx.values[`${key}Enabled`] === true
    })
  }

  if (showMinValue) {
    fields[`${key}MinValue`] = currencyField(`${key}MinValue`, {
      label: 'Minimum donor value (last 12 months)',
      helpText:
        'Applies to all refunds (subscription and one-time). Set to 0 for no minimum. Non-default currency donations are converted using their exchange rate.',
      min: 0,
      step: 1,
      currencySymbol: () => getCurrencySymbol(currencyStore.defaultCurrency),
      visibleWhen: (ctx) => ctx.values[`${key}Enabled`] === true
    })
  }

  fields[`${key}CampaignEnded`] = campaignEnded

  return fieldGroup(key, {
    label,
    description,
    wrapperClass: 'px-4 py-6 sm:px-6 bg-muted/50 rounded-xl border',
    fields
  })
}

/**
 * Donor Portal settings form (org-level)
 * Configures eligibility gates for subscription pause/cancel, refund per campaign type,
 * and change-amount actions. Top tabs: Subscriptions | Refunds.
 * Within each tab, sections are rendered as a responsive grid.
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

  const changeAmount = actionSection(
    'changeAmount',
    'Subscription Change Amount',
    'Control when donors can change their subscription amount.',
    'changeAmount'
  )

  // Refund sections per campaign type
  const standard = refundSection(
    'std',
    'Standard Campaign Refunds',
    'Refund settings for standard campaigns.',
    { showDuration: true, showMinValue: true }
  )

  const p2p = refundSection(
    'p2p',
    'P2P Campaign Refunds',
    'Refund settings for peer-to-peer campaigns. P2P donations are one-time, so duration and donor value gates are not applicable.',
    {}
  )

  const matchedGiving = refundSection(
    'match',
    'Matched Giving Refunds',
    'Refund settings for donations with matched giving. These override Standard/P2P settings.',
    { showAlert: true }
  )

  const subscriptionsGrid = fieldGroup('subscriptionsGrid', {
    class: 'md:grid-cols-2 lg:grid-cols-3',
    fields: { pause, cancel, changeAmount }
  })

  const refundsGrid = fieldGroup('refundsGrid', {
    class: 'md:grid-cols-2 lg:grid-cols-3',
    fields: { standard, p2p, matchedGiving }
  })

  const topTabs = tabsField('topTabs', {
    defaultValue: 'subscriptions',
    tabsListClass: 'w-full',
    tabs: [
      {
        value: 'subscriptions',
        label: 'Subscriptions',
        contentClass: 'pt-4',
        fields: { subscriptionsGrid }
      },
      {
        value: 'refunds',
        label: 'Refunds',
        contentClass: 'pt-4',
        fields: { refundsGrid }
      }
    ]
  })

  const portal = fieldGroup('portal', {
    fields: { topTabs },
    $storePath: {
      // Subscription sections → store
      'topTabs.subscriptions.subscriptionsGrid.pause.pauseEnabled': 'pauseSubscription.enabled',
      'topTabs.subscriptions.subscriptionsGrid.pause.pauseDuration':
        'pauseSubscription.minDurationMonths',
      'topTabs.subscriptions.subscriptionsGrid.pause.pauseMinValue':
        'pauseSubscription.minDonorValueLastYear',
      'topTabs.subscriptions.subscriptionsGrid.cancel.cancelEnabled': 'cancelSubscription.enabled',
      'topTabs.subscriptions.subscriptionsGrid.cancel.cancelDuration':
        'cancelSubscription.minDurationMonths',
      'topTabs.subscriptions.subscriptionsGrid.cancel.cancelMinValue':
        'cancelSubscription.minDonorValueLastYear',
      'topTabs.subscriptions.subscriptionsGrid.changeAmount.changeAmountEnabled':
        'changeAmount.enabled',
      'topTabs.subscriptions.subscriptionsGrid.changeAmount.changeAmountDuration':
        'changeAmount.minDurationMonths',
      'topTabs.subscriptions.subscriptionsGrid.changeAmount.changeAmountMinValue':
        'changeAmount.minDonorValueLastYear',
      // Refund sections → store
      'topTabs.refunds.refundsGrid.standard.stdEnabled': 'refundStandard.enabled',
      'topTabs.refunds.refundsGrid.standard.stdWindowDays': 'refundStandard.windowDays',
      'topTabs.refunds.refundsGrid.standard.stdDuration': 'refundStandard.minDurationMonths',
      'topTabs.refunds.refundsGrid.standard.stdMinValue': 'refundStandard.minDonorValueLastYear',
      'topTabs.refunds.refundsGrid.standard.stdCampaignEnded':
        'refundStandard.disableWhenCampaignEnded',
      'topTabs.refunds.refundsGrid.p2p.p2pEnabled': 'refundP2P.enabled',
      'topTabs.refunds.refundsGrid.p2p.p2pWindowDays': 'refundP2P.windowDays',
      'topTabs.refunds.refundsGrid.p2p.p2pCampaignEnded': 'refundP2P.disableWhenCampaignEnded',
      'topTabs.refunds.refundsGrid.matchedGiving.matchEnabled': 'refundMatchedGiving.enabled',
      'topTabs.refunds.refundsGrid.matchedGiving.matchWindowDays': 'refundMatchedGiving.windowDays',
      'topTabs.refunds.refundsGrid.matchedGiving.matchCampaignEnded':
        'refundMatchedGiving.disableWhenCampaignEnded'
    }
  })

  return { portal }
})
