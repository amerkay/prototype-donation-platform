<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/lib/utils'
import type { CardFieldDef } from '~/features/_library/form-builder/types'
import { sanitizeRichText } from '~/features/_library/form-builder/utils/sanitize-html'
import { useResolvedFieldMeta } from '~/features/_library/form-builder/composables/useResolvedFieldMeta'
import { useContainerFieldSetup } from '~/features/_library/form-builder/composables/useContainerFieldSetup'

interface Props {
  meta: CardFieldDef
  name: string
}

const props = defineProps<Props>()

// Use unified container setup composable
const { isVisible } = useContainerFieldSetup(props.name, props.meta.visibleWhen)

// Resolve description and class using composable
const { resolvedDescription, resolvedClass } = useResolvedFieldMeta(props.meta)

// Sanitize rich HTML content for safe v-html rendering
const sanitizedContent = computed(() =>
  props.meta.content ? sanitizeRichText(props.meta.content) : ''
)

// Resolve card styling based on meta props
const cardClasses = computed(() => {
  const showBorder = props.meta.showBorder !== false

  return cn(
    showBorder && 'border rounded-lg text-card-foreground p-6 bg-background',
    resolvedClass.value
  )
})
</script>

<template>
  <div v-show="isVisible" :class="cardClasses">
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
      <!-- eslint-disable-next-line vue/no-v-html -- sanitized -->
      <div v-if="meta.content" class="text-sm text-muted-foreground" v-html="sanitizedContent" />

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
