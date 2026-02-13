<script setup lang="ts">
const COLOR_LINE1 = '#333333'

defineProps<{
  titleLine1: string
  titleLine2: string
  colorLine2: string
  dataFieldLine1?: string
  dataFieldLine2?: string
}>()
</script>

<template>
  <div class="w-full">
    <h3
      :data-field="dataFieldLine1"
      class="template-adaptive font-medium text-3xl m-0"
      data-max-lines="1"
      data-min-font="18"
      :style="{ color: COLOR_LINE1 }"
    >
      {{ titleLine1 }}
    </h3>
    <h2
      :data-field="dataFieldLine2"
      data-min-font="32"
      class="template-adaptive font-bold text-6xl mt-0 m-0"
      :style="{ color: colorLine2 }"
    >
      {{ titleLine2 }}
    </h2>
  </div>
</template>
