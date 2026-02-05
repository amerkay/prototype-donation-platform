<script setup lang="ts">
import type { Component } from 'vue'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface Props {
  icon?: Component
  label: string
  value: string | number
}

defineProps<Props>()
</script>

<template>
  <Card>
    <CardHeader class="flex-row items-center gap-3">
      <div
        v-if="icon"
        class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted"
      >
        <component :is="icon" class="size-5 text-muted-foreground" />
      </div>
      <div class="space-y-0.5">
        <CardDescription class="text-sm">{{ label }}</CardDescription>
        <CardTitle class="text-2xl">{{ value }}</CardTitle>
      </div>
    </CardHeader>
  </Card>
</template>
