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
}>()

const borderRadius = computed(() => BORDER_RADIUS[props.imageShape] ?? BORDER_RADIUS.circle)
</script>

<template>
  <div
    :data-field="dataField"
    :class="
      cn(
        'flex flex-col items-center justify-center',
        adaptive ? 'flex-1 min-h-0 max-h-full' : 'flex-1 min-h-0'
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
          'font-bold leading-tight text-gray-900 text-center text-3xl mt-4',
          !adaptive && 'line-clamp-2'
        )
      "
    >
      {{ name }}
    </p>
  </div>
</template>
