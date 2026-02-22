<script setup lang="ts">
import { computed } from 'vue'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { getCurrencySymbol } from '~/features/donation-form/shared/composables/useCurrency'
import { useCharitySettingsStore } from '~/features/settings/admin/stores/charitySettings'

defineProps<{
  targets?: Record<string, string>
  showHeading?: boolean
}>()

const charityStore = useCharitySettingsStore()
const charityCosts = computed(() => charityStore.charityCosts)

const formatCost = (cost: string, currency?: string) => {
  if (!currency) return cost
  const symbol = getCurrencySymbol(currency)
  const numericValue = Number(cost)
  return !isNaN(numericValue) ? `${symbol}${numericValue.toLocaleString()}` : `${cost} ${symbol}`
}
</script>

<template>
  <div class="space-y-4">
    <h3 v-if="showHeading" class="font-semibold text-base" :data-field="targets?.heading">
      {{ charityCosts.heading }}
    </h3>

    <p
      v-if="charityCosts.introText"
      class="text-sm text-muted-foreground"
      :data-field="targets?.introText"
    >
      {{ charityCosts.introText }}
    </p>

    <Table v-if="charityCosts.costs.length > 0">
      <TableHeader>
        <TableRow>
          <TableHead>Service</TableHead>
          <TableHead class="text-right">Annual Cost</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow v-for="cost in charityCosts.costs" :key="cost.service">
          <TableCell>
            <div class="font-medium">{{ cost.service }}</div>
            <div class="text-xs text-muted-foreground">{{ cost.purpose }}</div>
          </TableCell>
          <TableCell class="text-right font-mono">
            {{ formatCost(cost.annualCost, cost.currency) }}
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>

    <p
      v-if="charityCosts.outroText"
      class="text-sm text-muted-foreground"
      :data-field="targets?.outroText"
    >
      {{ charityCosts.outroText }}
    </p>
  </div>
</template>
