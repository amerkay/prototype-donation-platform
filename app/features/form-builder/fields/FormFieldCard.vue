<script setup lang="ts">
import { computed, inject, type ComputedRef } from 'vue'
import { cn } from '@/lib/utils'
import type { CardFieldMeta } from '~/features/form-builder/form-builder-types'

interface Props {
  meta: CardFieldMeta
}

const props = defineProps<Props>()

// Inject form values for dynamic descriptions (as ComputedRef for reactivity)
const formValues = inject<ComputedRef<Record<string, unknown>>>(
  'formValues',
  computed(() => ({}))
)

// Resolve description (static string or dynamic function)
const resolvedDescription = computed(() => {
  if (!props.meta.description) return undefined
  if (typeof props.meta.description === 'function') {
    return props.meta.description(formValues.value)
  }
  return props.meta.description
})
</script>

<template>
  <div class="rounded-lg border text-card-foreground p-6 bg-background/30">
    <!-- Optional image -->
    <img
      v-if="meta.imageSrc"
      :src="meta.imageSrc"
      :alt="meta.imageAlt || ''"
      :class="meta.imageClass || 'w-32 h-auto mb-4'"
    />

    <!-- Slot for custom content (highest priority) -->
    <slot>
      <!-- Default content rendering -->
      <h3 v-if="meta.label" class="text-lg font-semibold mb-2">
        {{ meta.label }}
      </h3>

      <!-- Rich HTML content (if provided) -->
      <!-- eslint-disable-next-line vue/no-v-html -->
      <div v-if="meta.content" class="text-sm text-muted-foreground" v-html="meta.content" />

      <!-- Plain text description (fallback) -->
      <p
        v-else-if="resolvedDescription"
        :class="cn('text-sm text-muted-foreground whitespace-pre-line', meta.descriptionClass)"
      >
        {{ resolvedDescription }}
      </p>
    </slot>
  </div>
</template>
