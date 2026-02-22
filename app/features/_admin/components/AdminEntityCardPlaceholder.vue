<script setup lang="ts">
import type { Component } from 'vue'

defineProps<{
  icon?: Component
  label?: string
}>()
</script>

<template>
  <div
    class="w-full h-full flex items-center justify-center bg-linear-to-br from-primary/20 to-primary/5"
  >
    <component :is="icon" v-if="icon" class="w-8 h-8 text-primary/40" />
    <span v-else-if="label" class="text-foreground text-base font-bold opacity-65">{{
      label
    }}</span>
  </div>
</template>
