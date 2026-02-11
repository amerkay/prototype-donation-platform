<script setup lang="ts">
import type { CertificateModel } from '~/features/templates/shared/types'
import CertificatePortrait from './CertificatePortrait.vue'
import CertificateLandscape from './CertificateLandscape.vue'

const THICKNESS = {
  thin: { borderPx: 5, productPx: 3, separatorPx: '2px' },
  medium: { borderPx: 10, productPx: 6, separatorPx: '3px' },
  thick: { borderPx: 20, productPx: 10, separatorPx: '4px' }
} as const

const props = defineProps<{
  model: CertificateModel
}>()

const isLandscape = computed(() => props.model.layout === 'landscape-classic')
const thickness = computed(
  () => THICKNESS[props.model.design.pageBorderThickness] ?? THICKNESS.medium
)
</script>

<template>
  <CertificateLandscape v-if="isLandscape" :model="model" :thickness="thickness" />
  <CertificatePortrait v-else :model="model" :thickness="thickness" />
</template>

<style>
/* Adaptive text class for donor name shrinking */
.cert-adaptive {
  white-space: nowrap;
  overflow: visible;
}
</style>
