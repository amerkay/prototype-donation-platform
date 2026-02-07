<script setup lang="ts">
import { ref } from 'vue'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { useDonationFormStore } from '~/features/donation-form/donor/stores/donationForm'
import { useImpactCartStore } from '~/features/donation-form/features/impact-cart/donor/stores/impactCart'
import { formatCurrency } from '~/lib/formatCurrency'

const emit = defineEmits<{
  complete: []
}>()

const store = useDonationFormStore()
const cartStore = useImpactCartStore()

const isProcessing = ref(false)

const donorInfo = computed(() => store.formSections.donorInfo as Record<string, string>)
const giftAid = computed(() => store.formSections.giftAid as Record<string, unknown>)

const donorFullName = computed(() => {
  const first = donorInfo.value.firstName || ''
  const last = donorInfo.value.lastName || ''
  return `${first} ${last}`.trim() || 'Donor'
})

const frequencyLabel = computed(() => {
  const labels: Record<string, string> = {
    once: 'One-time donation',
    monthly: 'Monthly donation',
    yearly: 'Yearly donation',
    multiple: 'Multiple items'
  }
  return labels[store.activeTab] ?? store.activeTab
})

const formattedDonation = computed(() =>
  formatCurrency(store.totalDonationAmount, store.selectedCurrency)
)

const formattedCoverCosts = computed(() =>
  formatCurrency(store.coverCostsAmount, store.selectedCurrency)
)

const formattedTotal = computed(() => formatCurrency(store.totalAmount, store.selectedCurrency))

const hasGiftAid = computed(() => giftAid.value?.claimGiftAid === true)

const hasCoverCosts = computed(() => store.coverCostsAmount > 0)

const selectedProduct = computed(() => {
  if (store.activeTab === 'monthly' || store.activeTab === 'yearly') {
    return store.selectedProducts[store.activeTab]
  }
  return null
})

const cartItems = computed(() => {
  if (store.activeTab === 'multiple') return cartStore.multipleCart
  return []
})

const handlePay = async () => {
  isProcessing.value = true
  // Simulate payment processing delay
  await new Promise((resolve) => setTimeout(resolve, 1500))
  store.submitDonation()
  isProcessing.value = false
  emit('complete')
}
</script>

<template>
  <div class="space-y-4">
    <h2 class="text-xl font-semibold">Review Your Donation</h2>

    <!-- Donation Summary -->
    <Card>
      <CardContent class="space-y-3">
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium">Donation</span>
          <Badge variant="secondary">{{ frequencyLabel }}</Badge>
        </div>

        <Separator />

        <!-- Single item -->
        <template v-if="store.activeTab !== 'multiple'">
          <div class="flex justify-between text-sm">
            <span class="text-muted-foreground">
              {{ selectedProduct?.name ?? 'Donation amount' }}
            </span>
            <span>{{ formattedDonation }}</span>
          </div>
        </template>

        <!-- Multiple cart items -->
        <template v-else>
          <div v-for="item in cartItems" :key="item.id" class="flex justify-between text-sm">
            <span class="text-muted-foreground">
              {{ item.name }} <span v-if="(item.quantity ?? 1) > 1">x{{ item.quantity }}</span>
            </span>
            <span>{{
              formatCurrency((item.price ?? 0) * (item.quantity ?? 1), store.selectedCurrency)
            }}</span>
          </div>
        </template>

        <!-- Cover costs -->
        <div v-if="hasCoverCosts" class="flex justify-between text-sm">
          <span class="text-muted-foreground">Covered costs</span>
          <span>{{ formattedCoverCosts }}</span>
        </div>

        <Separator />

        <div class="flex justify-between font-semibold">
          <span>Total</span>
          <span>{{ formattedTotal }}</span>
        </div>
      </CardContent>
    </Card>

    <!-- Donor Details -->
    <Card>
      <CardContent class="space-y-2">
        <h3 class="text-sm font-medium">Donor Information</h3>
        <Separator />
        <div class="space-y-1 text-sm">
          <div class="flex justify-between">
            <span class="text-muted-foreground">Name</span>
            <span>{{ donorFullName }}</span>
          </div>
          <div v-if="donorInfo.email" class="flex justify-between">
            <span class="text-muted-foreground">Email</span>
            <span>{{ donorInfo.email }}</span>
          </div>
        </div>

        <!-- Badges -->
        <div class="flex flex-wrap gap-2 pt-1">
          <Badge v-if="hasGiftAid" variant="secondary">
            <Icon name="lucide:heart-handshake" class="mr-1 h-3 w-3" />
            Gift Aid
          </Badge>
          <Badge v-if="store.isTribute" variant="secondary">
            <Icon name="lucide:ribbon" class="mr-1 h-3 w-3" />
            Tribute
          </Badge>
          <Badge v-if="store.needsShipping" variant="secondary">
            <Icon name="lucide:package" class="mr-1 h-3 w-3" />
            Shipping
          </Badge>
        </div>
      </CardContent>
    </Card>

    <!-- Mock Payment Method -->
    <Card>
      <CardContent>
        <h3 class="text-sm font-medium mb-3">Payment Method</h3>
        <Separator class="mb-3" />
        <div class="flex items-center gap-3 rounded-md border p-3 bg-accent/30">
          <Icon name="lucide:credit-card" class="h-5 w-5 text-muted-foreground" />
          <div class="text-sm">
            <p class="font-medium">Visa ending in 4242</p>
            <p class="text-xs text-muted-foreground">Expires 12/28</p>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Pay Button -->
    <Button class="w-full h-12 text-base" :disabled="isProcessing" @click="handlePay">
      <template v-if="isProcessing">
        <Icon name="lucide:loader-2" class="mr-2 h-4 w-4 animate-spin" />
        Processing...
      </template>
      <template v-else>
        <Icon name="lucide:lock" class="mr-2 h-4 w-4" />
        Complete Donation &mdash; {{ formattedTotal }}
      </template>
    </Button>

    <p class="text-center text-xs text-muted-foreground">
      <Icon name="lucide:shield-check" class="inline h-3 w-3 mr-1" />
      Your payment is secure and encrypted
    </p>
  </div>
</template>
