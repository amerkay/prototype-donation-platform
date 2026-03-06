<script setup lang="ts">
import type { SectionHeadingFieldDef } from '~/features/_library/form-builder/types'
import { useContainerFieldSetup } from '~/features/_library/form-builder/composables/useContainerFieldSetup'
import { useResolvedFieldMeta } from '~/features/_library/form-builder/composables/useResolvedFieldMeta'

interface Props {
  meta: SectionHeadingFieldDef
  name: string
}

const props = defineProps<Props>()

const { isVisible } = useContainerFieldSetup(props.name, props.meta.visibleWhen)
const { resolvedLabel } = useResolvedFieldMeta(props.meta)
</script>

<template>
  <div v-show="isVisible" class="flex items-center px-1 pt-3 -mb-2">
    <span class="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
      {{ resolvedLabel }}
    </span>
  </div>
</template>
