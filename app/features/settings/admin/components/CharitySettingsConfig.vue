<script setup lang="ts">
import FormRenderer from '~/features/_library/form-builder/FormRenderer.vue'
import StickyButtonGroup from '~/features/_admin/components/StickyButtonGroup.vue'
import DevJsonPreview from '~/features/_admin/components/DevJsonPreview.vue'
import {
  useCharitySettingsForm,
  charityOpenAccordionId
} from '~/features/settings/admin/forms/charity-settings-form'
import { useCharitySettingsStore } from '~/features/settings/admin/stores/charitySettings'
import { useAdminConfigForm } from '~/features/_admin/composables/useAdminConfigForm'
import { provideAccordionGroup } from '~/features/_library/form-builder/composables/useAccordionGroup'
import { Button } from '@/components/ui/button'
import { Eye } from 'lucide-vue-next'

const store = useCharitySettingsStore()
provideAccordionGroup(charityOpenAccordionId)

const { formRef, modelValue, form, expose } = useAdminConfigForm({
  store,
  form: useCharitySettingsForm
})

defineEmits<{
  save: []
  discard: []
  preview: []
}>()
defineExpose(expose)
</script>

<template>
  <div class="w-full mx-auto space-y-6">
    <FormRenderer ref="formRef" v-model="modelValue" :section="form" validate-on-mount />

    <Button variant="outline" size="sm" class="lg:hidden" @click="$emit('preview')">
      <Eye class="w-4 h-4 mr-2" />
      Preview
    </Button>

    <StickyButtonGroup
      :is-dirty="store.isDirty"
      :is-saving="store.isSaving"
      :is-valid="formRef?.isValid ?? false"
      @save="$emit('save')"
      @discard="$emit('discard')"
    />

    <DevJsonPreview :data="store.$state" />
  </div>
</template>
