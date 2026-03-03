import * as z from 'zod'
import { defineForm, componentField } from '~/features/_library/form-builder/api'
import MatchPeriodsList from '~/features/campaigns/features/matched-giving/admin/components/MatchPeriodsList.vue'

/**
 * Matched Giving settings form
 * Renders the match periods list component (add/edit/delete periods with depleting pools)
 */
export const useMatchedGivingSettingsForm = defineForm('matchedGiving', () => {
  const periodsList = componentField('periodsList', {
    component: MatchPeriodsList,
    rules: z.any().optional()
  })

  return { periodsList }
})
