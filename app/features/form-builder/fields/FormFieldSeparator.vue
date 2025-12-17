<script setup lang="ts">
import { Separator } from '@/components/ui/separator'
import type { SeparatorFieldMeta } from '~/features/form-builder/form-builder-types'

interface Props {
  meta: SeparatorFieldMeta
}

defineProps<Props>()
</script>

<template>
  <Separator :orientation="meta.orientation || 'horizontal'" :class="meta.class" />
</template>
