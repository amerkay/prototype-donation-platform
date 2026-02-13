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
    <p class="template-adaptive text-gray-700 text-2xl m-0" data-max-lines="1" data-min-font="14">
      {{ awardBlock.textLine1 }}
    </p>

    <!-- Row 2: Donor name (stylized, optional) -->
    <p
      v-if="awardBlock.donorName?.show"
      class="template-adaptive font-medium text-gray-700 text-5xl my-4 whitespace-nowrap"
      data-min-font="24"
      :style="{ fontFamily: `'${awardBlock.donorName.fontFamily}', serif` }"
    >
      {{ awardBlock.donorName.value }}
    </p>
  </div>
</template>
