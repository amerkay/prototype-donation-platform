<script setup lang="ts">
defineProps<{
  bodyHtml: string
  dataField?: string
}>()
</script>

<template>
  <div
    :data-field="dataField"
    class="cert-body template-adaptive w-full mx-auto text-gray-700 text-center leading-relaxed text-xl max-w-2xl"
    data-max-lines="2"
    data-min-font="12"
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
