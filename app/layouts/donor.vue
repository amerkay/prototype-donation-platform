<script setup lang="ts">
import DonorTopBar from '~/features/campaigns/donor/components/DonorTopBar.vue'
</script>

<template>
  <div class="min-h-screen bg-muted/30">
    <!-- TODO, remove when no longer prototype -->
    <DonorTopBar />
    <slot />
  </div>
</template>
