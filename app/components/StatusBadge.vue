<script setup lang="ts">
import { getStatusColor } from '~/lib/statusColors'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const props = defineProps<{
  status: string
  class?: string
}>()

const colors = computed(() => getStatusColor(props.status))
</script>

<template>
  <Badge variant="outline" :class="cn(colors.border, colors.text, props.class)">
    <span :class="cn('size-1.5 shrink-0 rounded-full', colors.dot)" />
    <slot>{{ status }}</slot>
  </Badge>
</template>
