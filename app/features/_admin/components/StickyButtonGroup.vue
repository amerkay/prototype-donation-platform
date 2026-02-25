<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { ICON_SAVE, ICON_LOADING, ICON_DISCARD, ICON_WARNING } from '~/lib/icons'
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

const isActive = computed(() => props.isDirty || !props.isValid)
const hasErrors = computed(() => !props.isValid)
</script>

<template>
  <div
    :class="
      cn(
        'py-4 -mx-4 px-4',
        isActive &&
          'sticky bottom-0 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 border-t'
      )
    "
  >
    <div class="space-y-2">
      <slot name="notice" />

      <div v-if="hasErrors" class="flex items-center gap-1 text-xs text-destructive">
        <ICON_WARNING class="w-3 h-3" />
        <span>Please fix errors before saving</span>
      </div>

      <div class="flex gap-2">
        <Button
          :disabled="!props.isDirty || !props.isValid || props.isSaving"
          size="lg"
          class="flex-1"
          @click="emit('save')"
        >
          <ICON_LOADING v-if="props.isSaving" class="w-4 h-4 mr-2 animate-spin" />
          <ICON_SAVE v-else class="w-4 h-4 mr-2" />
          {{ props.isSaving ? 'Saving...' : 'Save Changes' }}
        </Button>
        <Button
          v-if="isActive"
          variant="outline"
          size="lg"
          :disabled="props.isSaving"
          @click="emit('discard')"
        >
          <ICON_DISCARD class="w-4 h-4 mr-2" />
          Discard
        </Button>
      </div>
    </div>
  </div>
</template>
