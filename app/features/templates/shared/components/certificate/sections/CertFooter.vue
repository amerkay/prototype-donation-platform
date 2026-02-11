<script setup lang="ts">
defineProps<{
  text: string
  dataField?: string
}>()
</script>

<template>
  <p
    :data-field="dataField"
    class="text-gray-800 text-center m-0 whitespace-nowrap overflow-hidden text-ellipsis w-full text-base"
  >
    {{ text }}
  </p>
</template>
