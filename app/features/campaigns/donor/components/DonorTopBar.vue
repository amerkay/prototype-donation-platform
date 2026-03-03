<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { ICON_MENU, ICON_CLOSE } from '~/lib/icons'
import { useCampaigns } from '~/features/campaigns/shared/composables/useCampaigns'

const route = useRoute()
const orgSlug = computed(() => (route.params.org_slug as string) || 'bosf')
const campaignSlug = computed(() => (route.params.campaign_slug as string) || 'adopt-orangutan')

// 1:1 campaign:form — get form directly from campaign
const { getCampaignById } = useCampaigns()
const campaign = computed(() => getCampaignById(campaignSlug.value))
const defaultForm = computed(() => campaign.value?.form ?? null)

const navLinks = computed(() => [
  { label: 'Campaign', to: `/${orgSlug.value}/${campaignSlug.value}` },
  {
    label: 'Donate',
    to: `/${orgSlug.value}/${campaignSlug.value}/${defaultForm.value?.id || 'form-orangutan-full'}`
  },
  { label: 'P2P Templates', to: `/${orgSlug.value}/p2p-templates` }
])

const mobileMenuOpen = ref(false)

const isActive = (to: string) => {
  return route.path === to
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
      <ICON_CLOSE v-if="mobileMenuOpen" class="w-4 h-4" />
      <ICON_MENU v-else class="w-4 h-4" />
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
