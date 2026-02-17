import {
  defineForm,
  textField,
  textareaField,
  toggleField,
  richTextField,
  alertField,
  fieldGroup
} from '~/features/_library/form-builder/api'
import { useCurrencySettingsStore } from '~/features/settings/admin/stores/currencySettings'
import { useBrandingSettingsStore } from '~/features/settings/admin/stores/brandingSettings'

export const RECEIPT_TEMPLATE_TARGETS = {
  logo: 'settings.showLogo',
  header: 'settings.headerText',
  donorAddress: 'settings.showDonorAddress',
  campaign: 'settings.showCampaignName',
  payment: 'settings.showPaymentMethod',
  taxStatement: 'settings.taxDeductibleStatement',
  giftAid: 'settings.showGiftAid',
  footer: 'settings.footerText',
  charity: 'settings.charityNotice'
} as const

export const useReceiptTemplateForm = defineForm('receiptTemplate', () => {
  const currencyStore = useCurrencySettingsStore()
  const branding = useBrandingSettingsStore()

  // --- Alerts ---

  const brandingNotice = alertField('brandingNotice', {
    variant: 'info',
    description: 'Colors and fonts are inherited from your organization branding.',
    cta: {
      label: 'Edit branding settings',
      to: '/admin/settings/branding',
      inline: true
    }
  })

  const charityNotice = alertField('charityNotice', {
    variant: 'info',
    description:
      'Charity name, registration number, and address come from charity settings, with per-currency overrides when configured.',
    cta: {
      label: 'Edit charity settings',
      to: '/admin/settings/charity',
      inline: true
    }
  })

  const noLogoAlert = alertField('noLogoAlert', {
    variant: 'info',
    description: 'Upload a logo in branding settings to enable this option.',
    cta: {
      label: 'Go to branding',
      to: '/admin/settings/branding#logo',
      inline: true
    },
    visibleWhen: () => !branding.logoUrl
  })

  // --- Fields ordered by receipt layout (top → bottom) ---

  const showLogo = toggleField('showLogo', {
    label: 'Show Logo',
    description: 'Display organization logo on receipt',
    disabled: () => !branding.logoUrl,
    onChange: ({ value, setValue }) => {
      if (value && !branding.logoUrl) {
        setValue('showLogo', false)
      }
    }
  })

  const headerText = textField('headerText', {
    label: 'Header Text',
    showSeparatorAfter: true
  })

  const showDonorAddress = toggleField('showDonorAddress', {
    label: 'Show Donor Address',
    description: 'Display donor address on receipt'
  })

  const showCampaignName = toggleField('showCampaignName', {
    label: 'Show Campaign Name',
    description: 'Show which campaign the donation was for'
  })

  const showPaymentMethod = toggleField('showPaymentMethod', {
    label: 'Show Payment Method',
    description: 'Display payment method details',
    showSeparatorAfter: true
  })

  const taxDeductibleStatement = richTextField('taxDeductibleStatement', {
    label: 'Tax Deductible Statement',
    description: 'Rich text displayed below the donation amount'
  })

  const showGiftAid = toggleField('showGiftAid', {
    label: 'Show Gift Aid Declaration',
    description: 'Include Gift Aid section on receipts (GBP only)',
    visibleWhen: () => currencyStore.supportedCurrencies.includes('GBP')
  })

  const footerText = textareaField('footerText', {
    label: 'Footer Text',
    rows: 2,
    showSeparatorAfter: true
  })

  const settings = fieldGroup('settings', {
    label: 'Receipt Settings',
    wrapperClass: 'px-4 py-6 sm:px-6 bg-muted/50 rounded-xl border',
    fields: {
      showLogo,
      noLogoAlert,
      headerText,
      showDonorAddress,
      showCampaignName,
      showPaymentMethod,
      taxDeductibleStatement,
      showGiftAid,
      footerText,
      brandingNotice,
      charityNotice
    },
    $storePath: {
      showLogo: 'showLogo',
      headerText: 'headerText',
      showDonorAddress: 'showDonorAddress',
      showCampaignName: 'showCampaignName',
      showPaymentMethod: 'showPaymentMethod',
      taxDeductibleStatement: 'taxDeductibleStatement',
      showGiftAid: 'showGiftAid',
      footerText: 'footerText'
    }
  })

  return { settings }
})
