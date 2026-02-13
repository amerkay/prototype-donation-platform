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
    <div class="min-h-[2.8rem] flex items-end justify-end">
      <p
        class="template-adaptive font-medium text-gray-700 m-0 text-4xl leading-tight -mb-1"
        data-min-font="8"
        :style="{ fontFamily: `'${fontFamily}', sans-serif` }"
      >
        {{ name }}
      </p>
    </div>
    <p class="template-adaptive text-gray-500 m-0 text-lg" data-min-font="12">
      {{ title }}
    </p>
  </div>
</template>
