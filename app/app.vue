<script setup lang="ts">
import 'vue-sonner/style.css'
import { Toaster } from '@/components/ui/sonner'
import { XIcon } from 'lucide-vue-next'
</script>

<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtPage />
    <Toaster position="bottom-right" close-button close-button-position="top-right" />
  </div>
</template>
