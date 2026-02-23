<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import DonationFormStep5 from '~/features/donation-form/donor/steps/step5/DonationFormStep5.vue'
import { useDonationFormStore } from '~/features/donation-form/donor/stores/donationForm'
import { useReactiveTransactions } from '~/sample-api-responses/useReactiveTransactions'
import { useBrandingCssVars } from '~/features/settings/admin/composables/useBrandingCssVars'

const donationStore = useDonationFormStore()
const { transactions } = useReactiveTransactions()
const { brandingStyle } = useBrandingCssVars()

const ready = ref(false)

function populateStores() {
  const txn = transactions.value[0]
  if (!txn) return

  const [firstName = '', ...rest] = txn.donorName.split(' ')
  const lastName = rest.join(' ')

  donationStore.setCurrency(txn.currency)
  donationStore.setActiveTab(txn.type === 'one_time' ? 'once' : 'monthly')
  donationStore.setDonationAmount(txn.type === 'one_time' ? 'once' : 'monthly', txn.subtotal)
  donationStore.updateFormSection('donorInfo', {
    name: { firstName, lastName },
    email: txn.donorEmail
  })
  donationStore.updateFormSection('giftAid', { claimGiftAid: txn.giftAid })
  donationStore.submitDonation(txn.id)
  ready.value = true
}

// Populate immediately during setup so currency is set before first render
populateStores()

onUnmounted(() => {
  donationStore.clearSession()
})
</script>

<template>
  <div v-if="ready" :style="brandingStyle" class="p-4">
    <DonationFormStep5 />
  </div>
</template>
