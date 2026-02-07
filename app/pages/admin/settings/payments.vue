<script setup lang="ts">
import AdminBreadcrumbBar from '~/features/_admin/components/AdminBreadcrumbBar.vue'
import StripeConnectionCard from '~/features/settings/admin/components/StripeConnectionCard.vue'
import PayPalConnectionCard from '~/features/settings/admin/components/PayPalConnectionCard.vue'

definePageMeta({ layout: 'admin' })

const breadcrumbs = [
  { label: 'Dashboard', href: '/admin/dashboard' },
  { label: 'Settings', href: '#' },
  { label: 'Payment Processors' }
]
</script>

<template>
  <div>
    <AdminBreadcrumbBar :items="breadcrumbs" />

    <div class="flex flex-1 flex-col gap-6 px-4 pt-0 pb-4">
      <StripeConnectionCard />
      <PayPalConnectionCard />
    </div>
  </div>
</template>
