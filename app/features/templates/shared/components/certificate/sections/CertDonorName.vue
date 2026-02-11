<script setup lang="ts">
defineProps<{
  name: string
  fontFamily: string
  dataField?: string
}>()
</script>

<template>
  <div class="w-full overflow-hidden mb-6">
    <p
      :data-field="dataField"
      class="cert-adaptive font-medium text-gray-700 m-0 text-center whitespace-nowrap text-5xl"
      data-min-font="28"
      :style="{
        fontFamily: `'${fontFamily}', serif`
      }"
    >
      {{ name }}
    </p>
  </div>
</template>
