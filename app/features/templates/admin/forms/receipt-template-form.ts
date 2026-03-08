import {
  defineForm,
  textField,
  textareaField,
  toggleField,
  richTextField,
  alertField,
  fieldGroup,
  tabsField
} from '~/features/_library/form-builder/api'
import { useCurrencySettingsStore } from '~/features/settings/admin/stores/currencySettings'
import { useBrandingSettingsStore } from '~/features/settings/admin/stores/brandingSettings'
import type { ReceiptTemplateTargets } from '~/features/templates/shared/types'

export const RECEIPT_TEMPLATE_TARGETS = {
  showLogo: 'settings.receiptTabs.header.showLogo',
  charityNotice: 'settings.receiptTabs.header.charityNotice',
  headerText: 'settings.receiptTabs.header.headerText',
  showDonorAddress: 'settings.receiptTabs.content.showDonorAddress',
  showCampaignName: 'settings.receiptTabs.content.showCampaignName',
  showPaymentMethod: 'settings.receiptTabs.content.showPaymentMethod',
  taxDeductibleStatement: 'settings.receiptTabs.content.taxDeductibleStatement',
  showGiftAid: 'settings.receiptTabs.content.showGiftAid',
  footerText: 'settings.receiptTabs.footer.footerText',
  showPhone: 'settings.receiptTabs.footer.showPhone',
  showEmail: 'settings.receiptTabs.footer.showEmail',
  showWebsite: 'settings.receiptTabs.footer.showWebsite'
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

  // --- Header fields ---

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
    label: 'Header Text'
  })

  // --- Content fields ---

  const showDonorAddress = toggleField('showDonorAddress', {
    label: 'Show Donor Address',
    description: 'Display donor address on receipt (if available)'
  })

  const showCampaignName = toggleField('showCampaignName', {
    label: 'Show Campaign Name',
    description: 'Show which campaign the donation was for'
  })

  const showPaymentMethod = toggleField('showPaymentMethod', {
    label: 'Show Payment Method',
    description: 'Display payment method details'
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

  // --- Footer fields ---

  const footerText = textareaField('footerText', {
    label: 'Footer Text',
    rows: 2
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

  // --- Tabbed layout ---
  const receiptTabs = tabsField('receiptTabs', {
    label: 'Receipt Settings',
    tabsListClass: 'w-full',
    defaultValue: 'header',
    tabs: [
      {
        value: 'header',
        label: 'Header',
        fields: { showLogo, noLogoAlert, headerText, charityNotice, brandingNotice }
      },
      {
        value: 'content',
        label: 'Content',
        fields: {
          showDonorAddress,
          showCampaignName,
          showPaymentMethod,
          taxDeductibleStatement,
          showGiftAid
        }
      },
      {
        value: 'footer',
        label: 'Footer',
        fields: { footerText, showPhone, showEmail, showWebsite }
      }
    ]
  })

  const settings = fieldGroup('settings', {
    wrapperClass: 'px-4 py-6 sm:px-6 bg-muted/50 rounded-xl border',
    fields: { receiptTabs },
    $storePath: 'flatten'
  })

  return { settings }
})
