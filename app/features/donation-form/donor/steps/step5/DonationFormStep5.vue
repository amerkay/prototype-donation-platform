<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import DonationReceipt from '~/features/donation-form/donor/components/DonationReceipt.vue'
import RecurringUpsell from '~/features/donation-form/donor/components/RecurringUpsell.vue'
import DonationSharePrompt from '~/features/donation-form/donor/components/DonationSharePrompt.vue'
import { useDonationFormStore } from '~/features/donation-form/donor/stores/donationForm'
import { useFormTypeLabels } from '~/features/donation-form/shared/composables/useFormTypeLabels'
import { useDownloadDonationReceipt } from '~/features/donation-form/donor/composables/useDownloadDonationReceipt'
import { useAfterSaleSettingsStore } from '~/features/settings/admin/stores/afterSaleSettings'
import { formatCurrency } from '~/lib/formatCurrency'

const emit = defineEmits<{
  restart: []
}>()

const store = useDonationFormStore()
const afterSale = useAfterSaleSettingsStore()
const { labels, isDonation } = useFormTypeLabels()
const { downloadReceipt, isGenerating } = useDownloadDonationReceipt()
const showContent = ref(false)

const donorFirstName = computed(() => {
  const info = store.formSections.donorInfo as Record<string, unknown>
  const name = info.name as Record<string, string> | undefined
  return name?.firstName || 'Friend'
})

const formattedTotal = computed(() => formatCurrency(store.totalAmount, store.selectedCurrency))

const isOneTime = computed(() => store.activeTab === 'once')

const route = useRoute()
const isEmbedded = computed(() => !route.params.campaign_slug)

const handleRestart = () => {
  if (isEmbedded.value) return
  store.clearSession()
  emit('restart')
}

onMounted(() => {
  requestAnimationFrame(() => {
    showContent.value = true
  })
})
</script>

<template>
  <div class="space-y-6">
    <!-- Celebration Header -->
    <div
      :class="[
        'text-center space-y-3 transition-all duration-700',
        showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      ]"
    >
      <!-- Animated checkmark -->
      <div
        class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-950/40"
      >
        <svg
          class="h-8 w-8 text-green-600"
          :class="showContent ? 'animate-[checkmark_0.4s_ease-in-out_0.3s_both]' : 'opacity-0'"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2.5"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h2 class="text-2xl font-bold">
        {{ labels.confirmationTitle.replace('{name}', donorFirstName) }}
      </h2>
      <p class="text-muted-foreground">
        {{ labels.confirmationMessage.replace('{amount}', formattedTotal) }}
      </p>
    </div>

    <Separator />

    <!-- Receipt -->
    <div
      :class="[
        'transition-all duration-500 delay-200',
        showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      ]"
    >
      <DonationReceipt />
    </div>

    <!-- Recurring Upsell (one-time donation donors only) -->
    <div
      v-if="isOneTime && isDonation && afterSale.recurringUpsellEnabled"
      :class="[
        'transition-all duration-500 delay-300',
        showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      ]"
    >
      <RecurringUpsell />
    </div>

    <!-- Social Sharing -->
    <div
      v-if="afterSale.socialSharingEnabled"
      :class="[
        'transition-all duration-500 delay-400',
        showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      ]"
    >
      <DonationSharePrompt />
    </div>

    <Separator />

    <!-- Action Buttons -->
    <div
      :class="[
        'space-y-2 transition-all duration-500 delay-500',
        showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      ]"
    >
      <Button variant="outline" class="w-full" :disabled="isGenerating" @click="downloadReceipt">
        <Icon
          :name="isGenerating ? 'lucide:loader-2' : 'lucide:download'"
          :class="['mr-2 h-4 w-4', isGenerating && 'animate-spin']"
        />
        {{ isGenerating ? 'Generating...' : 'Download Receipt' }}
      </Button>
      <Button variant="outline" class="w-full" :disabled="isEmbedded" @click="handleRestart">
        <Icon name="lucide:plus" class="mr-2 h-4 w-4" />
        {{ labels.restartLabel }}
      </Button>
      <component :is="isEmbedded ? 'div' : 'NuxtLink'" to="/portal/donations" class="block">
        <Button variant="ghost" class="w-full" :disabled="isEmbedded">
          View My Donations
          <Icon name="lucide:arrow-right" class="ml-2 h-4 w-4" />
        </Button>
      </component>
    </div>
  </div>
</template>

<style scoped>
@keyframes checkmark {
  0% {
    stroke-dasharray: 100;
    stroke-dashoffset: 100;
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    stroke-dasharray: 100;
    stroke-dashoffset: 0;
    opacity: 1;
  }
}
</style>
