<script setup lang="ts">
import { computed } from 'vue'
import { Button } from '@/components/ui/button'
import TributeLine from '../tribute/TributeLine.vue'
import type { TributeData } from '@/lib/common/types'

interface Props {
  tribute: TributeData
}

const props = defineProps<Props>()

const emit = defineEmits<{
  edit: []
  remove: []
}>()

const tributeIcon = computed(() => {
  if (props.tribute.type === 'gift') return '🎁'
  if (props.tribute.type === 'memorial') return '🕊️'
  return '💝'
})

const tributeTitle = computed(() => {
  if (props.tribute.type === 'gift') return 'Gift'
  if (props.tribute.type === 'memorial') return 'In Memory'
  return 'Tribute'
})
</script>

<template>
  <div
    class="rounded-lg border bg-card p-3 transition-all cursor-pointer hover:bg-accent"
    @click="emit('edit')"
  >
    <div class="flex items-center gap-3">
      <div class="text-2xl">{{ tributeIcon }}</div>
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2">
          <p class="font-medium text-sm">{{ tributeTitle }}</p>
          <button class="text-xs text-primary hover:underline pointer-events-none" @click.stop>
            Edit
          </button>
        </div>
        <TributeLine :tribute="tribute" class="mt-1" />
      </div>
      <Button variant="ghost" size="sm" @click.stop="emit('remove')"> ✕ </Button>
    </div>
  </div>
</template>
