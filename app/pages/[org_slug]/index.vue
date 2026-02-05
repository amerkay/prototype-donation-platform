<script setup lang="ts">
definePageMeta({
  layout: 'donor'
})

// Redirect to default campaign
const route = useRoute()
navigateTo(`/${route.params.org_slug}/adopt-orangutan`, { replace: true })
</script>

<template>
  <div />
</template>
