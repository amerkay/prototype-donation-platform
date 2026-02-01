<script setup lang="ts">
import DonationFlowWizard from '~/features/donation-form/donor/DonationFlowWizard.vue'
import { useFormConfigStore } from '~/features/donation-form/shared/stores/formConfig'
import { useDonationFormStore } from '~/features/donation-form/donor/stores/donationForm'
import { useImpactCartStore } from '~/features/donation-form/features/impact-cart/donor/stores/impactCart'
import { useForms } from '~/features/campaigns/shared/composables/useForms'
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
const { defaultForm } = useForms(props.campaignId)

// Initialize form config when dialog opens
watch(
  () => props.open,
  (isOpen) => {
    if (isOpen && defaultForm.value) {
      // Initialize form config store with default form's config and products
      formConfigStore.initialize(defaultForm.value.config, defaultForm.value.products)
      // Reset donation form state
      donationStore.reset()
      cartStore.reset()
    }
  },
  { immediate: true }
)
</script>

<template>
  <Dialog :open="props.open" @update:open="emit('update:open', $event)">
    <DialogContent class="max-w-2xl max-h-[90vh] p-0 overflow-hidden flex flex-col">
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
