<script setup lang="ts">
import { useSlots } from 'vue'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CircleHelp } from 'lucide-vue-next'

withDefaults(
  defineProps<{
    side?: 'top' | 'bottom' | 'left' | 'right'
    iconClass?: string
  }>(),
  { side: 'bottom', iconClass: 'size-3.5' }
)

const slots = useSlots()
const hasTrigger = computed(() => !!slots.trigger)
</script>

<template>
  <Popover>
    <!-- Custom trigger: wraps the provided element + icon together -->
    <PopoverTrigger v-if="hasTrigger" as-child>
      <button
        type="button"
        class="pointer-events-auto relative z-10 inline-flex items-center gap-1 cursor-help text-muted-foreground hover:text-foreground"
      >
        <slot name="trigger" />
        <CircleHelp :class="iconClass" />
      </button>
    </PopoverTrigger>

    <!-- Default trigger: just the icon -->
    <PopoverTrigger v-else as-child>
      <button
        type="button"
        class="pointer-events-auto relative z-10 inline-flex text-muted-foreground hover:text-foreground"
      >
        <CircleHelp :class="iconClass" />
      </button>
    </PopoverTrigger>

    <PopoverContent :side="side" align="start" :collision-padding="8" class="text-xs w-64">
      <slot />
    </PopoverContent>
  </Popover>
</template>
