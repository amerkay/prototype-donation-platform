<script setup lang="ts">
defineProps<{
  backgroundImage: string | null
  dataField?: string
}>()
</script>

<template>
  <img
    v-if="backgroundImage"
    :data-field="dataField"
    :src="backgroundImage"
    alt=""
    class="absolute top-0 left-0 w-full h-full object-cover"
  />
  <div v-else :data-field="dataField" class="absolute top-0 left-0 w-full h-full bg-white" />
</template>
