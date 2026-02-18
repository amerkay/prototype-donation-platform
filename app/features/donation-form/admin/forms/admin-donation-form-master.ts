import { defineForm, fieldGroup, alertField } from '~/features/_library/form-builder/api'
import type { FieldContext, FormContext } from '~/features/_library/form-builder/types'
import { provideAccordionGroup } from '~/features/_library/form-builder/composables/useAccordionGroup'
import { useDonationFormBasicForm } from '~/features/donation-form/admin/forms/donation-form-basic-form'
import { useDonationFormDonationAmountsForm } from '~/features/donation-form/admin/forms/donation-form-donation-amounts-form'
import { useMultipleProductsConfigSection } from '~/features/donation-form/features/impact-cart/admin/forms/impact-cart-config-form'
import { useProductSelectorConfigSection } from '~/features/donation-form/features/product-selector/admin/forms/product-selector-config-form'
import { useImpactBoostConfigSection } from '~/features/donation-form/features/impact-boost/admin/forms/impact-boost-config-form'
import { useCoverCostsConfigSection } from '~/features/donation-form/features/cover-costs/admin/forms/cover-costs-config-form'
import { useGiftAidConfigSection } from '~/features/donation-form/features/gift-aid/admin/forms/gift-aid-config-form'
import { useTributeConfigSection } from '~/features/donation-form/features/tribute/admin/forms/tribute-config-form'
import { createDonationCustomFieldsConfigSection } from '~/features/donation-form/features/custom-fields/admin/forms/donation-custom-fields-config-form'
import { createEntryFieldsConfigSection } from '~/features/donation-form/features/entry-fields/admin/forms/entry-fields-config-form'
import type { ContextSchemaInput } from '~/features/_library/custom-fields/forms/custom-fields-config-form'
import { useCurrencySettingsStore } from '~/features/settings/admin/stores/currencySettings'
import { useFormConfigStore } from '~/features/donation-form/shared/stores/formConfig'
import { FEATURE_FORM_TYPE_SUPPORT, type FormType } from '~/features/donation-form/shared/types'

/** Check if a feature is supported for the current form type from root form values */
function isDonationFormType(ctx: FieldContext): boolean {
  const formType = (
    (ctx.root?.formSettings as Record<string, unknown>)?.form as Record<string, unknown>
  )?.formType as FormType | undefined
  return (formType ?? 'donation') === 'donation'
}

function isFeatureSupportedForFormType(featureKey: string, ctx: FieldContext): boolean {
  const formType = (
    (ctx.root?.formSettings as Record<string, unknown>)?.form as Record<string, unknown>
  )?.formType as FormType | undefined
  const supported = FEATURE_FORM_TYPE_SUPPORT[featureKey]
  if (!supported) return true
  return supported.includes(formType ?? 'donation')
}

/**
 * Master admin form that consolidates all donation form configuration sections
 * Each section is wrapped in a collapsible field-group with card styling
 */
export function createAdminDonationFormMaster(contextSchema: ContextSchemaInput) {
  return defineForm('donationFormAdmin', (ctx: FormContext) => {
    const currencyStore = useCurrencySettingsStore()
    const formConfigStore = useFormConfigStore()

    // Provide accordion group for single-open behavior
    provideAccordionGroup()

    // Extract fields from each sub-form by calling their setup functions
    const formBasicFields = useDonationFormBasicForm.setup(ctx)
    const formDonationAmountsFields = useDonationFormDonationAmountsForm.setup(ctx)
    const impactBoostFields = useImpactBoostConfigSection.setup(ctx)
    const impactCartFields = useMultipleProductsConfigSection.setup(ctx)
    const productSelectorFields = useProductSelectorConfigSection.setup(ctx)
    const coverCostsFields = useCoverCostsConfigSection.setup(ctx)
    const giftAidFields = useGiftAidConfigSection.setup(ctx)
    const tributeFields = useTributeConfigSection.setup(ctx)
    const entryFieldsFields = createEntryFieldsConfigSection(
      formConfigStore.products,
      currencyStore.supportedCurrencies
    ).setup(ctx)
    const customFieldsFields = createDonationCustomFieldsConfigSection(contextSchema).setup(ctx)

    // Currency settings info - display organization's currency config
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
        to: '/admin/settings/currency#currencyMultipliers'
      }
    })

    // Form Settings - basic settings and branding info
    const formSettings = fieldGroup('formSettings', {
      label: 'Form Settings',
      description: 'Configure basic form settings.',
      collapsible: true,
      collapsibleDefaultOpen: true,
      wrapperClass: 'px-4 py-6 sm:px-6 bg-muted/50 rounded-xl border',
      fields: formBasicFields,
      // Flatten structure: form.formSettings.form → store.form
      $storePath: {
        form: 'form'
      }
    })

    // Donation Amounts - standalone section (donation type only)
    const donationAmounts = fieldGroup('donationAmounts', {
      label: 'Donation Amounts',
      description: 'Configure donation amounts and frequency options.',
      collapsible: true,
      collapsibleDefaultOpen: false,
      wrapperClass: 'px-4 py-6 sm:px-6 bg-muted/50 rounded-xl border',
      visibleWhen: (ctx: FieldContext) => isDonationFormType(ctx),
      fields: {
        currencyInfo,
        ...formDonationAmountsFields
      },
      // Flatten structure: form.donationAmounts.baseDefaultCurrency → store.donationAmounts.baseDefaultCurrency
      $storePath: {
        baseDefaultCurrency: 'donationAmounts.baseDefaultCurrency',
        frequencies: 'donationAmounts.frequencies'
      }
    })

    // Features - all donation features grouped together
    const features = fieldGroup('features', {
      label: 'Features',
      description:
        'Configure impact messaging, cart behavior, product selection, cost coverage, Gift Aid, and tribute options.',
      collapsible: true,
      collapsibleDefaultOpen: false,
      wrapperClass: 'px-4 py-6 sm:px-6 bg-muted/50 rounded-xl border',
      fields: {
        impactBoost: fieldGroup('impactBoost', {
          // label: 'Impact Boost',
          wrapperClass: 'p-4 bg-background rounded-lg border',
          visibleWhen: (ctx: FieldContext) => isFeatureSupportedForFormType('impactBoost', ctx),
          fields: impactBoostFields
        }),
        impactCart: fieldGroup('impactCart', {
          // label: 'Impact Cart',
          wrapperClass: 'p-4 bg-background rounded-lg border',
          fields: impactCartFields
        }),
        productSelector: fieldGroup('productSelector', {
          // label: 'Product Selector',
          wrapperClass: 'p-4 bg-background rounded-lg border',
          visibleWhen: (ctx: FieldContext) => isFeatureSupportedForFormType('productSelector', ctx),
          fields: productSelectorFields
        }),
        coverCosts: fieldGroup('coverCosts', {
          // label: 'Cover Costs',
          wrapperClass: 'p-4 bg-background rounded-lg border',
          visibleWhen: (ctx: FieldContext) => isFeatureSupportedForFormType('coverCosts', ctx),
          fields: coverCostsFields
        }),
        giftAid: fieldGroup('giftAid', {
          // label: 'Gift Aid',
          wrapperClass: 'p-4 bg-background rounded-lg border',
          visibleWhen: (ctx: FieldContext) => isFeatureSupportedForFormType('giftAid', ctx),
          fields: giftAidFields
        }),
        tribute: fieldGroup('tribute', {
          // label: 'Tribute Settings',
          wrapperClass: 'p-4 bg-background rounded-lg border',
          visibleWhen: (ctx: FieldContext) => isFeatureSupportedForFormType('tribute', ctx),
          fields: tributeFields
        }),
        entryFields: fieldGroup('entryFields', {
          wrapperClass: 'p-4 bg-background rounded-lg border',
          visibleWhen: (ctx: FieldContext) => isFeatureSupportedForFormType('entryFields', ctx),
          fields: entryFieldsFields
        })
      },
      // Flatten nested structure: form.features.impactBoost → store.impactBoost
      $storePath: {
        impactBoost: 'impactBoost',
        impactCart: 'impactCart',
        productSelector: 'productSelector',
        coverCosts: 'coverCosts',
        giftAid: 'giftAid',
        tribute: 'tribute',
        entryFields: 'entryFields'
      }
    })

    // Custom Fields - standalone section
    const customFields = fieldGroup('customFields', {
      label: 'Custom Fields',
      description: 'Add custom form fields with flexible field types and conditional logic.',
      collapsible: true,
      collapsibleDefaultOpen: false,
      wrapperClass: 'px-4 py-6 sm:px-6 bg-muted/50 rounded-xl border',
      fields: customFieldsFields
    })

    return {
      formSettings,
      donationAmounts,
      features,
      customFields
    }
  })
}
