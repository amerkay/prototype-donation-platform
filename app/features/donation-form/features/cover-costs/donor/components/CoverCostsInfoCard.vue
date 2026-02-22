<script setup lang="ts">
import { ref } from 'vue'
import { useCharitySettingsStore } from '~/features/settings/admin/stores/charitySettings'
import CoverCostsUpsellModal from './CoverCostsUpsellModal.vue'

// componentField passes model-value/disabled which this component doesn't need
defineOptions({ inheritAttrs: false })

defineProps<{ targets?: Record<string, string> }>()

const charityStore = useCharitySettingsStore()
const showModal = ref(false)
</script>

<template>
  <div class="border rounded-lg text-card-foreground p-6 bg-background space-y-2">
    <h3 class="text-lg font-semibold" :data-field="targets?.heading">
      {{ charityStore.charityCosts.heading }}
    </h3>
    <p class="text-sm text-muted-foreground" :data-field="targets?.introText">
      {{ charityStore.charityCosts.introText }}
    </p>
    <button
      v-if="charityStore.charityCosts.costs.length > 0"
      type="button"
      class="text-sm text-primary underline underline-offset-4 hover:opacity-80"
      @click="showModal = true"
    >
      See cost breakdown
    </button>
  </div>

  <CoverCostsUpsellModal v-model:open="showModal" />
</template>
