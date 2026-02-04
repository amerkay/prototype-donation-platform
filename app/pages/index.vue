<script setup lang="ts">
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Heart, LayoutDashboard, Users, Settings, ArrowRight } from 'lucide-vue-next'

definePageMeta({
  layout: 'default'
})

const donorCards = [
  {
    title: 'Crowdfunding Page',
    description:
      'A campaign page with hero image, story, progress bar, recent donations, and social sharing.',
    icon: Heart,
    to: '/donor/crowdfunding'
  },
  {
    title: 'Donor Portal',
    description:
      'Donation history, active subscriptions, fundraiser management, and payment details.',
    icon: LayoutDashboard,
    to: '/portal'
  },
  {
    title: 'P2P Campaign Templates',
    description:
      'Browse peer-to-peer fundraiser templates and walk through the supporter onboarding flow.',
    icon: Users,
    to: '/donor/p2p-templates'
  }
]
</script>

<template>
  <div class="min-h-screen bg-muted/30">
    <!-- Hero -->
    <div class="bg-background border-b">
      <div class="max-w-4xl mx-auto px-4 py-12 sm:py-16 text-center space-y-4">
        <h1 class="text-3xl sm:text-4xl font-bold tracking-tight">Explore My Prototype</h1>
        <p class="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
          A donation platform prototype built for the Borneo Orangutan Survival Foundation. Explore
          both the admin configuration side and the donor-facing experience.
        </p>
      </div>
    </div>

    <div class="max-w-4xl mx-auto px-4 py-8 space-y-10">
      <!-- Admin Section -->
      <section class="space-y-4">
        <div class="flex items-center gap-2">
          <Settings class="w-5 h-5 text-muted-foreground" />
          <h2 class="text-xl font-semibold">Admin Dashboard</h2>
        </div>
        <NuxtLink to="/admin/campaigns" class="group block">
          <Card class="hover:border-primary/40 transition-colors">
            <CardHeader>
              <div class="flex items-center justify-between">
                <div class="space-y-1">
                  <CardTitle class="text-lg">Campaign Management</CardTitle>
                  <CardDescription>
                    Configure campaigns, donation forms, crowdfunding pages, P2P settings, and
                    social sharing.
                  </CardDescription>
                </div>
                <ArrowRight
                  class="w-5 h-5 text-muted-foreground shrink-0 ml-4 opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </div>
            </CardHeader>
          </Card>
        </NuxtLink>
      </section>

      <Separator />

      <!-- Donor Section -->
      <section class="space-y-4">
        <div class="flex items-center gap-2">
          <Heart class="w-5 h-5 text-muted-foreground" />
          <h2 class="text-xl font-semibold">Donor Experience</h2>
        </div>
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <NuxtLink v-for="card in donorCards" :key="card.to" :to="card.to" class="group">
            <Card class="h-full hover:border-primary/40 transition-colors">
              <CardHeader class="space-y-3">
                <div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <component :is="card.icon" class="w-5 h-5 text-primary" />
                </div>
                <div class="space-y-1">
                  <CardTitle class="text-base flex items-center gap-2">
                    {{ card.title }}
                    <ArrowRight
                      class="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  </CardTitle>
                  <CardDescription class="text-sm">
                    {{ card.description }}
                  </CardDescription>
                </div>
              </CardHeader>
            </Card>
          </NuxtLink>
        </div>
      </section>
    </div>
  </div>
</template>
