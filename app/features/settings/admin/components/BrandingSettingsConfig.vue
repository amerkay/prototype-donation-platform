<script setup lang="ts">
import FormRenderer from '~/features/_library/form-builder/FormRenderer.vue'
import StickyButtonGroup from '~/features/_admin/components/StickyButtonGroup.vue'
import { useBrandingSettingsForm } from '~/features/settings/admin/forms/branding-settings-form'
import { useBrandingSettingsStore } from '~/features/settings/admin/stores/brandingSettings'
import { useAdminConfigForm } from '~/features/_admin/composables/useAdminConfigForm'
import { useBrandingCssVars } from '~/features/settings/admin/composables/useBrandingCssVars'
import { Button } from '@/components/ui/button'
import { Eye } from 'lucide-vue-next'

const store = useBrandingSettingsStore()

const { formRef, modelValue, form, expose } = useAdminConfigForm({
  store,
  form: useBrandingSettingsForm
})

// Font loading handled by composable (also used by donor layout + preview)
useBrandingCssVars()

defineEmits<{ save: []; discard: []; preview: [] }>()
defineExpose(expose)
</script>

<template>
  <div class="w-full mx-auto space-y-6">
    <FormRenderer
      ref="formRef"
      v-model="modelValue"
      :section="form"
      validate-on-mount
      update-only-when-valid
    />
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
  </div>
</template>
