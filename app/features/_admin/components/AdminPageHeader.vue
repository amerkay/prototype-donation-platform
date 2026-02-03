<script setup lang="ts">
defineProps<{
  title: string
  stats?: { value: string | number; label: string }[]
}>()
</script>

<template>
  <div class="mb-6 space-y-3">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <h1 class="text-3xl font-bold">{{ title }}</h1>
      <div v-if="$slots.action" class="sm:contents">
        <slot name="action" />
      </div>
    </div>
    <div v-if="stats?.length" class="flex flex-wrap gap-1.5 text-xs">
      <span v-for="stat in stats" :key="stat.label" class="rounded-md bg-muted px-2 py-1">
        <span class="font-semibold">{{ stat.value }}</span> {{ stat.label }}
      </span>
    </div>
  </div>
</template>
