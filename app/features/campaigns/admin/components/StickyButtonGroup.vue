<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Save, Loader2, RotateCcw } from 'lucide-vue-next'

const props = defineProps<{
  isDirty: boolean
  isSaving: boolean
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
  </div>
</template>
