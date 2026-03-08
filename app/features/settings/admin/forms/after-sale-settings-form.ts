import {
  defineForm,
  toggleField,
  selectField,
  textField,
  richTextField,
  fieldGroup,
  tabsField
} from '~/features/_library/form-builder/api'

const UPSELL_VARIABLES = [
  { value: '{{amount}}', label: 'Monthly Amount' },
  { value: '{{yearly}}', label: 'Yearly Total' },
  { value: '{{campaign}}', label: 'Campaign Name' }
]

const SHARE_VARIABLES = [
  { value: '{{amount}}', label: 'Donation Amount' },
  { value: '{{campaign}}', label: 'Campaign Name' }
]

const FRACTION_OPTIONS = [
  { value: '0.1', label: '10% — Gentle' },
  { value: '0.15', label: '15%' },
  { value: '0.2', label: '20% — Moderate' },
  { value: '0.25', label: '25%' },
  { value: '0.33', label: '33% — Ambitious' }
]

/**
 * After Sale settings form (org-level)
 * Configures the recurring upsell and social sharing on the donation confirmation page.
 */
export const useAfterSaleSettingsForm = defineForm('afterSale', (_ctx) => {
  // ── Recurring Upsell ──
  const recurringUpsellEnabled = toggleField('recurringUpsellEnabled', {
    label: 'Enable recurring upsell',
    description: 'Show a "Make this a monthly gift" prompt after one-time donations'
  })

  const recurringUpsellFraction = selectField('recurringUpsellFraction', {
    label: 'Suggested monthly amount',
    description: 'Percentage of the one-time donation to suggest as monthly',
    options: FRACTION_OPTIONS,
    visibleWhen: (ctx) => ctx.values.recurringUpsellEnabled === true
  })

  const recurringUpsellHeadline = textField('recurringUpsellHeadline', {
    label: 'Headline',
    placeholder: 'Keep making a difference',
    visibleWhen: (ctx) => ctx.values.recurringUpsellEnabled === true
  })

  const recurringUpsellBody = richTextField('recurringUpsellBody', {
    label: 'Message',
    variables: UPSELL_VARIABLES,
    visibleWhen: (ctx) => ctx.values.recurringUpsellEnabled === true
  })

  // ── Social Sharing ──
  const socialSharingEnabled = toggleField('socialSharingEnabled', {
    label: 'Enable social sharing',
    description: 'Show a "Spread the word" prompt on the confirmation page'
  })

  const socialSharingMessage = textField('socialSharingMessage', {
    label: 'Share message',
    description: 'Template for the social sharing text',
    variables: SHARE_VARIABLES,
    visibleWhen: (ctx) => ctx.values.socialSharingEnabled === true
  })

  // --- Tabbed layout ---
  const afterSaleTabs = tabsField('afterSaleTabs', {
    label: 'After Sale Configuration',
    tabsListClass: 'w-full',
    defaultValue: 'recurringUpsell',
    tabs: [
      {
        value: 'recurringUpsell',
        label: 'Recurring Upsell',
        fields: {
          recurringUpsellEnabled,
          recurringUpsellFraction,
          recurringUpsellHeadline,
          recurringUpsellBody
        }
      },
      {
        value: 'socialSharing',
        label: 'Social Sharing',
        fields: { socialSharingEnabled, socialSharingMessage }
      }
    ]
  })

  const afterSale = fieldGroup('afterSale', {
    wrapperClass: 'px-4 py-6 sm:px-6 bg-muted/50 rounded-xl border',
    fields: { afterSaleTabs },
    $storePath: 'flatten'
  })

  return { afterSale }
})
