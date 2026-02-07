<script setup lang="ts">
import { Info } from 'lucide-vue-next'
import { Alert, AlertDescription } from '~/components/ui/alert'
</script>

<template>
  <Alert variant="info">
    <Info class="size-4" />
    <AlertDescription>
      <p>Branding is configured at the organization level and applies to all donor-facing pages.</p>
      <NuxtLink
        to="/admin/settings/branding"
        class="inline-flex items-center gap-1 font-medium hover:underline"
      >
        Edit branding settings
        <Icon name="lucide:arrow-right" class="size-3" />
      </NuxtLink>
    </AlertDescription>
  </Alert>
</template>
