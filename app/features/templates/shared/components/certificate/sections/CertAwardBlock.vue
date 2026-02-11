<script setup lang="ts">
import type { CertificateAwardBlock } from '~/features/templates/shared/types'

defineProps<{
  awardBlock: CertificateAwardBlock
  dataField?: string
}>()
</script>

<template>
  <div :data-field="dataField" class="w-full text-center">
    <!-- Row 1: Award text line 1 (plain text) -->
    <p class="text-gray-700 text-2xl m-0 line-clamp-1">{{ awardBlock.textLine1 }}</p>

    <!-- Row 2: Donor name (stylized, optional) -->
    <p
      v-if="awardBlock.donorName?.show"
      class="cert-adaptive font-medium text-gray-700 text-5xl my-4 whitespace-nowrap"
      data-min-font="24"
      :style="{ fontFamily: `'${awardBlock.donorName.fontFamily}', serif` }"
    >
      {{ awardBlock.donorName.value }}
    </p>

    <!-- Row 3: Award text line 2 (rich text) -->
    <!-- eslint-disable-next-line vue/no-v-html -- sanitized by processTemplateRichText -->
    <div
      class="cert-award-line2 text-gray-700 text-2xl line-clamp-1"
      v-html="awardBlock.textLine2Html"
    />
  </div>
</template>

<style scoped>
.cert-award-line2 :deep(p) {
  margin: 0;
}
</style>
