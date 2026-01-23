<script setup lang="ts">
import DonationFlowWizard from '~/features/donation-form/donor/DonationFlowWizard.vue'
import { useFormConfigStore } from '~/features/donation-form/shared/stores/formConfig'
import { useDonationFormStore } from '~/features/donation-form/donor/stores/donationForm'
import { useImpactCartStore } from '~/features/donation-form/features/impact-cart/shared/stores/impactCart'
import { formConfig } from '~/sample-api-responses/api-sample-response-form-config'
import { products } from '~/sample-api-responses/api-sample-response-products'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const formConfigStore = useFormConfigStore()
const donationStore = useDonationFormStore()
const cartStore = useImpactCartStore()

// Initialize form config when dialog opens
watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      // Initialize form config store with sample data
      formConfigStore.initialize(formConfig, products)
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
