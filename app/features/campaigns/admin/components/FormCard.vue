<script setup lang="ts">
import { useCampaignConfigStore } from '~/features/campaigns/shared/stores/campaignConfig'
import { getCampaignCapabilities } from '~/features/campaigns/shared/utils/campaignCapabilities'
import { useCampaignFormatters } from '~/features/campaigns/shared/composables/useCampaignFormatters'
import { useForm } from '~/features/campaigns/shared/composables/useForm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import AdminDeleteDialog from '~/features/_admin/components/AdminDeleteDialog.vue'
import CopyFormFromCampaignDialog from './CopyFormFromCampaignDialog.vue'
import { ICON_EDIT, ICON_VIEW, ICON_COPY } from '~/lib/icons'
import type { CampaignForm } from '~/features/campaigns/shared/types'

defineProps<{
  disabled?: boolean
}>()

const store = useCampaignConfigStore()
const { formatDate } = useCampaignFormatters()
const { setForm } = useForm()
const form = computed(() => store.form)
const caps = computed(() => getCampaignCapabilities(store.type))

// Count enabled features
const enabledFeaturesCount = computed(() => {
  if (!form.value) return 0
  const features = form.value.config.features
  return Object.values(features).filter((f: unknown) => {
    const feat = f as { enabled?: boolean }
    return feat?.enabled === true
  }).length
})

// Count products
const productCount = computed(() => form.value?.products.length ?? 0)

// Copy from campaign flow
const showCopyDialog = ref(false)
const showCopyConfirm = ref(false)
const pendingCopyForm = ref<CampaignForm | null>(null)

const handleCopySelect = (selectedForm: CampaignForm, _sourceCampaignId: string) => {
  if (form.value) {
    // Existing form — show confirmation warning
    pendingCopyForm.value = selectedForm
    showCopyConfirm.value = true
  } else {
    // No existing form — apply directly
    setForm(selectedForm)
  }
}

const handleCopyConfirm = () => {
  if (pendingCopyForm.value) {
    setForm(pendingCopyForm.value)
    pendingCopyForm.value = null
  }
  showCopyConfirm.value = false
}
</script>

<template>
  <div v-if="form" class="space-y-3">
    <Card>
      <CardHeader class="pb-3">
        <div class="flex items-center justify-between">
          <div class="space-y-1">
            <CardTitle class="text-base">{{ form.name }}</CardTitle>
            <CardDescription class="text-xs">
              Updated {{ formatDate(form.updatedAt) }}
            </CardDescription>
          </div>
          <Badge variant="outline" class="text-xs">
            {{ caps.formType === 'registration' ? 'Registration' : 'Donation' }}
          </Badge>
        </div>
      </CardHeader>
      <CardContent class="space-y-3">
        <!-- Config summary -->
        <div class="flex gap-4 text-sm text-muted-foreground">
          <span>{{ enabledFeaturesCount }} features enabled</span>
          <span>{{ productCount }} product{{ productCount !== 1 ? 's' : '' }}</span>
        </div>

        <Separator />

        <!-- Actions -->
        <div class="flex gap-2 flex-wrap">
          <Button
            v-if="!store.isFundraiser"
            variant="outline"
            size="sm"
            as-child
            :disabled="disabled"
          >
            <NuxtLink :to="`/admin/campaigns/${store.id}/forms/${form.id}/edit`">
              <ICON_EDIT class="w-4 h-4 mr-1" />
              Edit Form
            </NuxtLink>
          </Button>
          <Button variant="outline" size="sm" as-child>
            <NuxtLink :to="`/admin/campaigns/${store.id}/forms/${form.id}/preview`" target="_blank">
              <ICON_VIEW class="w-4 h-4 mr-1" />
              Preview
            </NuxtLink>
          </Button>
          <Button
            v-if="!store.isFundraiser"
            variant="outline"
            size="sm"
            :disabled="disabled"
            @click="showCopyDialog = true"
          >
            <ICON_COPY class="w-4 h-4 mr-1" />
            Copy from
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>

  <!-- No form state -->
  <div v-else class="space-y-3">
    <div class="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
      <p>No form configured yet.</p>
      <p class="mt-1">Create this campaign to add a form from a template.</p>
    </div>
    <Button v-if="!store.isFundraiser" variant="outline" size="sm" @click="showCopyDialog = true">
      <ICON_COPY class="w-4 h-4 mr-1" />
      Copy from another campaign
    </Button>
  </div>

  <!-- Fundraiser notice -->
  <p v-if="store.isFundraiser && form" class="text-xs text-muted-foreground mt-2">
    Fundraiser campaigns use a copy of the parent template's form. Configuration is read-only.
  </p>

  <!-- Copy from campaign dialog -->
  <CopyFormFromCampaignDialog
    :open="showCopyDialog"
    :current-campaign-id="store.id ?? ''"
    @update:open="showCopyDialog = $event"
    @select="handleCopySelect"
  />

  <!-- Confirmation dialog for replacing existing form -->
  <AdminDeleteDialog
    :open="showCopyConfirm"
    title="Replace current form?"
    description="This will replace the current form configuration and products with the selected campaign's form. This action cannot be undone."
    confirm-label="Replace Form"
    @update:open="showCopyConfirm = $event"
    @confirm="handleCopyConfirm"
  />
</template>
