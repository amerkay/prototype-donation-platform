<script setup lang="ts">
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { ICON_HIDE } from '~/lib/icons'

withDefaults(
  defineProps<{
    title?: string
    description?: string
  }>(),
  {
    title: 'Preview Unavailable',
    description: ''
  }
)
</script>

<template>
  <Empty class="border border-dashed">
    <EmptyHeader>
      <EmptyMedia variant="icon"><ICON_HIDE /></EmptyMedia>
      <EmptyTitle>{{ title }}</EmptyTitle>
      <EmptyDescription v-if="description">{{ description }}</EmptyDescription>
    </EmptyHeader>
  </Empty>
</template>
