<script setup lang="ts">
import type { CertificateModel } from '~/features/templates/shared/types'
import CertificatePortrait from './CertificatePortrait.vue'
import CertificateLandscape from './CertificateLandscape.vue'

const props = defineProps<{
  model: CertificateModel
}>()

const isLandscape = computed(() => props.model.layout === 'landscape-classic')
</script>

<template>
  <CertificateLandscape v-if="isLandscape" :model="model" />
  <CertificatePortrait v-else :model="model" />
</template>

<style>
/* Adaptive text class for donor name shrinking */
.cert-adaptive {
  white-space: nowrap;
  overflow: visible;
}
</style>
