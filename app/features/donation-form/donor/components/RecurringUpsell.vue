<script setup lang="ts">
import { ref } from 'vue'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useDonationFormStore } from '~/features/donation-form/donor/stores/donationForm'
import { formatCurrency } from '~/lib/formatCurrency'

const store = useDonationFormStore()
const upgraded = ref(false)

const yearlyImpact = computed(() =>
  formatCurrency(store.totalDonationAmount * 12, store.selectedCurrency, 0)
)

const monthlyFormatted = computed(() =>
  formatCurrency(store.totalDonationAmount, store.selectedCurrency)
)

const handleUpgrade = () => {
  store.setActiveTab('monthly')
  store.setDonationAmount('monthly', store.donationAmounts.once)
  upgraded.value = true
}
</script>

<template>
  <Card v-if="!upgraded" class="border-primary/20 bg-primary/5">
    <CardContent class="space-y-3">
      <div class="flex items-center gap-2">
        <Icon name="lucide:repeat" class="h-5 w-5 text-primary" />
        <h3 class="font-semibold">Make this a monthly gift?</h3>
      </div>
      <p class="text-sm text-muted-foreground">
        {{ monthlyFormatted }}/month = {{ yearlyImpact }}/year of impact
      </p>
      <Button class="w-full" @click="handleUpgrade">
        <Icon name="lucide:heart" class="mr-2 h-4 w-4" />
        Upgrade to Monthly
      </Button>
    </CardContent>
  </Card>

  <Card v-else class="border-green-500/20 bg-green-50 dark:bg-green-950/20">
    <CardContent class="flex items-center gap-3">
      <Icon name="lucide:check-circle-2" class="h-5 w-5 text-green-600" />
      <p class="text-sm font-medium text-green-700 dark:text-green-400">
        Upgraded to {{ monthlyFormatted }}/month. Thank you!
      </p>
    </CardContent>
  </Card>
</template>
