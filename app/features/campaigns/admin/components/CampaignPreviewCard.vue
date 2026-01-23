<script setup lang="ts">
const props = defineProps<{
  title?: string
  description?: string
  coverPhoto?: string
  url?: string
  compact?: boolean
}>()
</script>

<template>
  <div class="p-3 rounded-lg border bg-muted/30" :class="{ 'p-4': !compact }">
    <div class="flex items-start" :class="compact ? 'gap-3' : 'gap-4'">
      <div
        v-if="props.coverPhoto"
        class="rounded-md overflow-hidden shrink-0"
        :class="compact ? 'w-16 h-12' : 'w-24 h-16'"
      >
        <img :src="props.coverPhoto" :alt="props.title" class="w-full h-full object-cover" />
      </div>
      <div class="min-w-0">
        <p class="font-medium truncate" :class="compact ? 'text-sm' : ''">
          {{ props.title }}
        </p>
        <p class="text-muted-foreground line-clamp-2" :class="compact ? 'text-xs' : 'text-sm'">
          {{ props.description }}
        </p>
        <p v-if="props.url && !compact" class="text-xs text-primary mt-1">
          {{ props.url }}
        </p>
      </div>
    </div>
  </div>
</template>
