<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/lib/utils'
import type { CardFieldMeta } from '~/features/form-builder/types'
import { resolveText } from '~/features/form-builder/composables/useResolvedFieldMeta'
import { useContainerFieldSetup } from '~/features/form-builder/composables/useContainerFieldSetup'

interface Props {
  meta: CardFieldMeta
  name: string
}

const props = defineProps<Props>()

// Use unified container setup composable
const { isVisible, scopedFormValues } = useContainerFieldSetup(props.name, props.meta.visibleWhen)

// Resolve description using utility
const resolvedDescription = computed(() =>
  resolveText(props.meta.description, scopedFormValues.value)
)
</script>

<template>
  <div v-show="isVisible" class="rounded-lg border text-card-foreground p-6 bg-background/30">
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
