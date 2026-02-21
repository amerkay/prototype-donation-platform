<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowRight } from 'lucide-vue-next'
import ReceiptPreview from '~/features/templates/admin/components/ReceiptPreview.vue'
import CrowdfundingPage from '~/features/campaigns/donor/components/CrowdfundingPage.vue'
import PreviewCurrencySelect from '~/features/_admin/components/PreviewCurrencySelect.vue'
import { useCampaigns } from '~/features/campaigns/shared/composables/useCampaigns'
import { useCurrencySettingsStore } from '~/features/settings/admin/stores/currencySettings'
import { useBrandingCssVars } from '~/features/settings/admin/composables/useBrandingCssVars'
import { charityActiveTab } from '~/features/settings/admin/forms/charity-settings-form'
import { activateHashTarget } from '~/features/_library/form-builder/composables/useHashTarget'

const currencyStore = useCurrencySettingsStore()
const { campaigns } = useCampaigns()
const { brandingStyle } = useBrandingCssVars()

const activeTab = ref('receipt')
const selectedCurrency = ref(currencyStore.defaultCurrency)

// Last-edited crowdfunding-enabled campaign for preview
const previewCampaign = computed(
  () =>
    [...campaigns.value]
      .filter((c) => c.crowdfunding?.enabled && c.type !== 'fundraiser')
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0]
)

// Bi-directional sync: form tab → preview currency
watch(charityActiveTab, (tab) => {
  if (tab && currencyStore.supportedCurrencies.includes(tab)) {
    selectedCurrency.value = tab
  }
})

// Preview currency → form tab
function handleCurrencyChange(currency: string) {
  selectedCurrency.value = currency
  charityActiveTab.value = currency
  nextTick(() => {
    activateHashTarget(`charitySettings.currencyTabs.${currency}`)
  })
}

const TABS = [
  {
    value: 'receipt',
    label: 'Receipt',
    link: '/admin/templates/receipts',
    linkLabel: 'Edit Receipt'
  },
  {
    value: 'campaign',
    label: 'Campaign',
    link: '/admin/campaigns',
    linkLabel: 'Edit Campaigns'
  }
] as const
</script>

<template>
  <div class="space-y-3">
    <div class="flex items-center justify-between">
      <span class="text-sm font-medium text-muted-foreground">Preview</span>
      <PreviewCurrencySelect
        :model-value="selectedCurrency"
        :currencies="currencyStore.supportedCurrencies"
        @update:model-value="handleCurrencyChange"
      />
    </div>

    <Tabs v-model="activeTab">
      <TabsList class="w-full">
        <TabsTrigger v-for="tab in TABS" :key="tab.value" :value="tab.value" class="text-xs">
          {{ tab.label }}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="receipt">
        <div class="space-y-3">
          <div :style="brandingStyle">
            <ReceiptPreview :currency="selectedCurrency" />
          </div>
          <div class="flex justify-between text-xs text-muted-foreground px-1">
            <span>Preview with charity details</span>
            <NuxtLink
              to="/admin/templates/receipts"
              class="flex items-center gap-1 text-primary hover:underline"
            >
              Edit Receipt
              <ArrowRight class="size-3" />
            </NuxtLink>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="campaign">
        <div :style="brandingStyle">
          <CrowdfundingPage v-if="previewCampaign" :campaign="previewCampaign" />
          <p v-else class="text-sm text-muted-foreground text-center py-8">
            No campaigns with crowdfunding pages yet.
          </p>
        </div>
        <div class="flex justify-between text-xs text-muted-foreground px-1 mt-3">
          <span>Preview with charity details</span>
          <NuxtLink
            to="/admin/campaigns"
            class="flex items-center gap-1 text-primary hover:underline"
          >
            Edit Campaigns
            <ArrowRight class="size-3" />
          </NuxtLink>
        </div>
      </TabsContent>
    </Tabs>
  </div>
</template>
