<script setup lang="ts">
import FormRenderer from '~/features/_library/form-builder/FormRenderer.vue'
import StickyButtonGroup from '~/features/_admin/components/StickyButtonGroup.vue'
import { useBrandingSettingsForm } from '~/features/settings/admin/forms/branding-settings-form'
import { useBrandingSettingsStore } from '~/features/settings/admin/stores/brandingSettings'
import { useAdminConfigForm } from '~/features/_admin/composables/useAdminConfigForm'

const store = useBrandingSettingsStore()

const { formRef, modelValue, form, expose } = useAdminConfigForm({
  store,
  form: useBrandingSettingsForm
})

defineEmits<{ save: []; discard: [] }>()
defineExpose(expose)
</script>

<template>
  <div class="w-full mx-auto space-y-6">
    <!-- Color Preview -->
    <div class="flex items-center gap-3 p-4 bg-muted/50 rounded-xl border">
      <span class="text-sm text-muted-foreground">Preview:</span>
      <div
        class="w-8 h-8 rounded-full border"
        :style="{ backgroundColor: store.primaryColor }"
        title="Primary"
      />
      <div
        class="w-8 h-8 rounded-full border"
        :style="{ backgroundColor: store.secondaryColor }"
        title="Secondary"
      />
      <div
        class="w-8 h-8 rounded-full border"
        :style="{ backgroundColor: store.accentColor }"
        title="Accent"
      />
      <span class="text-sm ml-2" :style="{ fontFamily: store.fontFamily }">
        {{ store.fontFamily }}
      </span>
    </div>

    <FormRenderer
      ref="formRef"
      v-model="modelValue"
      :section="form"
      validate-on-mount
      update-only-when-valid
    />
    <StickyButtonGroup
      :is-dirty="store.isDirty"
      :is-saving="store.isSaving"
      :is-valid="formRef?.isValid ?? false"
      @save="$emit('save')"
      @discard="$emit('discard')"
    />
  </div>
</template>
