<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft } from 'lucide-vue-next'

defineProps<{
  label?: string
}>()
</script>

<template>
  <header class="bg-background border-b rounded-t-lg">
    <div class="px-4 py-2 flex items-center justify-between gap-4">
      <!-- Left: Back to explore -->
      <NuxtLink to="/" class="shrink-0">
        <Button variant="ghost" size="sm" as="span">
          <ArrowLeft class="w-4 h-4 mr-1" />
          Explore Prototype
        </Button>
      </NuxtLink>

      <!-- Center: optional content -->
      <slot />

      <!-- Right: context label -->
      <div
        v-if="label"
        class="hidden sm:flex items-center gap-2 text-xs text-muted-foreground shrink-0"
      >
        <Separator orientation="vertical" class="h-4" />
        <span>{{ label }}</span>
      </div>
    </div>

    <!-- Mobile slot for expandable menus -->
    <slot name="mobile" />
  </header>
</template>
