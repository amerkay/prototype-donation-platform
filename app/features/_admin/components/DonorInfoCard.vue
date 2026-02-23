<script setup lang="ts">
import { User, Gift } from 'lucide-vue-next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import AdminDetailRow from '~/features/_admin/components/AdminDetailRow.vue'
import { useDonorStats } from '~/features/_admin/composables/useDonorStats'
import { formatCurrency } from '~/lib/formatCurrency'
import { formatDate } from '~/lib/formatDate'

const props = defineProps<{
  donorId: string
  donorName: string
  donorEmail: string
  isAnonymous?: boolean
  message?: string
  tribute?: { type: 'gift' | 'memorial'; honoreeName: string }
  address?: {
    line1: string
    line2?: string
    city: string
    region?: string
    postcode: string
    country: string
  }
  linkable?: boolean
}>()

const {
  isLoading,
  baseCurrency,
  totalDonated,
  donationCount,
  avgDonation,
  lastDonationDate,
  activeSubscriptions,
  monthlyRecurring
} = useDonorStats(computed(() => props.donorId))
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle class="text-base flex items-center gap-2">
        <User class="h-4 w-4" />
        Donor
      </CardTitle>
    </CardHeader>
    <CardContent class="space-y-2 text-sm">
      <AdminDetailRow label="Name">
        <span class="font-medium flex items-center gap-1">
          <NuxtLink
            v-if="linkable && !isAnonymous"
            :to="`/admin/donors/${donorId}`"
            class="text-primary hover:underline"
          >
            {{ donorName }}
          </NuxtLink>
          <template v-else>
            {{ isAnonymous ? 'Anonymous' : donorName }}
          </template>
          <Badge v-if="isAnonymous" variant="secondary" class="text-xs">Anon</Badge>
        </span>
      </AdminDetailRow>
      <AdminDetailRow label="Email">
        {{ donorEmail }}
      </AdminDetailRow>
      <AdminDetailRow v-if="address" label="Address">
        <div class="text-right">
          <p>{{ address.line1 }}</p>
          <p v-if="address.line2">{{ address.line2 }}</p>
          <p>
            {{ address.city }}<template v-if="address.region">, {{ address.region }}</template>
            {{ address.postcode }}
          </p>
        </div>
      </AdminDetailRow>
      <div v-if="!isLoading" class="grid grid-cols-2 gap-2 pt-2 border-t">
        <div class="rounded-md bg-muted/50 px-3 py-2">
          <p class="text-xs text-muted-foreground">Total Donated</p>
          <p class="text-sm font-semibold">{{ formatCurrency(totalDonated, baseCurrency) }}</p>
        </div>
        <div class="rounded-md bg-muted/50 px-3 py-2">
          <p class="text-xs text-muted-foreground">Donations</p>
          <p class="text-sm font-semibold">{{ donationCount }}</p>
        </div>
        <div class="rounded-md bg-muted/50 px-3 py-2">
          <p class="text-xs text-muted-foreground">Average</p>
          <p class="text-sm font-semibold">{{ formatCurrency(avgDonation, baseCurrency) }}</p>
        </div>
        <div v-if="lastDonationDate" class="rounded-md bg-muted/50 px-3 py-2">
          <p class="text-xs text-muted-foreground">Last Donation</p>
          <p class="text-sm font-semibold">{{ formatDate(lastDonationDate) }}</p>
        </div>
        <div class="rounded-md bg-muted/50 px-3 py-2">
          <p class="text-xs text-muted-foreground">Active Subs</p>
          <p class="text-sm font-semibold">{{ activeSubscriptions.length }}</p>
        </div>
        <div v-if="monthlyRecurring > 0" class="rounded-md bg-muted/50 px-3 py-2">
          <p class="text-xs text-muted-foreground">Monthly Recurring</p>
          <p class="text-sm font-semibold">{{ formatCurrency(monthlyRecurring, baseCurrency) }}</p>
        </div>
      </div>
      <div v-if="message" class="pt-2">
        <p class="text-muted-foreground mb-1">Message</p>
        <p class="bg-muted rounded p-2 text-sm italic">"{{ message }}"</p>
      </div>
      <div v-if="tribute" class="flex items-center gap-2 pt-1">
        <Gift class="h-4 w-4 text-muted-foreground" />
        <span class="capitalize">{{ tribute.type }}</span>
        <span class="text-muted-foreground">for</span>
        <span class="font-medium">{{ tribute.honoreeName }}</span>
      </div>
    </CardContent>
  </Card>
</template>
