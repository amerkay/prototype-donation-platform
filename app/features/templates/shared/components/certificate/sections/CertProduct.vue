<script setup lang="ts">
import { cn } from '@/lib/utils'

const BORDER_RADIUS = {
  circle: '9999px',
  rounded: '1.25rem',
  square: '0'
} as const

const props = defineProps<{
  name: string
  image: string
  imageShape: 'circle' | 'rounded' | 'square'
  borderColor: string
  borderWidth: number
  adaptive?: boolean
  dataField?: string
  /** Fine-grained sub-targets (when set, override dataField on individual elements) */
  dataFieldImage?: string
  dataFieldName?: string
  dataFieldText?: string
  /** Text shown next to product image on certificates */
  text?: string
  /** Force single column layout even when both image and text exist */
  forceOneColumn?: boolean
}>()

// When sub-targets exist, apply per-element; otherwise whole container gets dataField
const hasSubTargets = computed(
  () => !!(props.dataFieldImage || props.dataFieldName || props.dataFieldText)
)
const containerField = computed(() => (hasSubTargets.value ? undefined : props.dataField))

const borderRadius = computed(() => BORDER_RADIUS[props.imageShape] ?? BORDER_RADIUS.circle)
const hasImage = computed(() => !!props.image)
const hasText = computed(() => !!props.text)
const isTwoColumn = computed(() => !props.forceOneColumn && hasImage.value && hasText.value)

const imageStyle = computed(() => ({
  aspectRatio: '1',
  objectFit: 'cover' as const,
  borderRadius: borderRadius.value,
  border: `${props.borderWidth}px solid ${props.borderColor}`
}))

const containerClass = computed(() =>
  cn('flex flex-col items-center flex-1 min-h-0', props.adaptive && 'max-h-full')
)
</script>

<template>
  <!-- Two-column: image left + name/text right -->
  <div
    v-if="isTwoColumn"
    :data-field="containerField"
    :class="cn(containerClass, 'gap-3 max-w-2xl mx-auto w-full')"
  >
    <div class="grid grid-cols-2 gap-4 w-full flex-1 min-h-0 items-center py-2">
      <div
        class="flex items-center justify-center h-full max-h-[95%] min-h-0"
        :data-field="dataFieldImage"
      >
        <img :src="image" :alt="name" class="h-full w-auto max-w-full" :style="imageStyle" />
      </div>
      <div>
        <p
          :data-field="dataFieldName"
          class="template-adaptive text-left font-bold leading-tight text-gray-900 text-2xl mb-2"
          data-max-lines="1"
          data-min-font="12"
        >
          {{ name }}
        </p>
        <p
          :data-field="dataFieldText"
          class="template-adaptive text-gray-700 text-sm leading-relaxed text-left"
          data-max-lines="5"
          data-min-font="10"
        >
          {{ text }}
        </p>
      </div>
    </div>
  </div>

  <!-- Single column: optional image + name + optional text -->
  <div
    v-else
    :data-field="containerField"
    :class="cn(containerClass, 'justify-center text-center', !hasImage && 'max-w-xl')"
  >
    <img
      v-if="hasImage"
      :src="image"
      :alt="name"
      :data-field="dataFieldImage"
      :class="cn(adaptive ? 'flex-1 min-h-0 max-h-full' : 'w-48 max-w-full max-h-full')"
      :style="imageStyle"
    />
    <div :data-field="dataFieldName" :class="cn('w-full', hasImage && 'mt-4 shrink-0')">
      <p
        class="template-adaptive font-bold leading-tight text-gray-900 w-full text-3xl max-w-xl"
        data-max-lines="1"
        data-min-font="14"
      >
        {{ name }}
      </p>
    </div>
    <p
      v-if="hasText"
      :data-field="dataFieldText"
      class="template-adaptive text-gray-700 text-lg leading-relaxed mt-3"
      :class="cn(hasImage && 'max-w-xl')"
      data-max-lines="4"
      data-min-font="12"
    >
      {{ text }}
    </p>
  </div>
</template>
