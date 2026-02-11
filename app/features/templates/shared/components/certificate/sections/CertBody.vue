<script setup lang="ts">
defineProps<{
  bodyHtml: string
  dataField?: string
}>()
</script>

<template>
  <div
    :data-field="dataField"
    class="cert-body w-full max-w-[95%] mx-auto line-clamp-2 text-gray-700 text-center leading-relaxed text-xl mb-6"
  >
    <!-- eslint-disable-next-line vue/no-v-html -- sanitized -->
    <div v-html="bodyHtml" />
  </div>
</template>

<style scoped>
.cert-body :deep(p) {
  margin: 0;
}
.cert-body :deep(p + p) {
  margin-top: 0.5em;
}
.cert-body :deep(a) {
  color: inherit;
  text-decoration: underline;
}
</style>
