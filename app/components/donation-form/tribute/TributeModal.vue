<script setup lang="ts">
import { ref, computed } from 'vue'
import { Button } from '@/components/ui/button'
import BaseDialogOrDrawer from '~/components/donation-form/common/BaseDialogOrDrawer.vue'
import ProductTributeFormGenerated from '~/components/donation-form/tribute/ProductTributeFormGenerated.vue'
import type { TributeData, FormConfig } from '@/lib/common/types'

interface Props {
  config: FormConfig['features']['tribute']
}

defineProps<Props>()

const emit = defineEmits<{
  save: [tributeData: TributeData | undefined]
}>()

const isOpen = ref(false)
const tributeFormRef = ref<InstanceType<typeof ProductTributeFormGenerated> | null>(null)
const tempTributeData = ref<TributeData | undefined>(undefined)

const isTributeFormValid = computed(() => {
  if (!tributeFormRef.value?.formRenderer) return true
  return tributeFormRef.value.formRenderer.isValid ?? false
})

const handleSave = () => {
  emit('save', tempTributeData.value)
  isOpen.value = false
}

const handleCancel = () => {
  tempTributeData.value = undefined
  isOpen.value = false
}

defineExpose({
  open: (currentTributeData?: TributeData) => {
    tempTributeData.value = currentTributeData
      ? JSON.parse(JSON.stringify(currentTributeData))
      : undefined
    isOpen.value = true
  }
})
</script>

<template>
  <BaseDialogOrDrawer v-model:open="isOpen" :dismissible="true">
    <template #header>
      <h2 class="text-2xl font-semibold">{{ config.modal.title }}</h2>
      <p class="text-sm text-muted-foreground">
        {{ config.modal.subtitle }}
      </p>
    </template>
    <template #content>
      <ProductTributeFormGenerated
        ref="tributeFormRef"
        v-model="tempTributeData"
        :config="config"
        @submit="handleSave"
      />
    </template>
    <template #footer>
      <Button class="flex-1 md:flex-1 h-12" :disabled="!isTributeFormValid" @click="handleSave">
        {{ config.modal.saveButton }}
      </Button>
      <Button variant="outline" class="flex-1 md:flex-1 h-12" @click="handleCancel">
        {{ config.modal.cancelButton }}
      </Button>
    </template>
  </BaseDialogOrDrawer>
</template>
