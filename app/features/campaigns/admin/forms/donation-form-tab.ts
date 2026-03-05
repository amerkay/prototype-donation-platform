import {
  fieldGroup,
  alertField,
  toggleField,
  tabsField,
  componentField
} from '~/features/_library/form-builder/api'
import type { FormContext, FieldContext } from '~/features/_library/form-builder/types'
import { useDonationFormBasicForm } from '~/features/donation-form/admin/forms/donation-form-basic-form'
import { useDonationFormDonationAmountsForm } from '~/features/donation-form/admin/forms/donation-form-donation-amounts-form'
import { useMultipleProductsConfigSection } from '~/features/donation-form/features/impact-cart/admin/forms/impact-cart-config-form'
import { useProductSelectorConfigSection } from '~/features/donation-form/features/product-selector/admin/forms/product-selector-config-form'
import { useImpactBoostConfigSection } from '~/features/donation-form/features/impact-boost/admin/forms/impact-boost-config-form'
import { useCoverCostsConfigSection } from '~/features/donation-form/features/cover-costs/admin/forms/cover-costs-config-form'
import { useGiftAidConfigSection } from '~/features/donation-form/features/gift-aid/admin/forms/gift-aid-config-form'
import { useTributeConfigSection } from '~/features/donation-form/features/tribute/admin/forms/tribute-config-form'
import { useContactConsentConfigSection } from '~/features/donation-form/features/contact-consent/admin/forms/contact-consent-config-form'
import { createDonationCustomFieldsConfigSection } from '~/features/donation-form/features/custom-fields/admin/forms/donation-custom-fields-config-form'
import { createEntryFieldsConfigSection } from '~/features/donation-form/features/entry-fields/admin/forms/entry-fields-config-form'
import type { ContextSchemaInput } from '~/features/_library/custom-fields/forms/custom-fields-config-form'
import { useCurrencySettingsStore } from '~/features/settings/admin/stores/currencySettings'
import { useCampaignConfigStore } from '~/features/campaigns/shared/stores/campaignConfig'
import { getCampaignCapabilities } from '~/features/campaigns/shared/utils/campaignCapabilities'
import FormToolbar from '~/features/campaigns/admin/components/FormToolbar.vue'

// Tab value constants — shared between tab definition and targets
export const TAB_FORM_SETTINGS = 'formSettings' as const
export const TAB_AMOUNTS = 'amounts' as const
export const TAB_FEATURES = 'features' as const
export const TAB_CUSTOM_FIELDS = 'customFields' as const
const GROUP_FORM = 'form' as const

/** Type-safe field targets for donor components' data-field attributes.
 *  Keys mirror the form field tree; values are suffix paths
 *  that resolve via useHashTarget's suffix matching. */
export const DONATION_FORM_FIELD_TARGETS = {
  form: {
    title: `${TAB_FORM_SETTINGS}.${GROUP_FORM}.title`,
    subtitle: `${TAB_FORM_SETTINGS}.${GROUP_FORM}.subtitle`
  },
  amounts: {
    enabledCurrencies: `${TAB_AMOUNTS}.enabledCurrencies`,
    frequencies: `${TAB_AMOUNTS}.frequencies`
  },
  features: {
    impactBoost: `${TAB_FEATURES}.impactBoost`,
    impactCart: `${TAB_FEATURES}.impactCart`,
    productSelector: `${TAB_FEATURES}.productSelector`,
    coverCosts: `${TAB_FEATURES}.coverCosts`,
    giftAid: `${TAB_FEATURES}.giftAid`,
    tribute: `${TAB_FEATURES}.tribute`,
    entryFields: `${TAB_FEATURES}.entryFields`,
    contactConsent: `${TAB_FEATURES}.contactConsent`,
    terms: `${TAB_FEATURES}.terms`
  },
  customFields: TAB_CUSTOM_FIELDS
} as const

/**
 * Create donation form tab fields for the unified campaign master form.
 * Returns the inner fields for the "Donation Form" tab, including:
 *  - FormToolbar (componentField)
 *  - Form Settings sub-tab
 *  - Donation Amounts sub-tab
 *  - Features sub-tab (accordion sections)
 *  - Custom Fields sub-tab
 */
export function createDonationFormTabFields(ctx: FormContext, contextSchema: ContextSchemaInput) {
  const currencyStore = useCurrencySettingsStore()
  const store = useCampaignConfigStore()
  const caps = () => getCampaignCapabilities(store.type)

  // Extract fields from each sub-form
  const formBasicFields = useDonationFormBasicForm.setup(ctx)
  const formDonationAmountsFields = useDonationFormDonationAmountsForm.setup(ctx)
  const impactBoostFields = useImpactBoostConfigSection.setup(ctx)
  const impactCartFields = useMultipleProductsConfigSection.setup(ctx)
  const productSelectorFields = useProductSelectorConfigSection.setup(ctx)
  const coverCostsFields = useCoverCostsConfigSection.setup(ctx)
  const giftAidFields = useGiftAidConfigSection.setup(ctx)
  const tributeFields = useTributeConfigSection.setup(ctx)
  const contactConsentFields = useContactConsentConfigSection.setup(ctx)
  const entryFieldsFields = createEntryFieldsConfigSection(
    store.formConfig.products,
    currencyStore.supportedCurrencies
  ).setup(ctx)
  const customFieldsFields = createDonationCustomFieldsConfigSection(contextSchema).setup(ctx)

  // Currency info alert
  const currencyInfo = alertField('currencyInfo', {
    variant: 'info',
    label: 'Organization currency settings',
    description: () => {
      const supportedCurrenciesDisplay = currencyStore.supportedCurrencies.join(', ')
      const multipliers = currencyStore.currencyMultipliers
      const multiplierEntries = Object.entries(multipliers)
      const multipliersDisplay =
        multiplierEntries.length === 0
          ? 'All at default (1.0×)'
          : multiplierEntries
              .map(([currency, value]) => `${currency}: ${value.toFixed(2)}×`)
              .join(', ')
      return `Supported: ${supportedCurrenciesDisplay || 'None configured'}\nMultipliers: ${multipliersDisplay}`
    },
    cta: {
      label: 'Edit currency settings',
      to: '/admin/settings/currency#currencies.currencyTabs.multipliers'
    }
  })

  // Split donation amounts fields into currency vs frequency
  const {
    baseDefaultCurrency: baseDefaultCurrencyField,
    enabledCurrencies: enabledCurrenciesField,
    ...frequencyFields
  } = formDonationAmountsFields

  // Count enabled features for badge
  const featuresBadge = (fCtx: FieldContext) => {
    const sections = fCtx.root.config as Record<string, unknown> | undefined
    const tabs = sections?.sections as Record<string, unknown> | undefined
    const donationForm = tabs?.donationForm as Record<string, unknown> | undefined
    const formTabs = donationForm?.formTabs as Record<string, unknown> | undefined
    const features = formTabs?.features as Record<string, unknown> | undefined
    if (!features) return ''
    const featureKeys = [
      'impactBoost',
      'impactCart',
      'productSelector',
      'coverCosts',
      'giftAid',
      'tribute',
      'entryFields',
      'contactConsent',
      'terms'
    ]
    let count = 0
    for (const key of featureKeys) {
      const group = features[key] as Record<string, unknown> | undefined
      if (group?.enabled === true) count++
    }
    return count > 0 ? `${count} active` : ''
  }

  // Form toolbar (componentField — no store mapping, display only)
  const formToolbar = componentField('formToolbar', {
    component: FormToolbar,
    visibleWhen: () => !store.isFundraiser
  })

  // Inner tabs for form sections
  const formTabs = tabsField('formTabs', {
    tabsListClass: 'w-full',
    defaultValue: store.isFundraiser ? TAB_AMOUNTS : TAB_FORM_SETTINGS,
    tabs: [
      {
        value: TAB_FORM_SETTINGS,
        label: 'Form Settings',
        visibleWhen: () => !store.isFundraiser,
        fields: formBasicFields
      },
      {
        value: TAB_AMOUNTS,
        label: 'Donation Amounts',
        visibleWhen: () => caps().allowsDonationAmounts,
        fields: {
          currencyInfo,
          baseDefaultCurrency: baseDefaultCurrencyField!,
          enabledCurrencies: enabledCurrenciesField!,
          ...frequencyFields
        }
      },
      {
        value: TAB_FEATURES,
        label: 'Features',
        badgeLabel: featuresBadge,
        badgeVariant: 'secondary' as const,
        visibleWhen: () => !store.isFundraiser,
        fields: {
          impactBoost: fieldGroup('impactBoost', {
            label: 'Impact Boost',
            description: 'Suggest higher donation amounts with impact messaging',
            wrapperClass: 'p-4 bg-background rounded-lg border',
            collapsible: true,
            collapsibleDefaultOpen: false,
            badgeLabel: (fCtx) => (fCtx.values.enabled ? 'Enabled' : 'Disabled'),
            badgeVariant: (fCtx) => (fCtx.values.enabled ? 'default' : 'outline'),
            visibleWhen: () => caps().allowsImpactBoost !== false,
            fields: impactBoostFields
          }),
          impactCart: fieldGroup('impactCart', {
            label: 'Impact Cart',
            description: 'Let donors add multiple impact items to a cart',
            wrapperClass: 'p-4 bg-background rounded-lg border',
            collapsible: true,
            collapsibleDefaultOpen: false,
            badgeLabel: (fCtx) => (fCtx.values.enabled ? 'Enabled' : 'Disabled'),
            badgeVariant: (fCtx) => (fCtx.values.enabled ? 'default' : 'outline'),
            visibleWhen: () => caps().allowsImpactCart,
            fields: impactCartFields
          }),
          productSelector: fieldGroup('productSelector', {
            label: 'Product Selector',
            description: 'Allow donors to choose a specific product or fund',
            wrapperClass: 'p-4 bg-background rounded-lg border',
            collapsible: true,
            collapsibleDefaultOpen: false,
            badgeLabel: (fCtx) => (fCtx.values.enabled ? 'Enabled' : 'Disabled'),
            badgeVariant: (fCtx) => (fCtx.values.enabled ? 'default' : 'outline'),
            visibleWhen: () => caps().allowsProductSelector,
            fields: productSelectorFields
          }),
          coverCosts: fieldGroup('coverCosts', {
            label: 'Cover Costs',
            description: 'Offer donors the option to cover processing fees',
            wrapperClass: 'p-4 bg-background rounded-lg border',
            collapsible: true,
            collapsibleDefaultOpen: false,
            badgeLabel: (fCtx) => (fCtx.values.enabled ? 'Enabled' : 'Disabled'),
            badgeVariant: (fCtx) => (fCtx.values.enabled ? 'default' : 'outline'),
            visibleWhen: () => caps().allowsCoverCosts,
            fields: {
              ...coverCostsFields,
              charityCostsInfo: alertField('charityCostsInfo', {
                variant: 'info',
                description:
                  'The cost breakdown shown in the cover costs modal is configured at the organization level.',
                cta: {
                  label: 'Edit charity costs',
                  to: '/admin/settings/charity#charityCosts',
                  inline: true
                }
              })
            }
          }),
          giftAid: fieldGroup('giftAid', {
            label: 'Gift Aid',
            description: 'Enable UK Gift Aid tax reclaim declarations',
            wrapperClass: 'p-4 bg-background rounded-lg border',
            collapsible: true,
            collapsibleDefaultOpen: false,
            badgeLabel: (fCtx) => (fCtx.values.enabled ? 'Enabled' : 'Disabled'),
            badgeVariant: (fCtx) => (fCtx.values.enabled ? 'default' : 'outline'),
            visibleWhen: () => caps().allowsGiftAid,
            fields: giftAidFields
          }),
          tribute: fieldGroup('tribute', {
            label: 'Tribute & Dedications',
            description: 'Allow donations in honor or memory of someone',
            wrapperClass: 'p-4 bg-background rounded-lg border',
            collapsible: true,
            collapsibleDefaultOpen: false,
            badgeLabel: (fCtx) => (fCtx.values.enabled ? 'Enabled' : 'Disabled'),
            badgeVariant: (fCtx) => (fCtx.values.enabled ? 'default' : 'outline'),
            visibleWhen: () => caps().allowsTribute,
            fields: tributeFields
          }),
          entryFields: fieldGroup('entryFields', {
            label: 'Entry Fields',
            description: 'Collect additional donor information at checkout',
            wrapperClass: 'p-4 bg-background rounded-lg border',
            collapsible: true,
            collapsibleDefaultOpen: false,
            badgeLabel: (fCtx) => (fCtx.values.enabled ? 'Enabled' : 'Disabled'),
            badgeVariant: (fCtx) => (fCtx.values.enabled ? 'default' : 'outline'),
            visibleWhen: () => caps().allowsEntryFields,
            fields: entryFieldsFields
          }),
          contactConsent: fieldGroup('contactConsent', {
            label: 'Contact Consent',
            description: 'Ask donors for marketing communication consent',
            wrapperClass: 'p-4 bg-background rounded-lg border',
            collapsible: true,
            collapsibleDefaultOpen: false,
            badgeLabel: (fCtx) => (fCtx.values.enabled ? 'Enabled' : 'Disabled'),
            badgeVariant: (fCtx) => (fCtx.values.enabled ? 'default' : 'outline'),
            fields: contactConsentFields
          }),
          terms: fieldGroup('terms', {
            label: 'Terms & Conditions',
            description: 'Require donors to accept terms before completing',
            wrapperClass: 'p-4 bg-background rounded-lg border',
            collapsible: true,
            collapsibleDefaultOpen: false,
            badgeLabel: (fCtx) => (fCtx.values.enabled ? 'Enabled' : 'Disabled'),
            badgeVariant: (fCtx) => (fCtx.values.enabled ? 'default' : 'outline'),
            fields: {
              enabled: toggleField('enabled', {
                label: 'Enable Terms & Conditions',
                description: 'Require donors to accept terms before completing',
                labelClass: 'font-bold',
                showSeparatorAfter: true
              }),
              termsSettingsInfo: alertField('termsSettingsInfo', {
                variant: 'info',
                description:
                  'Terms content, mode, and label are configured at the organization level.',
                cta: {
                  label: 'Edit terms settings',
                  to: '/admin/settings/charity#terms',
                  inline: true
                }
              })
            }
          })
        }
      },
      {
        value: TAB_CUSTOM_FIELDS,
        label: 'Custom Fields',
        visibleWhen: () => !store.isFundraiser,
        fields: customFieldsFields
      }
    ]
  })

  return { formToolbar, formTabs }
}
