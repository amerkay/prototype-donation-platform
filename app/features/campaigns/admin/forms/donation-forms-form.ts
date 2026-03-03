import * as z from 'zod'
import { defineForm, componentField } from '~/features/_library/form-builder/api'
import { useCampaignConfigStore } from '~/features/campaigns/shared/stores/campaignConfig'
import FormCard from '~/features/campaigns/admin/components/FormCard.vue'

/**
 * Campaign form section — shows the single form card (1:1 campaign:form)
 * Hidden entirely for fundraiser campaigns (forms are inherited from template)
 */
export const useCampaignDonationFormsForm = defineForm('campaign-basic', (_ctx) => {
  const store = useCampaignConfigStore()

  const formCard = componentField('formCard', {
    component: FormCard,
    visibleWhen: () => !store.isFundraiser,
    rules: z.any().refine(
      (props: Record<string, unknown>) => {
        return ((props?.formsCount as number | undefined) ?? 0) > 0
      },
      { message: 'A donation form is required for this campaign' }
    )
  })

  return { formCard }
})
