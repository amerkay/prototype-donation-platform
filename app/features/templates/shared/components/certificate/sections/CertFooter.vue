<script setup lang="ts">
defineProps<{
  text: string
  dataField?: string
}>()
</script>

<template>
  <p
    :data-field="dataField"
    class="text-gray-500 text-center m-0 whitespace-nowrap overflow-hidden text-ellipsis w-full text-base mt-1"
  >
    {{ text }}
  </p>
</template>
