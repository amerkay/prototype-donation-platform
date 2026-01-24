<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Save, Loader2, RotateCcw } from 'lucide-vue-next'

const props = defineProps<{
  isDirty: boolean
  isSaving: boolean
  saveMessage: { type: 'success' | 'error'; text: string } | null
}>()

const emit = defineEmits<{
  save: []
  discard: []
}>()
</script>

<template>
  <div
    class="sticky bottom-0 py-4 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 border-t -mx-4 px-4"
  >
    <div class="flex gap-2">
      <Button
        :disabled="!props.isDirty || props.isSaving"
        size="lg"
        class="flex-1"
        @click="emit('save')"
      >
        <Loader2 v-if="props.isSaving" class="w-4 h-4 mr-2 animate-spin" />
        <Save v-else class="w-4 h-4 mr-2" />
        {{ props.isSaving ? 'Saving...' : 'Save Changes' }}
      </Button>
      <Button
        v-if="props.isDirty"
        variant="outline"
        size="lg"
        :disabled="props.isSaving"
        @click="emit('discard')"
      >
        <RotateCcw class="w-4 h-4 mr-2" />
        Discard
      </Button>
    </div>

    <!-- Save Message -->
    <div
      v-if="props.saveMessage"
      class="mt-3 p-3 rounded-md text-sm"
      :class="{
        'bg-green-50 text-green-800 border border-green-200 dark:bg-green-950 dark:text-green-200 dark:border-green-800':
          props.saveMessage.type === 'success',
        'bg-red-50 text-red-800 border border-red-200 dark:bg-red-950 dark:text-red-200 dark:border-red-800':
          props.saveMessage.type === 'error'
      }"
    >
      {{ props.saveMessage.text }}
    </div>
  </div>
</template>
