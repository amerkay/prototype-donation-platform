<script setup lang="ts">
import { cn } from '@/lib/utils'
import { PRODUCT_BORDER_RADIUS } from '~/features/templates/shared/types'

const props = defineProps<{
  name: string
  image: string
  imageShape: 'circle' | 'rounded' | 'square'
  borderColor: string
  borderWidth: number
  compact?: boolean
  adaptive?: boolean
  dataField?: string
}>()

const borderRadius = computed(
  () => PRODUCT_BORDER_RADIUS[props.imageShape] ?? PRODUCT_BORDER_RADIUS.circle
)
</script>

<template>
  <div
    :data-field="dataField"
    :class="
      cn(
        'flex flex-col items-center justify-center',
        adaptive ? 'flex-1 min-h-0 max-h-full' : 'flex-1 min-h-0',
        compact ? 'mb-2' : 'mb-4'
      )
    "
  >
    <img
      :src="image"
      :alt="name"
      :class="cn(adaptive ? 'flex-1 min-h-0 max-h-full' : 'w-48 max-w-full max-h-full')"
      :style="{
        aspectRatio: '1',
        objectFit: 'cover',
        borderRadius,
        border: `${borderWidth}px solid ${borderColor}`
      }"
    />
    <p
      :class="
        cn(
          'font-bold leading-tight text-gray-900 text-center',
          compact ? 'text-xl mt-2' : 'text-3xl mt-4',
          !adaptive && 'line-clamp-2'
        )
      "
    >
      {{ name }}
    </p>
  </div>
</template>
