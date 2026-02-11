<script setup lang="ts">
defineProps<{
  color: string
  thickness: string
}>()
</script>

<template>
  <div
    class="shrink-0 my-8 mx-auto"
    :style="{
      width: '10rem',
      height: thickness,
      backgroundColor: color
    }"
  />
</template>
