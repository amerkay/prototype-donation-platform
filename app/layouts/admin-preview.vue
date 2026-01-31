<script setup lang="ts">
import PreviewLayout from '~/features/_admin/components/PreviewLayout.vue'

const route = useRoute()

const backUrl = computed(() => {
  const path = route.path.replace(/\/preview$/, '')
  return path.includes('/forms/') ? `${path}/edit` : path
})
</script>

<template>
  <PreviewLayout :back-url="backUrl">
    <slot />
  </PreviewLayout>
</template>
