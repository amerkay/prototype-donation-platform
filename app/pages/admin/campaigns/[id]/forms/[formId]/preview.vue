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

// TODO: Remove when switching to Supabase API
// Track if client-side hydration completed (sessionStorage is client-only)
const isHydrated = ref(false)

// Initialize store with form config
const store = useFormConfigStore()

// TODO: Remove when switching to Supabase API
// Check for campaign/form existence after client-side hydration from sessionStorage
onMounted(() => {
  isHydrated.value = true
  if (!campaign.value || !form.value) {
    navigateTo('/admin/campaigns')
    return
  }
  // Initialize store with form config
  store.initialize(form.value.config, form.value.products)
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
  <!-- TODO: Remove loading state when switching to Supabase API -->
  <div v-if="!isHydrated" class="flex items-center justify-center min-h-screen">
    <div class="text-muted-foreground">Loading...</div>
  </div>
  <DonationFormPreview v-else-if="campaign && form" />
  <div v-else class="text-center py-12">
    <p class="text-muted-foreground">Form not found</p>
  </div>
</template>
