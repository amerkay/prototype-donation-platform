<script setup lang="ts">
import DonorTopBar from '~/features/campaigns/donor/components/DonorTopBar.vue'
import { useBrandingCssVars } from '~/features/settings/admin/composables/useBrandingCssVars'

const { brandingStyle } = useBrandingCssVars()
</script>

<template>
  <div class="min-h-screen bg-muted/30" :style="brandingStyle">
    <!-- TODO, remove when no longer prototype -->
    <DonorTopBar />
    <slot />
  </div>
</template>
