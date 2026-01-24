<script setup lang="ts">
import { ref, computed } from 'vue'
import { Button } from '@/components/ui/button'
import BaseDialogOrDrawer from '~/features/donation-form/donor/components/BaseDialogOrDrawer.vue'
import FormRenderer from '@/features/_library/form-builder/FormRenderer.vue'
import { createTributeFormSection } from '~/features/donation-form/features/tribute/donor/forms/tribute-form'
import type { TributeSettings } from '~/features/donation-form/features/tribute/admin/types'
import type { TributeData } from '~/features/donation-form/features/tribute/donor/types'

interface Props {
  config: TributeSettings
}

const props = defineProps<Props>()

const emit = defineEmits<{
  save: [tributeData: TributeData | undefined]
}>()

const isOpen = ref(false)
const tributeFormRef = ref<InstanceType<typeof FormRenderer> | null>(null)
const tempTributeData = ref<TributeData>({ type: 'none' })

// Create form section from config
const formSection = computed(() => createTributeFormSection(props.config))

const isTributeFormValid = computed(() => {
  if (!tributeFormRef.value) return true
  return tributeFormRef.value.isValid ?? false
})

const handleSave = () => {
  // If already valid, proceed
  if (isTributeFormValid.value) {
    emit('save', tempTributeData.value)
    isOpen.value = false
    return
  }

  // Trigger validation to show errors
  if (tributeFormRef.value) {
    tributeFormRef.value.onSubmit()
  }
}

const handleCancel = () => {
  tempTributeData.value = { type: 'none' }
  isOpen.value = false
}

defineExpose({
  open: (currentTributeData?: TributeData) => {
    tempTributeData.value = currentTributeData
      ? JSON.parse(JSON.stringify(currentTributeData))
      : { type: 'none' }
    isOpen.value = true
  }
})
</script>

<template>
  <BaseDialogOrDrawer
    v-model:open="isOpen"
    :dismissible="true"
    :description="
      config.modal?.subtitle ?? 'Make this donation in honor or memory of someone special'
    "
  >
    <template #header>
      <h2 class="text-2xl font-semibold">{{ config.modal?.title ?? 'Gift or In Memory' }}</h2>
    </template>
    <template #content>
      <FormRenderer
        ref="tributeFormRef"
        v-model="tempTributeData"
        :validate-on-mount="false"
        :section="formSection"
        @submit="handleSave"
      />
    </template>
    <template #footer>
      <Button
        :class="[
          'flex-1 md:flex-1 h-12',
          !isTributeFormValid && 'opacity-50 cursor-not-allowed pointer-events-auto'
        ]"
        @click="handleSave"
      >
        Save
      </Button>
      <Button variant="outline" class="flex-1 md:flex-1 h-12" @click="handleCancel">
        Cancel
      </Button>
    </template>
  </BaseDialogOrDrawer>
</template>
