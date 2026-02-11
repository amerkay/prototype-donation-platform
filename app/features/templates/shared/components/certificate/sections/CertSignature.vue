<script setup lang="ts">
defineProps<{
  name: string
  title: string
  fontFamily: string
  dataField?: string
}>()
</script>

<template>
  <div :data-field="dataField" class="text-right shrink-0">
    <p
      class="font-medium text-gray-700 m-0 whitespace-nowrap overflow-hidden text-ellipsis text-4xl"
      :style="{ fontFamily: `'${fontFamily}', sans-serif` }"
    >
      {{ name }}
    </p>
    <p class="text-gray-500 m-0 whitespace-nowrap overflow-hidden text-ellipsis text-lg">
      {{ title }}
    </p>
  </div>
</template>
