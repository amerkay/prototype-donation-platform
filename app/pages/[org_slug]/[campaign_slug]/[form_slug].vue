<script setup lang="ts">
import DonationFlowWizard from '~/features/donation-form/donor/DonationFlowWizard.vue'
import { useFormConfigStore } from '~/features/donation-form/shared/stores/formConfig'
import { useDonationFormStore } from '~/features/donation-form/donor/stores/donationForm'
import { useImpactCartStore } from '~/features/donation-form/features/impact-cart/donor/stores/impactCart'
import { useForms } from '~/features/campaigns/shared/composables/useForms'
import { AlertCircle } from 'lucide-vue-next'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

definePageMeta({
  layout: 'donor'
})

const route = useRoute()
const orgSlug = computed(() => route.params.org_slug as string)
const campaignSlug = computed(() => route.params.campaign_slug as string)
const formSlug = computed(() => route.params.form_slug as string)

const formConfigStore = useFormConfigStore()
const donationStore = useDonationFormStore()
const cartStore = useImpactCartStore()
const { getForm } = useForms(campaignSlug.value)

const form = computed(() => getForm(formSlug.value))

// Initialize form config on mount
onMounted(() => {
  if (form.value) {
    formConfigStore.initialize(form.value.config, form.value.products, form.value.id)
    donationStore.initialize(form.value.id, form.value.config.donationAmounts.baseDefaultCurrency)
    cartStore.initialize(form.value.id)
  }
})

// Watch for form availability (in case it loads async)
watch(
  () => form.value,
  (newForm) => {
    if (newForm && !formConfigStore.fullConfig) {
      formConfigStore.initialize(newForm.config, newForm.products, newForm.id)
      donationStore.initialize(newForm.id, newForm.config.donationAmounts.baseDefaultCurrency)
      cartStore.initialize(newForm.id)
    }
  }
)
</script>

<template>
  <div class="py-6 px-4 flex justify-center">
    <div class="w-full max-w-2xl">
      <DonationFlowWizard v-if="formConfigStore.fullConfig" :config="formConfigStore.fullConfig" />

      <div v-else class="max-w-md mx-auto">
        <Card>
          <CardContent class="py-10 text-center space-y-4">
            <AlertCircle class="w-12 h-12 text-muted-foreground mx-auto" />
            <h2 class="text-lg font-semibold">Form Not Found</h2>
            <p class="text-sm text-muted-foreground">
              This donation form doesn't exist or is no longer available.
            </p>
            <NuxtLink :to="`/${orgSlug}/${campaignSlug}`">
              <Button>Back to Campaign</Button>
            </NuxtLink>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>
