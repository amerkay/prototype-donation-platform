<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Save, Loader2, RotateCcw, AlertCircle } from 'lucide-vue-next'
import { cn } from '@/lib/utils'

const props = withDefaults(
  defineProps<{
    isDirty: boolean
    isSaving: boolean
    isValid?: boolean
  }>(),
  {
    isValid: true
  }
)

const emit = defineEmits<{
  save: []
  discard: []
}>()

const hasErrors = computed(() => props.isDirty && !props.isValid)
</script>

<template>
  <div
    :class="
      cn(
        'py-4 -mx-4 px-4',
        props.isDirty &&
          'sticky bottom-0 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 border-t'
      )
    "
  >
    <div class="space-y-2">
      <slot name="notice" />

      <div v-if="hasErrors" class="flex items-center gap-1 text-xs text-destructive">
        <AlertCircle class="w-3 h-3" />
        <span>Please fix errors before saving</span>
      </div>

      <div class="flex gap-2">
        <Button
          :disabled="!props.isDirty || !props.isValid || props.isSaving"
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
  </div>
</template>
