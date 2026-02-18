<script setup lang="ts">
import { ref, toRef } from 'vue'
import { Pencil } from 'lucide-vue-next'
import { usePreviewEditable } from '~/features/_admin/composables/usePreviewEditable'
import '~/features/_admin/composables/preview-editable.css'

const props = withDefaults(defineProps<{ enabled?: boolean }>(), { enabled: false })

const containerRef = ref<HTMLElement | null>(null)
const enabledRef = toRef(() => props.enabled)
const { hoveredField, editButtonStyle, hoverOutlineStyle, navigateToField } = usePreviewEditable(
  containerRef,
  enabledRef
)
</script>

<template>
  <div ref="containerRef" :class="['relative', { editable: enabled }]">
    <slot />

    <Transition name="fade">
      <div
        v-if="enabled && hoveredField"
        class="border-2 border-dashed border-(--platform-primary)/50 rounded pointer-events-none"
        :style="hoverOutlineStyle"
      />
    </Transition>

    <Transition name="fade">
      <button
        v-if="enabled && hoveredField"
        class="absolute z-50 flex items-center justify-center h-6 w-6 rounded-full shadow-md pointer-events-auto cursor-pointer bg-[var(--platform-secondary)] text-[var(--platform-secondary-foreground)] hover:opacity-90"
        :style="editButtonStyle"
        @click.stop="navigateToField()"
      >
        <Pencil class="h-3 w-3" />
      </button>
    </Transition>
  </div>
</template>
