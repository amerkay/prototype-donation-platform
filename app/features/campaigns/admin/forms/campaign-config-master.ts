import { defineForm, fieldGroup } from '~/features/_library/form-builder/api'
import type { FormContext } from '~/features/_library/form-builder/types'
import { useCampaignBasicSettingsForm } from '~/features/campaigns/admin/forms/campaign-basic-settings-form'
import { useCrowdfundingSettingsForm } from '~/features/campaigns/admin/forms/crowdfunding-settings-form'
import { useP2PSettingsForm } from '~/features/campaigns/admin/forms/p2p-settings-form'
import { useSocialSharingForm } from '~/features/campaigns/admin/forms/social-sharing-form'

/**
 * Master admin form that consolidates all campaign configuration sections
 * Each section is wrapped in a collapsible field-group with card styling
 * Follows the same pattern as donation form master
 */
export function createCampaignConfigMaster() {
  return defineForm('campaignConfigMaster', (ctx: FormContext) => {
    // Extract fields from each sub-form by calling their setup functions
    const basicSettingsFields = useCampaignBasicSettingsForm.setup(ctx)
    const crowdfundingFields = useCrowdfundingSettingsForm.setup(ctx)
    const peerToPeerFields = useP2PSettingsForm.setup(ctx)
    const socialSharingFields = useSocialSharingForm.setup(ctx)

    // Wrap each form's fields in a collapsible field-group with card styling
    const basicSettings = fieldGroup('basicSettings', {
      label: 'Campaign Settings',
      collapsible: true,
      collapsibleDefaultOpen: true,
      wrapperClass: 'px-4 py-6 sm:px-6 bg-muted/50 rounded-xl border',
      fields: basicSettingsFields
    })

    const crowdfunding = fieldGroup('crowdfunding', {
      label: 'Crowdfunding Page',
      collapsible: true,
      collapsibleDefaultOpen: false,
      wrapperClass: 'px-4 py-6 sm:px-6 bg-muted/50 rounded-xl border',
      fields: crowdfundingFields
    })

    const peerToPeer = fieldGroup('peerToPeer', {
      label: 'Fundraisers (P2P)',
      collapsible: true,
      collapsibleDefaultOpen: false,
      wrapperClass: 'px-4 py-6 sm:px-6 bg-muted/50 rounded-xl border',
      fields: peerToPeerFields
    })

    const socialSharing = fieldGroup('socialSharing', {
      label: 'Social Sharing',
      collapsible: true,
      collapsibleDefaultOpen: false,
      wrapperClass: 'px-4 py-6 sm:px-6 bg-muted/50 rounded-xl border',
      fields: socialSharingFields
    })

    return {
      basicSettings,
      crowdfunding,
      peerToPeer,
      socialSharing
    }
  })
}
