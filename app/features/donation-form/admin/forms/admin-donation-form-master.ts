import {
  defineForm,
  fieldGroup,
  alertField,
  toggleField,
  tabsField
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
import { useFormConfigStore } from '~/features/donation-form/shared/stores/formConfig'
import { useCampaignConfigStore } from '~/features/campaigns/shared/stores/campaignConfig'
import { getCampaignCapabilities } from '~/features/campaigns/shared/utils/campaignCapabilities'

// Tab value constants — shared between tab definition and targets
const TAB_FORM_SETTINGS = 'formSettings' as const
const TAB_AMOUNTS = 'amounts' as const
const TAB_FEATURES = 'features' as const
const TAB_CUSTOM_FIELDS = 'customFields' as const
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
 * Master admin form that consolidates all donation form configuration sections.
 * Uses top-level tabs for navigation (Form Settings, Currency, Amounts, Features, Custom Fields).
 *
 * Feature visibility is driven by getCampaignCapabilities() — the single source of truth.
 */
export function createAdminDonationFormMaster(contextSchema: ContextSchemaInput) {
  return defineForm('donationFormAdmin', (ctx: FormContext) => {
    const currencyStore = useCurrencySettingsStore()
    const formConfigStore = useFormConfigStore()
    const campaignStore = useCampaignConfigStore()

    /** Campaign capabilities — determines which features are available */
    const caps = () => getCampaignCapabilities(campaignStore.type)

    // Extract fields from each sub-form by calling their setup functions
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
      formConfigStore.products,
      currencyStore.supportedCurrencies
    ).setup(ctx)
    const customFieldsFields = createDonationCustomFieldsConfigSection(contextSchema).setup(ctx)

    // Currency settings info alert
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
      const features = tabs?.features as Record<string, unknown> | undefined
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

    // Top-level tabs for form navigation
    const sections = tabsField('sections', {
      tabsListClass: 'w-full',
      defaultValue: campaignStore.isFundraiser ? TAB_AMOUNTS : TAB_FORM_SETTINGS,
      tabs: [
        {
          value: TAB_FORM_SETTINGS,
          label: 'Form Settings',
          visibleWhen: () => !campaignStore.isFundraiser,
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
          visibleWhen: () => !campaignStore.isFundraiser,
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
          visibleWhen: () => !campaignStore.isFundraiser,
          fields: customFieldsFields
        }
      ]
    })

    // Wrap in a fieldGroup with $storePath to flatten tab nesting to flat store paths
    const config = fieldGroup('config', {
      fields: { sections },
      $storePath: {
        // Tab "formSettings"
        [`sections.${TAB_FORM_SETTINGS}.${GROUP_FORM}`]: GROUP_FORM,
        // Tab "amounts" (includes currency + frequencies)
        [`sections.${TAB_AMOUNTS}.baseDefaultCurrency`]: 'donationAmounts.baseDefaultCurrency',
        [`sections.${TAB_AMOUNTS}.enabledCurrencies`]: 'donationAmounts.enabledCurrencies',
        [`sections.${TAB_AMOUNTS}.frequencies`]: 'donationAmounts.frequencies',
        // Tab "features" — each sub-feature flattened
        [`sections.${TAB_FEATURES}.impactBoost`]: 'impactBoost',
        [`sections.${TAB_FEATURES}.impactCart`]: 'impactCart',
        [`sections.${TAB_FEATURES}.productSelector`]: 'productSelector',
        [`sections.${TAB_FEATURES}.coverCosts`]: 'coverCosts',
        [`sections.${TAB_FEATURES}.giftAid`]: 'giftAid',
        [`sections.${TAB_FEATURES}.tribute`]: 'tribute',
        [`sections.${TAB_FEATURES}.entryFields`]: 'entryFields',
        [`sections.${TAB_FEATURES}.contactConsent`]: 'contactConsent',
        [`sections.${TAB_FEATURES}.terms`]: 'terms',
        // Tab "customFields"
        [`sections.${TAB_CUSTOM_FIELDS}`]: TAB_CUSTOM_FIELDS
      }
    })

    return { config }
  })
}
