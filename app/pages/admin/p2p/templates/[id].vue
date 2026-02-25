<script setup lang="ts">
// P2P template detail is served by the shared campaign detail page.
// This redirect ensures /admin/p2p/templates/[id] URLs resolve correctly
// while keeping forms subpages (/admin/campaigns/[id]/forms/...) in one place.
definePageMeta({ layout: 'admin' })

const route = useRoute()
navigateTo(`/admin/campaigns/${route.params.id}`, { replace: true })
</script>

<template>
  <div />
</template>
