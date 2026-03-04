<script setup lang="ts">
import {
  TEMPLATE_REGISTRY,
  type DonationFormTemplate
} from '~/features/donation-form/admin/templates'
import type { CampaignType } from '~/features/campaigns/shared/types'
import { getCampaignCapabilities } from '~/features/campaigns/shared/utils/campaignCapabilities'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

const props = defineProps<{
  /** Filter templates based on campaign type (e.g. hide registration for P2P) */
  campaignType?: CampaignType
}>()

const emit = defineEmits<{
  select: [template: DonationFormTemplate]
}>()

const CATEGORIES = [
  { key: 'simple', label: 'Simple', variant: 'secondary' as const, desc: 'Quick setup' },
  {
    key: 'enhanced',
    label: 'Enhanced',
    variant: 'default' as const,
    desc: 'Advanced features for better engagement'
  },
  {
    key: 'advanced',
    label: 'Advanced',
    variant: 'destructive' as const,
    desc: 'Full-featured experience'
  }
]

const expectedFormType = computed(() =>
  props.campaignType ? getCampaignCapabilities(props.campaignType).formType : undefined
)

const donationTemplates = computed(() =>
  TEMPLATE_REGISTRY.filter((t) => !t.metadata.formType || t.metadata.formType === 'donation')
)

const registrationTemplates = computed(() =>
  TEMPLATE_REGISTRY.filter((t) => t.metadata.formType === 'registration')
)

const showRegistration = computed(
  () => !expectedFormType.value || expectedFormType.value === 'registration'
)

const showDonation = computed(
  () => !expectedFormType.value || expectedFormType.value === 'donation'
)

function byCategory(templates: DonationFormTemplate[], category: string) {
  return templates.filter((t) => t.metadata.category === category)
}
</script>

<template>
  <div class="py-4 space-y-8">
    <!-- Donation section -->
    <div v-if="showDonation" class="space-y-6">
      <h2 class="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Donation</h2>
      <template v-for="cat in CATEGORIES" :key="cat.key">
        <div v-if="byCategory(donationTemplates, cat.key).length" class="space-y-3">
          <h3 class="text-sm font-medium flex items-center gap-2">
            <Badge :variant="cat.variant">{{ cat.label }}</Badge>
            {{ cat.desc }}
          </h3>
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-3">
            <Card
              v-for="tmpl in byCategory(donationTemplates, cat.key)"
              :key="tmpl.metadata.id"
              :class="
                cn(
                  'cursor-pointer transition-all hover:border-primary hover:shadow-md hover:scale-[1.02]'
                )
              "
              @click="emit('select', tmpl)"
            >
              <CardHeader>
                <div class="flex items-start gap-3">
                  <div class="p-2 rounded-lg bg-primary/10 text-primary">
                    <component :is="tmpl.metadata.icon" class="w-6 h-6" />
                  </div>
                  <div class="flex-1 space-y-1">
                    <CardTitle class="text-base">{{ tmpl.metadata.name }}</CardTitle>
                    <Badge v-if="tmpl.metadata.requiresProducts" variant="outline" class="text-xs">
                      Products
                    </Badge>
                    <CardDescription class="text-xs">{{
                      tmpl.metadata.description
                    }}</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </div>
        </div>
      </template>
    </div>

    <Separator v-if="showDonation && showRegistration" />

    <!-- Registration / Ticketing section -->
    <div v-if="showRegistration" class="space-y-3">
      <h2 class="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Registration / Ticketing
      </h2>
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <Card
          v-for="tmpl in registrationTemplates"
          :key="tmpl.metadata.id"
          :class="
            cn(
              'cursor-pointer transition-all hover:border-primary hover:shadow-md hover:scale-[1.02]'
            )
          "
          @click="emit('select', tmpl)"
        >
          <CardHeader>
            <div class="flex items-start gap-3">
              <div class="p-2 rounded-lg bg-primary/10 text-primary">
                <component :is="tmpl.metadata.icon" class="w-6 h-6" />
              </div>
              <div class="flex-1 space-y-1">
                <CardTitle class="text-base">{{ tmpl.metadata.name }}</CardTitle>
                <CardDescription class="text-xs">{{ tmpl.metadata.description }}</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>
    </div>
  </div>
</template>
