<script setup lang="ts">
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useDonationFormStore } from '~/features/donation-form/donor/stores/donationForm'
import { useFormConfigStore } from '~/features/donation-form/shared/stores/formConfig'
import { useReceiptTemplateStore } from '~/features/templates/admin/stores/receiptTemplate'
import { useBrandingSettingsStore } from '~/features/settings/admin/stores/brandingSettings'
import { useMatchedGiving } from '~/features/campaigns/features/matched-giving/donor/composables/useMatchedGiving'
import MatchedGivingCallout from '~/features/campaigns/features/matched-giving/donor/components/MatchedGivingCallout.vue'
import { formatCurrency } from '~/lib/formatCurrency'

const store = useDonationFormStore()
const configStore = useFormConfigStore()
const receiptStore = useReceiptTemplateStore()
const brandingStore = useBrandingSettingsStore()

const donorInfo = computed(() => store.formSections.donorInfo as Record<string, unknown>)
const giftAid = computed(() => store.formSections.giftAid as Record<string, unknown>)

const frequencyLabel = computed(() => {
  const labels: Record<string, string> = {
    once: 'One-time',
    monthly: 'Monthly',
    yearly: 'Yearly',
    multiple: 'Multiple items'
  }
  return labels[store.activeTab] ?? store.activeTab
})

const formattedTotal = computed(() => formatCurrency(store.totalAmount, store.selectedCurrency))

const formattedDonation = computed(() =>
  formatCurrency(store.totalDonationAmount, store.selectedCurrency)
)

const formattedCoverCosts = computed(() =>
  formatCurrency(store.coverCostsAmount, store.selectedCurrency)
)

const donorFullName = computed(() => {
  const name = donorInfo.value.name as Record<string, string> | undefined
  const first = name?.firstName || ''
  const last = name?.lastName || ''
  return `${first} ${last}`.trim() || 'Donor'
})

const donorEmail = computed(() => donorInfo.value.email as string | undefined)

const hasGiftAid = computed(() => giftAid.value?.claimGiftAid === true)

const receiptId = computed(() => store.receiptId)

const formTitle = computed(() => configStore.form?.title ?? 'Donation')
const {
  isMatched,
  isFirstInstallmentOnly,
  multiplier,
  activePeriod,
  formattedMatchedAmount,
  formattedTotalImpact
} = useMatchedGiving(
  () => store.totalDonationAmount,
  () => store.totalAmount,
  () => store.selectedCurrency
)
</script>

<template>
  <Card class="print:shadow-none print:border-0">
    <CardContent class="space-y-4">
      <!-- Logo -->
      <div v-if="receiptStore.showLogo && brandingStore.logoUrl" class="flex justify-center">
        <img :src="brandingStore.logoUrl" alt="Logo" class="h-10 w-auto object-contain" />
      </div>

      <!-- Receipt Header -->
      <div class="flex items-center justify-between">
        <h3 class="font-semibold">Donation Receipt</h3>
        <Badge variant="outline" class="text-xs font-mono">
          {{ receiptId }}
        </Badge>
      </div>

      <Separator />

      <!-- Donation Details -->
      <div class="space-y-2 text-sm">
        <div class="flex justify-between">
          <span class="text-muted-foreground">Form</span>
          <span>{{ formTitle }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-muted-foreground">Frequency</span>
          <span>{{ frequencyLabel }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-muted-foreground">Donation</span>
          <span>{{ formattedDonation }}</span>
        </div>
        <div v-if="store.coverCostsAmount > 0" class="flex justify-between">
          <span class="text-muted-foreground">Covered costs</span>
          <span>{{ formattedCoverCosts }}</span>
        </div>
      </div>

      <Separator />

      <!-- Total -->
      <div class="flex justify-between font-semibold">
        <span>Total charged</span>
        <span>{{ formattedTotal }}</span>
      </div>

      <!-- Matched Giving -->
      <template v-if="isMatched && store.totalDonationAmount > 0">
        <MatchedGivingCallout
          :active-period="activePeriod"
          :multiplier="multiplier"
          class="text-sm"
        >
          <p class="text-sm font-semibold leading-tight text-muted-foreground">
            <template v-if="isFirstInstallmentOnly">First payment matched</template>
            <template v-else>Matched</template>
            {{ multiplier }}x
            <template v-if="activePeriod?.matcherName">
              by {{ activePeriod.matcherName }}
            </template>
          </p>
          <template #trailing>
            <span class="ml-auto shrink-0 font-medium text-primary"
              >+{{ formattedMatchedAmount }}</span
            >
          </template>
        </MatchedGivingCallout>
        <div class="flex justify-between font-semibold">
          <span>
            <template v-if="isFirstInstallmentOnly">First month impact</template>
            <template v-else>Total impact</template>
          </span>
          <span class="text-primary">{{ formattedTotalImpact }}</span>
        </div>
      </template>

      <Separator />

      <!-- Donor Info -->
      <div class="space-y-2 text-sm">
        <div class="flex justify-between">
          <span class="text-muted-foreground">Donor</span>
          <span>{{ donorFullName }}</span>
        </div>
        <div v-if="donorEmail" class="flex justify-between">
          <span class="text-muted-foreground">Email</span>
          <span>{{ donorEmail }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-muted-foreground">Payment</span>
          <span>Card ending in 4242</span>
        </div>
      </div>

      <!-- Gift Aid Badge -->
      <div v-if="hasGiftAid" class="flex items-center gap-2">
        <Badge variant="secondary">
          <Icon name="lucide:heart-handshake" class="mr-1 h-3 w-3" />
          Gift Aid declared
        </Badge>
      </div>

      <!-- Tribute mention -->
      <div
        v-if="store.isTribute && store.tributeData?.honoreeName"
        class="text-sm text-muted-foreground"
      >
        <template v-if="store.tributeData.type === 'memorial'">
          In memory of {{ store.tributeData.honoreeName.honoreeFirstName }}
          {{ store.tributeData.honoreeName.honoreeLastName }}
        </template>
        <template v-else-if="store.tributeData.type === 'gift'">
          Gift for {{ store.tributeData.honoreeName.honoreeFirstName }}
          {{ store.tributeData.honoreeName.honoreeLastName }}
        </template>
      </div>
    </CardContent>
  </Card>
</template>
