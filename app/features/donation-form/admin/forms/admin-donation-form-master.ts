import { defineForm, fieldGroup } from '~/features/_library/form-builder/api'
import type { FormContext } from '~/features/_library/form-builder/types'
import { provideAccordionGroup } from '~/features/_library/form-builder/composables/useAccordionGroup'
import { useDonationFormConfigForm } from '~/features/donation-form/admin/forms/donation-form-config-form'
import { useMultipleProductsConfigSection } from '~/features/donation-form/features/impact-cart/admin/forms/impact-cart-config-form'
import { useProductSelectorConfigSection } from '~/features/donation-form/features/product-selector/admin/forms/product-selector-config-form'
import { useImpactJourneyConfigSection } from '~/features/donation-form/features/impact-journey/admin/forms/impact-journey-config-form'
import { useCoverCostsConfigSection } from '~/features/donation-form/features/cover-costs/admin/forms/cover-costs-config-form'
import { useGiftAidConfigSection } from '~/features/donation-form/features/gift-aid/admin/forms/gift-aid-config-form'
import { useTributeConfigSection } from '~/features/donation-form/features/tribute/admin/forms/tribute-config-form'
import { createDonationCustomFieldsConfigSection } from '~/features/donation-form/features/custom-fields/admin/forms/donation-custom-fields-config-form'
import type { ContextSchema } from '~/features/_library/form-builder/conditions'

/**
 * Master admin form that consolidates all donation form configuration sections
 * Each section is wrapped in a collapsible field-group with card styling
 */
export function createAdminDonationFormMaster(contextSchema: ContextSchema) {
  return defineForm('donationFormAdmin', (ctx: FormContext) => {
    // Provide accordion group for single-open behavior
    provideAccordionGroup()

    // Extract fields from each sub-form by calling their setup functions
    const formSettingsFields = useDonationFormConfigForm.setup(ctx)
    const impactJourneyFields = useImpactJourneyConfigSection.setup(ctx)
    const impactCartFields = useMultipleProductsConfigSection.setup(ctx)
    const productSelectorFields = useProductSelectorConfigSection.setup(ctx)
    const coverCostsFields = useCoverCostsConfigSection.setup(ctx)
    const giftAidFields = useGiftAidConfigSection.setup(ctx)
    const tributeFields = useTributeConfigSection.setup(ctx)
    const customFieldsFields = createDonationCustomFieldsConfigSection(contextSchema).setup(ctx)

    // Form Settings - standalone section
    const formSettings = fieldGroup('formSettings', {
      label: 'Form Settings',
      description: 'Configure basic form settings, and donation amounts and frequency options.',
      collapsible: true,
      collapsibleDefaultOpen: true,
      wrapperClass: 'px-4 py-6 sm:px-6 bg-muted/50 rounded-xl border',
      fields: formSettingsFields
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
        impactJourney: fieldGroup('impactJourney', {
          // label: 'Impact Journey',
          wrapperClass: 'p-4 bg-background rounded-lg border',
          fields: impactJourneyFields
        }),
        impactCart: fieldGroup('impactCart', {
          // label: 'Impact Cart',
          wrapperClass: 'p-4 bg-background rounded-lg border',
          fields: impactCartFields
        }),
        productSelector: fieldGroup('productSelector', {
          // label: 'Product Selector',
          wrapperClass: 'p-4 bg-background rounded-lg border',
          fields: productSelectorFields
        }),
        coverCosts: fieldGroup('coverCosts', {
          // label: 'Cover Costs',
          wrapperClass: 'p-4 bg-background rounded-lg border',
          fields: coverCostsFields
        }),
        giftAid: fieldGroup('giftAid', {
          // label: 'Gift Aid',
          wrapperClass: 'p-4 bg-background rounded-lg border',
          fields: giftAidFields
        }),
        tribute: fieldGroup('tribute', {
          // label: 'Tribute Settings',
          wrapperClass: 'p-4 bg-background rounded-lg border',
          fields: tributeFields
        })
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
      features,
      customFields
    }
  })
}
