<script setup lang="ts">
import ThemeToggle from '~/components/ThemeToggle.vue'
import { EMAIL_CARD_COMPONENTS } from '~/emails/components/cards/registry'
import { EMAIL_CARD_TOKENS, type EmailCardToken } from '~/emails/components/cards/types'
import { useEmailPreviewContext } from '~/features/templates/admin/composables/useEmailPreviewContext'

definePageMeta({ layout: 'admin' })

const { cards, latestCampaign, latestDonation, latestDonor, latestSubscription } =
  useEmailPreviewContext()

const cardEntries = computed(() =>
  EMAIL_CARD_TOKENS.map((token: EmailCardToken) => ({
    token,
    component: EMAIL_CARD_COMPONENTS[token],
    data: cards.value[token]
  }))
)
</script>

<template>
  <div class="p-4 sm:p-6 lg:p-8 space-y-6">
    <div class="flex items-start justify-between gap-4">
      <div class="space-y-1">
        <h1 class="text-2xl font-semibold">Email Cards Preview</h1>
        <p class="text-sm text-muted-foreground">
          Cards are rendered from current app data (latest campaign, donation, donor, and
          subscription).
        </p>
        <p class="text-xs text-muted-foreground">
          Campaign: {{ latestCampaign?.name || 'N/A' }} | Donation:
          {{ latestDonation?.id || 'N/A' }} | Donor: {{ latestDonor?.fullName || 'N/A' }} |
          Subscription: {{ latestSubscription?.id || 'N/A' }}
        </p>
      </div>
      <ThemeToggle />
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      <!-- <Card v-for="entry in cardEntries" :key="entry.token"> -->
      <div v-for="entry in cardEntries" :key="entry.token">
        <!-- <CardHeader> -->
        <h2 class="text-xs font-semibold tracking-wide text-muted-foreground mb-4">
          {{ entry.token }}
        </h2>
        <!-- </CardHeader> -->
        <!-- <CardContent class="-mt-4"> -->
        <component :is="entry.component" v-if="entry.data" v-bind="entry.data" />
        <p v-else class="text-xs text-muted-foreground">No data available for this card yet.</p>
        <!-- </CardContent> -->
        <!-- </Card> -->
      </div>
    </div>
  </div>
</template>
