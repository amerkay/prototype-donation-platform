<script setup lang="ts">
import { computed } from 'vue'
import BaseDialogOrDrawer from '~/components/BaseDialogOrDrawer.vue'
import { useInjectedBrandingStyle } from '~/features/settings/admin/composables/useBrandingCssVars'
import { Button } from '@/components/ui/button'
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

interface Props {
  open?: boolean
}

interface Emits {
  (e: 'update:open', value: boolean): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()
const brandingStyle = useInjectedBrandingStyle()
const charityStore = useCharitySettingsStore()

const charityCosts = computed(() => charityStore.charityCosts)

const formatCost = (cost: string, currency?: string) => {
  if (!currency) return cost

  const symbol = getCurrencySymbol(currency)
  const numericValue = Number(cost)
  return !isNaN(numericValue) ? `${symbol}${numericValue.toLocaleString()}` : `${cost} ${symbol}`
}

const handleClose = () => {
  emit('update:open', false)
}
</script>

<template>
  <BaseDialogOrDrawer
    :open="open"
    :content-style="brandingStyle"
    @update:open="emit('update:open', $event)"
  >
    <template #header>{{ charityCosts.heading }}</template>

    <template #content>
      <div class="space-y-4 py-4">
        <p v-if="charityCosts.introText" class="text-sm text-muted-foreground">
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

        <p v-if="charityCosts.outroText" class="text-sm text-muted-foreground">
          {{ charityCosts.outroText }}
        </p>
      </div>
    </template>

    <template #footer>
      <Button variant="outline" class="w-full" @click="handleClose">Close</Button>
    </template>
  </BaseDialogOrDrawer>
</template>
