<script setup lang="ts">
import DonationFormPreview from '~/features/donation-form/admin/components/DonationFormPreview.vue'
import { useCampaigns } from '~/features/campaigns/shared/composables/useCampaigns'
import { useForms } from '~/features/campaigns/shared/composables/useForms'
import { useFormConfigStore } from '~/features/donation-form/shared/stores/formConfig'

definePageMeta({
  layout: 'admin-preview'
})

const route = useRoute()
const { getCampaignById } = useCampaigns()
const { getForm } = useForms(route.params.id as string)

const campaignId = route.params.id as string
const formId = route.params.formId as string

const campaign = computed(() => getCampaignById(campaignId))
const form = computed(() => getForm(formId))

// Initialize store synchronously so child components have store data during setup
const store = useFormConfigStore()
if (form.value) {
  store.initialize(form.value.config, form.value.products)
}

onMounted(() => {
  if (!campaign.value || !form.value) {
    navigateTo('/admin/campaigns')
  }
})

// Watch for form changes
watch(
  () => form.value,
  (newForm) => {
    if (newForm) {
      store.initialize(newForm.config, newForm.products)
    }
  }
)
</script>

<template>
  <DonationFormPreview v-if="campaign && form" />
  <div v-else class="text-center py-12">
    <p class="text-muted-foreground">Form not found</p>
  </div>
</template>
