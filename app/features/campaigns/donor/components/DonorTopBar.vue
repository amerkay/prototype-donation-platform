<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Menu, X } from 'lucide-vue-next'

const route = useRoute()

const navLinks = [
  { label: 'Crowdfunding', to: '/donor/crowdfunding' },
  { label: 'Donate', to: '/donor/donate' },
  { label: 'P2P Templates', to: '/donor/p2p-templates' }
]

const mobileMenuOpen = ref(false)

const isActive = (to: string) => {
  return route.path === to || route.path.startsWith(to + '/')
}
</script>

<template>
  <PrototypeExploreNavBar label="Donor View">
    <!-- Center: Nav links (desktop) -->
    <nav class="hidden sm:flex items-center gap-1">
      <NuxtLink v-for="link in navLinks" :key="link.to" :to="link.to">
        <Button
          variant="ghost"
          size="sm"
          as="span"
          :class="{ 'bg-accent text-accent-foreground': isActive(link.to) }"
        >
          {{ link.label }}
        </Button>
      </NuxtLink>
    </nav>

    <!-- Mobile: Hamburger (replaces right label on mobile) -->
    <Button variant="ghost" size="sm" class="sm:hidden" @click="mobileMenuOpen = !mobileMenuOpen">
      <X v-if="mobileMenuOpen" class="w-4 h-4" />
      <Menu v-else class="w-4 h-4" />
    </Button>

    <!-- Mobile menu -->
    <template #mobile>
      <div v-if="mobileMenuOpen" class="sm:hidden border-t bg-background px-4 py-2 space-y-1">
        <NuxtLink
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          @click="mobileMenuOpen = false"
        >
          <Button
            variant="ghost"
            size="sm"
            as="span"
            class="w-full justify-start"
            :class="{ 'bg-accent text-accent-foreground': isActive(link.to) }"
          >
            {{ link.label }}
          </Button>
        </NuxtLink>
      </div>
    </template>
  </PrototypeExploreNavBar>
</template>
