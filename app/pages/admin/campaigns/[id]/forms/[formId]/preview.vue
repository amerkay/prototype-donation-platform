<script setup lang="ts">
import PreviewLayout from '~/features/_admin/components/PreviewLayout.vue'
import DonationFormPreview from '~/features/donation-form/admin/components/DonationFormPreview.vue'
import { useCampaigns } from '~/features/campaigns/shared/composables/useCampaigns'
import { useForms } from '~/features/campaigns/shared/composables/useForms'
import { useFormConfigStore } from '~/features/donation-form/shared/stores/formConfig'

definePageMeta({
  layout: false
})

const route = useRoute()
const { getCampaignById } = useCampaigns()
const { getForm } = useForms(route.params.id as string)

const campaignId = route.params.id as string
const formId = route.params.formId as string

const campaign = computed(() => getCampaignById(campaignId))
const form = computed(() => getForm(formId))

// Redirect if not found
if (!campaign.value || !form.value) {
  navigateTo('/admin/campaigns')
}

// Initialize store with form config
const store = useFormConfigStore()
if (form.value) {
  store.initialize(form.value.config, form.value.products)
}

// Watch for form changes
watch(
  () => form.value,
  (newForm) => {
    if (newForm) {
      store.initialize(newForm.config, newForm.products)
    }
  }
)

const backUrl = computed(() => `/admin/campaigns/${campaignId}/forms/${formId}/edit`)
</script>

<template>
  <PreviewLayout :back-url="backUrl" back-label="Back">
    <DonationFormPreview />
  </PreviewLayout>
</template>
