<script setup lang="ts">
import { computed, inject } from 'vue'
import type { CardFieldMeta } from '~/features/form-builder/form-builder-types'

interface Props {
  meta: CardFieldMeta
}

const props = defineProps<Props>()

// Inject form values for dynamic descriptions
const formValues = inject<() => Record<string, unknown>>('formValues', () => ({}))

// Resolve description (static string or dynamic function)
const resolvedDescription = computed(() => {
  if (!props.meta.description) return undefined
  if (typeof props.meta.description === 'function') {
    return props.meta.description(formValues())
  }
  return props.meta.description
})
</script>

<template>
  <div class="rounded-lg border bg-card text-card-foreground p-6">
    <h3 v-if="meta.label" class="text-lg font-semibold mb-2">
      {{ meta.label }}
    </h3>
    <p v-if="resolvedDescription" class="text-sm text-muted-foreground whitespace-pre-line">
      {{ resolvedDescription }}
    </p>
  </div>
</template>
