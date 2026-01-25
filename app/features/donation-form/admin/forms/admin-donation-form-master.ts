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

    // Wrap each form's fields in a collapsible field-group with card styling
    const formSettings = fieldGroup('formSettings', {
      label: 'Form Settings',
      collapsible: true,
      collapsibleDefaultOpen: true,
      wrapperClass: 'px-4 py-6 sm:px-6 bg-muted/50 rounded-xl border',
      fields: formSettingsFields
    })

    const impactJourney = fieldGroup('impactJourney', {
      label: 'Impact Journey',
      collapsible: true,
      collapsibleDefaultOpen: false,
      wrapperClass: 'px-4 py-6 sm:px-6 bg-muted/50 rounded-xl border',
      fields: impactJourneyFields
    })

    const impactCart = fieldGroup('impactCart', {
      label: 'Impact Cart',
      collapsible: true,
      collapsibleDefaultOpen: false,
      wrapperClass: 'px-4 py-6 sm:px-6 bg-muted/50 rounded-xl border',
      fields: impactCartFields
    })

    const productSelector = fieldGroup('productSelector', {
      label: 'Product Selector',
      collapsible: true,
      collapsibleDefaultOpen: false,
      wrapperClass: 'px-4 py-6 sm:px-6 bg-muted/50 rounded-xl border',
      fields: productSelectorFields
    })

    const coverCosts = fieldGroup('coverCosts', {
      label: 'Cover Costs',
      collapsible: true,
      collapsibleDefaultOpen: false,
      wrapperClass: 'px-4 py-6 sm:px-6 bg-muted/50 rounded-xl border',
      fields: coverCostsFields
    })

    const giftAid = fieldGroup('giftAid', {
      label: 'Gift Aid',
      collapsible: true,
      collapsibleDefaultOpen: false,
      wrapperClass: 'px-4 py-6 sm:px-6 bg-muted/50 rounded-xl border',
      fields: giftAidFields
    })

    const tribute = fieldGroup('tribute', {
      label: 'Tribute Settings',
      collapsible: true,
      collapsibleDefaultOpen: false,
      wrapperClass: 'px-4 py-6 sm:px-6 bg-muted/50 rounded-xl border',
      fields: tributeFields
    })

    const customFields = fieldGroup('customFields', {
      label: 'Custom Fields',
      collapsible: true,
      collapsibleDefaultOpen: false,
      wrapperClass: 'px-4 py-6 sm:px-6 bg-muted/50 rounded-xl border',
      fields: customFieldsFields
    })

    return {
      formSettings,
      impactJourney,
      impactCart,
      productSelector,
      coverCosts,
      giftAid,
      tribute,
      customFields
    }
  })
}
