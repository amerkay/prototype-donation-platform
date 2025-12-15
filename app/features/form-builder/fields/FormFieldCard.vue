<script setup lang="ts">
import type { CardFieldMeta } from '~/features/form-builder/form-builder-types'

interface Props {
  meta: CardFieldMeta
}

defineProps<Props>()
</script>

<template>
  <div class="rounded-lg border bg-card text-card-foreground p-6">
    <h3 v-if="meta.label" class="text-lg font-semibold mb-2">
      {{ meta.label }}
    </h3>
    <p v-if="meta.description" class="text-sm text-muted-foreground">
      {{ meta.description }}
    </p>
  </div>
</template>
