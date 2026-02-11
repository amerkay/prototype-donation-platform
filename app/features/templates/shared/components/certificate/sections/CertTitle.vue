<script setup lang="ts">
defineProps<{
  title: string
  color: string
  dataField?: string
}>()
</script>

<template>
  <div class="w-full overflow-hidden mb-6">
    <h2
      :data-field="dataField"
      data-max-lines="2"
      class="font-bold leading-tight tracking-wide m-0 text-6xl line-clamp-2"
      :style="{ color }"
    >
      {{ title }}
    </h2>
  </div>
</template>
