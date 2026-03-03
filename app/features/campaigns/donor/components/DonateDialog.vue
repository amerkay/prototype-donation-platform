<script setup lang="ts">
import DonationFlowWizard from '~/features/donation-form/donor/DonationFlowWizard.vue'
import { useInjectedBrandingStyle } from '~/features/settings/admin/composables/useBrandingCssVars'
import { useFormConfigStore } from '~/features/donation-form/shared/stores/formConfig'
import { useDonationFormStore } from '~/features/donation-form/donor/stores/donationForm'
import { useImpactCartStore } from '~/features/donation-form/features/impact-cart/donor/stores/impactCart'
import { useCampaigns } from '~/features/campaigns/shared/composables/useCampaigns'
import {
  MATCHED_GIVING_KEY,
  DONATION_FREQUENCY_KEY
} from '~/features/campaigns/features/matched-giving/donor/composables/useMatchedGiving'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'

const props = defineProps<{
  open: boolean
  campaignId: string
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const formConfigStore = useFormConfigStore()
const donationStore = useDonationFormStore()
const cartStore = useImpactCartStore()
const { campaigns } = useCampaigns()
const campaign = computed(() => campaigns.value.find((c) => c.id === props.campaignId))
const form = computed(() => campaign.value?.form ?? null)
const brandingStyle = useInjectedBrandingStyle()

// Provide matched giving context for deep child components (AmountSelector)
const matchedGiving = computed(() => campaign.value?.matchedGiving)
provide(MATCHED_GIVING_KEY, matchedGiving)

// Provide current frequency so match messaging hides on recurring tabs
const donationFrequency = computed(
  () => donationStore.currentFrequency as 'once' | 'monthly' | 'yearly'
)
provide(DONATION_FREQUENCY_KEY, donationFrequency)

// Initialize form config when dialog opens
watch(
  () => props.open,
  (isOpen) => {
    if (isOpen && form.value) {
      formConfigStore.initialize(form.value.config, form.value.products, form.value.id)
      donationStore.initialize(form.value.id, form.value.config.donationAmounts.baseDefaultCurrency)
      cartStore.initialize(form.value.id)
    }
  },
  { immediate: true }
)
</script>

<template>
  <Dialog :open="props.open" @update:open="emit('update:open', $event)">
    <DialogContent
      class="max-w-2xl max-h-[90vh] p-0 overflow-hidden flex flex-col"
      :style="brandingStyle"
    >
      <!-- Header -->
      <!-- <DialogHeader class="px-6 py-4 border-b shrink-0">
        <DialogTitle>Make a Donation</DialogTitle>
        <DialogDescription>Choose your donation amount</DialogDescription>
      </DialogHeader> -->

      <!-- Donation Form -->
      <ScrollArea class="flex-1 overflow-auto">
        <div class="p-0">
          <DonationFlowWizard
            v-if="formConfigStore.fullConfig"
            :config="formConfigStore.fullConfig"
          />
        </div>
      </ScrollArea>
    </DialogContent>
  </Dialog>
</template>
