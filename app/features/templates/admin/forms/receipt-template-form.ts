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
import type { ReceiptTemplateTargets } from '~/features/templates/shared/types'

export const RECEIPT_TEMPLATE_TARGETS = {
  showLogo: 'settings.showLogo',
  charityNotice: 'settings.charityNotice',
  headerText: 'settings.headerText',
  showDonorAddress: 'settings.showDonorAddress',
  showCampaignName: 'settings.showCampaignName',
  showPaymentMethod: 'settings.showPaymentMethod',
  taxDeductibleStatement: 'settings.taxDeductibleStatement',
  showGiftAid: 'settings.showGiftAid',
  footerText: 'settings.footerText',
  showPhone: 'settings.showPhone',
  showEmail: 'settings.showEmail',
  showWebsite: 'settings.showWebsite'
} as const satisfies Record<keyof ReceiptTemplateTargets, string>

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
      'Charity name, registration number, address, phone, email, and website come from charity settings, with per-currency overrides when configured.',
    cta: {
      label: 'Edit charity settings',
      to: '/admin/settings/charity',
      inline: true
    },
    showSeparatorAfter: true
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
    description: 'Display donor address on receipt (if available)'
  })

  const showPhone = toggleField('showPhone', {
    label: 'Show Charity Phone',
    description: 'Display charity phone number on receipt'
  })

  const showEmail = toggleField('showEmail', {
    label: 'Show Charity Email',
    description: 'Display charity reply-to email on receipt'
  })

  const showWebsite = toggleField('showWebsite', {
    label: 'Show Charity Website',
    description: 'Display charity website on receipt'
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
      headerText,
      showDonorAddress,
      showCampaignName,
      showPaymentMethod,
      taxDeductibleStatement,
      showGiftAid,
      footerText,
      showPhone,
      showEmail,
      showWebsite,
      noLogoAlert,
      charityNotice,
      brandingNotice
    },
    $storePath: 'flatten'
  })

  return { settings }
})
