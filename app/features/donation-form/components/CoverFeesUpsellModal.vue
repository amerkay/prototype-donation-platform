<script setup lang="ts">
import BaseDialogOrDrawer from '~/features/donation-form/components/BaseDialogOrDrawer.vue'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'

interface Props {
  open?: boolean
}

interface Emits {
  (e: 'update:open', value: boolean): void
}

interface OperationalCost {
  service: string
  purpose: string
  annualCost: string | number
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const operationalCosts: OperationalCost[] = [
  {
    service: 'Stripe',
    purpose: 'Payment processing',
    annualCost: '2.9% + 20p'
  },
  {
    service: 'BeaconCRM',
    purpose: 'Donor management',
    annualCost: 2500
  },
  {
    service: 'Mailchimp',
    purpose: 'Email updates',
    annualCost: 600
  },
  {
    service: 'WordPress Hosting',
    purpose: 'Website infrastructure',
    annualCost: 480
  },
  {
    service: 'n8n Automation',
    purpose: 'Workflow automation',
    annualCost: 360
  },
  {
    service: 'CloudFlare',
    purpose: 'Security & performance',
    annualCost: 240
  },
  {
    service: 'Communications Manager',
    purpose: 'Full-time (Portugal)',
    annualCost: 38000
  },
  {
    service: 'Corporate Outreach',
    purpose: 'Part-time fundraising',
    annualCost: 26000
  }
]

const formatCost = (cost: string | number) => {
  return typeof cost === 'number' ? `£${cost.toLocaleString()}` : cost
}

const handleClose = () => {
  emit('update:open', false)
}
</script>

<template>
  <BaseDialogOrDrawer :open="open" @update:open="emit('update:open', $event)">
    <template #header>Help Us Keep More for the Orangutans</template>

    <template #content>
      <div class="space-y-4 py-4">
        <p class="text-sm text-muted-foreground">
          Running a modern charity requires essential technology and services. By covering these
          operational costs, you ensure 100% of your donation goes directly to protecting orangutans
          and their habitat.
        </p>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Service</TableHead>
              <TableHead class="text-right">Annual Cost</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="cost in operationalCosts" :key="cost.service">
              <TableCell>
                <div class="font-medium">{{ cost.service }}</div>
                <div class="text-xs text-muted-foreground">{{ cost.purpose }}</div>
              </TableCell>
              <TableCell class="text-right font-mono">{{ formatCost(cost.annualCost) }}</TableCell>
            </TableRow>
          </TableBody>
        </Table>

        <p class="text-sm text-muted-foreground">
          Your optional contribution helps offset these necessary costs, meaning every penny of your
          main donation can directly fund orangutan conservation work.
        </p>
      </div>
    </template>

    <template #footer>
      <Button variant="outline" class="w-full" @click="handleClose">Close</Button>
    </template>
  </BaseDialogOrDrawer>
</template>
