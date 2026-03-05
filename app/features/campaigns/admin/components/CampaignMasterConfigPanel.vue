<script setup lang="ts">
import { useCampaignConfigStore } from '~/features/campaigns/shared/stores/campaignConfig'
import { useFormConfigStore } from '~/features/donation-form/shared/stores/formConfig'
import FormRenderer from '@/features/_library/form-builder/FormRenderer.vue'
import StickyButtonGroup from '~/features/_admin/components/StickyButtonGroup.vue'
import { createCampaignConfigMaster } from '../forms/campaign-config-master'
import { createFundraiserConfigMaster } from '../forms/fundraiser-config-master'
import { useAdminConfigForm } from '~/features/_admin/composables/useAdminConfigForm'

const store = useCampaignConfigStore()
const formConfigStore = useFormConfigStore()

// Form count for component field validation (1:1 campaign:form)
const formsCount = computed(() => (store.form ? 1 : 0))

// Fundraisers: unified single-form with manual two-store binding
// Non-fundraisers: auto-mapped campaign config form
const { formRef, modelValue, form, expose } = store.isFundraiser
  ? useAdminConfigForm({
      store,
      form: createFundraiserConfigMaster(),
      autoMap: false,
      getData: () => ({
        sections: {
          crowdfunding: store.crowdfunding,
          amounts: formConfigStore.donationAmounts
        }
      }),
      setData: (_s, data: Record<string, unknown>) => {
        const sections = data.sections as Record<string, unknown>
        if (sections.crowdfunding !== undefined) {
          const changed =
            JSON.stringify(store.crowdfunding) !== JSON.stringify(sections.crowdfunding)
          Object.assign(store.crowdfunding!, sections.crowdfunding as object)
          if (changed) store.markDirty()
        }
        if (sections.amounts !== undefined) {
          const changed =
            JSON.stringify(formConfigStore.donationAmounts) !== JSON.stringify(sections.amounts)
          Object.assign(formConfigStore.donationAmounts!, sections.amounts as object)
          if (changed) formConfigStore.markDirty()
        }
      }
    })
  : useAdminConfigForm({
      store,
      form: createCampaignConfigMaster()
    })

// Combined dirty state for StickyButtonGroup
const isDirty = computed(() => store.isDirty || (store.isFundraiser && formConfigStore.isDirty))
const isSaving = computed(() => store.isSaving || (store.isFundraiser && formConfigStore.isSaving))
const isValid = computed(() => formRef.value?.isValid ?? false)

// Manually inject formsCount for component field validation (non-fundraiser only)
// Component fields are excluded from auto-mapping but need validation data
// With tabs, donationForms is nested under config.sections
if (!store.isFundraiser) {
  watch(
    formsCount,
    (count) => {
      const config = modelValue.value.config as Record<string, unknown> | undefined
      const sections = config?.sections as Record<string, unknown> | undefined
      if (sections) {
        if (!sections.donationForms) {
          sections.donationForms = {}
        }
        ;(sections.donationForms as Record<string, unknown>).formCard = {
          formsCount: count
        }
      }
      // Push into vee-validate's internal state so validation re-runs.
      formRef.value?.setFieldValue('config.sections.donationForms.formCard', { formsCount: count })
    },
    { immediate: true }
  )
}

defineEmits<{
  save: []
  discard: []
}>()
defineExpose(expose)
</script>

<template>
  <div class="space-y-4">
    <FormRenderer
      ref="formRef"
      v-model="modelValue"
      :section="form"
      validate-on-mount
      update-only-when-valid
    />

    <!-- Save Button -->
    <StickyButtonGroup
      :is-dirty="isDirty"
      :is-saving="isSaving"
      :is-valid="isValid"
      @save="$emit('save')"
      @discard="$emit('discard')"
    />
  </div>
</template>
