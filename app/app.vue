<script setup lang="ts">
import 'vue-sonner/style.css'
import { Toaster } from '@/components/ui/sonner'

const colorMode = useColorMode()
const toasterTheme = computed(() => (colorMode.value === 'dark' ? 'dark' : 'light'))
</script>

<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <Toaster
      position="bottom-right"
      close-button
      close-button-position="top-right"
      :duration="5000"
      :theme="toasterTheme"
    />
  </div>
</template>
