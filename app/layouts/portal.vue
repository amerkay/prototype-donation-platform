<script setup lang="ts">
import PortalSidebar from '~/features/donor-portal/sidebar/PortalSidebar.vue'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
</script>

<template>
  <div>
    <SidebarProvider>
      <PortalSidebar />
      <SidebarInset>
        <PrototypeExploreNavBar label="Donor Portal" />
        <slot />
      </SidebarInset>
    </SidebarProvider>
  </div>
</template>
