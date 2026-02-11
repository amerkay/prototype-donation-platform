<script setup lang="ts">
defineProps<{
  date: string
  dataField?: string
}>()
</script>

<template>
  <div :data-field="dataField" class="text-left">
    <p class="text-gray-500 uppercase tracking-wide m-0 text-base mb-2">Date</p>
    <p class="text-gray-700 m-0 whitespace-nowrap text-xl">{{ date }}</p>
  </div>
</template>
