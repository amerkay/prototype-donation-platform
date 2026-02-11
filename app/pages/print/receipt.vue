<script setup lang="ts">
/**
 * Print-ready receipt page for PDF generation.
 *
 * Puppeteer navigates to this page with a token parameter.
 * The token is used to retrieve the receipt model from server storage.
 */
import type { ReceiptModel } from '~/features/templates/shared/types'
import { getPageRenderGeometry } from '~/features/templates/admin/utils/page-geometry'
import ReceiptLayout from '~/features/templates/shared/components/receipt/ReceiptLayout.vue'

definePageMeta({
  layout: 'print'
})

const route = useRoute()
const token = computed(() => route.query.token as string | undefined)

// Fetch receipt model from server using token
const { data: model, error } = await useFetch<ReceiptModel>('/api/print-data', {
  query: { token },
  server: true
})

if (error.value || !model.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Receipt data not found or token expired'
  })
}

// Page geometry (receipts are always portrait A4)
const geometry = getPageRenderGeometry('portrait')

// Set page dimensions
useHead({
  style: [
    {
      innerHTML: ':root { --page-width: 210mm; --page-height: 297mm; }'
    }
  ]
})
</script>

<template>
  <div
    v-if="model"
    class="overflow-hidden"
    :style="{
      width: `${geometry.canvasWidthPx}px`,
      height: `${geometry.canvasHeightPx}px`
    }"
  >
    <ReceiptLayout :model="model" />
  </div>
</template>
