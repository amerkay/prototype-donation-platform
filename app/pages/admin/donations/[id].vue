<script setup lang="ts">
import AdminBreadcrumbBar from '~/features/_admin/components/AdminBreadcrumbBar.vue'
import AdminDetailRow from '~/features/_admin/components/AdminDetailRow.vue'
import { useDonations } from '~/features/donations/admin/composables/useDonations'
import { formatCurrency } from '~/lib/formatCurrency'
import { formatDateTime } from '~/lib/formatDate'
import StatusBadge from '~/components/StatusBadge.vue'
import { paymentMethodLabel } from '~/lib/formatPaymentMethod'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { ArrowLeft, RefreshCw, Heart, Gift } from 'lucide-vue-next'

definePageMeta({ layout: 'admin' })

const route = useRoute()
const { getTransactionById } = useDonations()

const txn = computed(() => getTransactionById(route.params.id as string))

const breadcrumbs = computed(() => [
  { label: 'Dashboard', href: '/admin/dashboard' },
  { label: 'Donations', href: '/admin/donations' },
  { label: txn.value ? formatCurrency(txn.value.totalAmount, txn.value.currency) : 'Not Found' }
])
</script>

<template>
  <div>
    <AdminBreadcrumbBar :items="breadcrumbs" />

    <div class="flex flex-1 flex-col px-4 pt-0 pb-4">
      <div v-if="!txn" class="py-12 text-center">
        <p class="text-muted-foreground">Transaction not found.</p>
        <Button variant="outline" class="mt-4" @click="navigateTo('/admin/donations')">
          <ArrowLeft class="w-4 h-4 mr-2" />
          Back to Donations
        </Button>
      </div>

      <template v-else>
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-4">
          <div>
            <div class="flex items-center gap-3">
              <h1 class="text-2xl font-bold">
                {{ formatCurrency(txn.totalAmount, txn.currency) }}
              </h1>
              <StatusBadge :status="txn.status" />
            </div>
            <p class="text-sm text-muted-foreground">{{ formatDateTime(txn.createdAt) }}</p>
          </div>
          <Button variant="outline" size="sm" @click="navigateTo('/admin/donations')">
            <ArrowLeft class="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>

        <div class="grid gap-6 md:grid-cols-2">
          <!-- Donor -->
          <Card>
            <CardHeader>
              <CardTitle class="text-base">Donor</CardTitle>
            </CardHeader>
            <CardContent class="space-y-2 text-sm">
              <AdminDetailRow label="Name">
                <span class="font-medium flex items-center gap-1">
                  {{ txn.isAnonymous ? 'Anonymous' : txn.donorName }}
                  <Badge v-if="txn.isAnonymous" variant="secondary" class="text-xs">Anon</Badge>
                </span>
              </AdminDetailRow>
              <AdminDetailRow label="Email">
                <NuxtLink :to="`/admin/donors/${txn.donorId}`" class="text-primary hover:underline">
                  {{ txn.donorEmail }}
                </NuxtLink>
              </AdminDetailRow>
              <div v-if="txn.message" class="pt-2">
                <p class="text-muted-foreground mb-1">Message</p>
                <p class="bg-muted rounded p-2 text-sm italic">"{{ txn.message }}"</p>
              </div>
              <div v-if="txn.tribute" class="flex items-center gap-2 pt-1">
                <Gift class="h-4 w-4 text-muted-foreground" />
                <span class="capitalize">{{ txn.tribute.type }}</span>
                <span class="text-muted-foreground">for</span>
                <span class="font-medium">{{ txn.tribute.honoreeName }}</span>
              </div>
            </CardContent>
          </Card>

          <!-- Payment -->
          <Card>
            <CardHeader>
              <CardTitle class="text-base">Payment</CardTitle>
            </CardHeader>
            <CardContent class="space-y-2 text-sm">
              <AdminDetailRow label="Method">
                <span class="capitalize">{{ paymentMethodLabel(txn.paymentMethod) }}</span>
              </AdminDetailRow>
              <AdminDetailRow label="Processor">
                <span class="capitalize">{{ txn.processor }}</span>
              </AdminDetailRow>
              <AdminDetailRow label="Transaction ID">
                <span class="font-mono text-xs">{{ txn.processorTransactionId }}</span>
              </AdminDetailRow>
              <Separator />
              <AdminDetailRow
                label="Subtotal"
                :value="formatCurrency(txn.subtotal, txn.currency)"
              />
              <AdminDetailRow
                v-if="txn.coverCostsAmount > 0"
                label="Cover Costs"
                :value="formatCurrency(txn.coverCostsAmount, txn.currency)"
              />
              <div class="flex justify-between font-medium">
                <span>Total</span>
                <span>{{ formatCurrency(txn.totalAmount, txn.currency) }}</span>
              </div>
              <div
                v-if="txn.exchangeRate !== 1"
                class="flex justify-between text-xs text-muted-foreground"
              >
                <span>Exchange Rate</span>
                <span>1 {{ txn.currency }} = {{ txn.exchangeRate }} {{ txn.baseCurrency }}</span>
              </div>
            </CardContent>
          </Card>

          <!-- Campaign -->
          <Card>
            <CardHeader>
              <CardTitle class="text-base">Campaign</CardTitle>
            </CardHeader>
            <CardContent class="space-y-2 text-sm">
              <AdminDetailRow
                label="Campaign"
                :value="txn.campaignName"
                value-class="font-medium"
              />
              <AdminDetailRow label="Charity" :value="txn.charityName" />
              <div v-if="txn.subscriptionId" class="flex items-center gap-2 pt-1">
                <RefreshCw class="h-4 w-4 text-muted-foreground" />
                <span class="text-muted-foreground">Recurring —</span>
                <NuxtLink
                  :to="`/admin/subscriptions/${txn.subscriptionId}`"
                  class="text-primary hover:underline text-sm"
                >
                  View Subscription
                </NuxtLink>
              </div>
            </CardContent>
          </Card>

          <!-- Gift Aid -->
          <Card v-if="txn.giftAid">
            <CardHeader>
              <CardTitle class="text-base flex items-center gap-2">
                <Heart class="h-4 w-4" />
                Gift Aid
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p class="text-sm text-muted-foreground">
                Donor declared Gift Aid eligibility for this donation.
              </p>
            </CardContent>
          </Card>
        </div>

        <!-- Line Items -->
        <Card v-if="txn.lineItems.length" class="mt-6">
          <CardHeader>
            <CardTitle class="text-base">Line Items</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead class="text-right">Qty</TableHead>
                  <TableHead class="text-right">Unit Price</TableHead>
                  <TableHead class="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="item in txn.lineItems" :key="item.productId">
                  <TableCell>
                    <span class="mr-2">{{ item.productIcon }}</span>
                    {{ item.productTitle }}
                  </TableCell>
                  <TableCell class="text-right">{{ item.quantity }}</TableCell>
                  <TableCell class="text-right">{{
                    formatCurrency(item.unitPrice, txn.currency)
                  }}</TableCell>
                  <TableCell class="text-right font-medium">{{
                    formatCurrency(item.unitPrice * item.quantity, txn.currency)
                  }}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </template>
    </div>
  </div>
</template>
