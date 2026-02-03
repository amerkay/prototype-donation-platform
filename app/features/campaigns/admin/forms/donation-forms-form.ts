import * as z from 'zod'
import { defineForm, componentField } from '~/features/_library/form-builder/api'
import { useCampaignConfigStore } from '~/features/campaigns/shared/stores/campaignConfig'
import FormsList from '~/features/campaigns/admin/components/FormsList.vue'

/**
 * Campaign basic settings form
 * Contains donation form assignments
 * Hidden entirely for fundraiser campaigns (forms are inherited from template)
 */
export const useCampaignDonationFormsForm = defineForm('campaign-basic', (_ctx) => {
  const store = useCampaignConfigStore()

  // Component field with validation to ensure at least 1 donation form exists
  // Note: Validation uses props.formsCount which is injected by CampaignMasterConfigPanel
  const formsList = componentField('formsList', {
    component: FormsList,
    // Hide for fundraiser campaigns (they inherit forms from parent template)
    visibleWhen: () => !store.isFundraiser,
    // Validate using the formsCount prop that will be injected
    rules: z.any().refine(
      (props: Record<string, unknown>) => {
        // Props will contain formsCount injected by parent
        return ((props?.formsCount as number | undefined) ?? 0) > 0
      },
      { message: 'At least one donation form is required for this campaign' }
    )
  })

  return { formsList }
})
