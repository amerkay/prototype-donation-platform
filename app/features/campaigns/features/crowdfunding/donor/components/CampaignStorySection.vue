<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { ICON_CHEVRON_DOWN, ICON_CHEVRON_UP } from '~/lib/icons'

const props = defineProps<{
  story: string
}>()

const isExpanded = ref(false)
const previewLength = 350

const preview = computed(() => {
  if (props.story.length <= previewLength) return props.story
  return props.story.slice(0, previewLength).trim() + '...'
})

const hasMore = computed(() => props.story.length > previewLength)
</script>

<template>
  <h3 class="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Our Story</h3>
  <div class="text-sm leading-relaxed whitespace-pre-line">
    {{ isExpanded ? story : preview }}
  </div>
  <Button
    v-if="hasMore"
    variant="outline"
    size="sm"
    class="text-primary"
    @click="isExpanded = !isExpanded"
  >
    {{ isExpanded ? 'Read less' : 'Read more' }}
    <ICON_CHEVRON_UP v-if="isExpanded" class="w-4 h-4 ml-1" />
    <ICON_CHEVRON_DOWN v-else class="w-4 h-4 ml-1" />
  </Button>
</template>
