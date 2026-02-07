<script setup lang="ts">
import AdminBreadcrumbBar from '~/features/_admin/components/AdminBreadcrumbBar.vue'
import AdminDataTable from '~/features/_admin/components/AdminDataTable.vue'
import AdminDetailRow from '~/features/_admin/components/AdminDetailRow.vue'
import { useAdminSubscriptions } from '~/features/subscriptions/admin/composables/useAdminSubscriptions'
import { donationColumns } from '~/features/donations/admin/columns/donationColumns'
import { formatCurrency } from '~/lib/formatCurrency'
import { formatDate } from '~/lib/formatDate'
import StatusBadge from '~/components/StatusBadge.vue'
import { paymentMethodLabel } from '~/lib/formatPaymentMethod'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft } from 'lucide-vue-next'

definePageMeta({ layout: 'admin' })

const route = useRoute()
const { getSubscriptionById, getSubscriptionPayments } = useAdminSubscriptions()

const sub = computed(() => getSubscriptionById(route.params.id as string))
const payments = computed(() => getSubscriptionPayments(route.params.id as string))

const breadcrumbs = computed(() => [
  { label: 'Dashboard', href: '/admin/dashboard' },
  { label: 'Subscriptions', href: '/admin/subscriptions' },
  {
    label: sub.value
      ? `${formatCurrency(sub.value.amount, sub.value.currency)}/${sub.value.frequency}`
      : 'Not Found'
  }
])

const avgPayment = computed(() => {
  if (!sub.value || sub.value.paymentCount === 0) return 0
  return sub.value.totalPaid / sub.value.paymentCount
})

function handleRowClick(row: { original: { id: string } }) {
  navigateTo(`/admin/donations/${row.original.id}`)
}
</script>

<template>
  <div>
    <AdminBreadcrumbBar :items="breadcrumbs" />

    <div class="flex flex-1 flex-col px-4 pt-0 pb-4">
      <div v-if="!sub" class="py-12 text-center">
        <p class="text-muted-foreground">Subscription not found.</p>
        <Button variant="outline" class="mt-4" @click="navigateTo('/admin/subscriptions')">
          <ArrowLeft class="w-4 h-4 mr-2" />
          Back to Subscriptions
        </Button>
      </div>

      <template v-else>
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-4">
          <div>
            <div class="flex items-center gap-3">
              <h1 class="text-2xl font-bold">
                {{ formatCurrency(sub.amount, sub.currency) }}/{{ sub.frequency }}
              </h1>
              <StatusBadge :status="sub.status" />
            </div>
            <p class="text-sm text-muted-foreground">
              {{ sub.donorName }} &middot; {{ sub.donorEmail }}
            </p>
          </div>
          <Button variant="outline" size="sm" @click="navigateTo('/admin/subscriptions')">
            <ArrowLeft class="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>

        <div class="grid gap-6 md:grid-cols-2">
          <!-- Subscription Details -->
          <Card>
            <CardHeader>
              <CardTitle class="text-base">Subscription</CardTitle>
            </CardHeader>
            <CardContent class="space-y-2 text-sm">
              <AdminDetailRow
                label="Campaign"
                :value="sub.campaignName"
                value-class="font-medium"
              />
              <AdminDetailRow label="Charity" :value="sub.charityName" />
              <AdminDetailRow label="Frequency">
                <span class="capitalize">{{ sub.frequency }}</span>
              </AdminDetailRow>
              <AdminDetailRow
                label="Amount"
                :value="formatCurrency(sub.amount, sub.currency)"
                value-class="font-medium"
              />
              <Separator />
              <AdminDetailRow label="Payment">
                <span class="capitalize">{{ paymentMethodLabel(sub.paymentMethod) }}</span>
              </AdminDetailRow>
              <AdminDetailRow label="Processor">
                <span class="capitalize">{{ sub.processor }}</span>
              </AdminDetailRow>
              <AdminDetailRow label="Subscription ID">
                <span class="font-mono text-xs">{{ sub.processorSubscriptionId }}</span>
              </AdminDetailRow>
            </CardContent>
          </Card>

          <!-- Timeline -->
          <Card>
            <CardHeader>
              <CardTitle class="text-base">Timeline</CardTitle>
            </CardHeader>
            <CardContent class="space-y-2 text-sm">
              <AdminDetailRow label="Created" :value="formatDate(sub.createdAt)" />
              <AdminDetailRow label="Current Period">
                <span
                  >{{ formatDate(sub.currentPeriodStart) }} —
                  {{ formatDate(sub.currentPeriodEnd) }}</span
                >
              </AdminDetailRow>
              <AdminDetailRow
                v-if="sub.nextBillingDate"
                label="Next Billing"
                :value="formatDate(sub.nextBillingDate)"
              />
              <AdminDetailRow v-if="sub.cancelledAt" label="Cancelled">
                <span class="text-destructive">{{ formatDate(sub.cancelledAt) }}</span>
              </AdminDetailRow>
              <AdminDetailRow v-if="sub.pausedAt" label="Paused">
                <span class="text-amber-600">{{ formatDate(sub.pausedAt) }}</span>
              </AdminDetailRow>
            </CardContent>
          </Card>

          <!-- Financials -->
          <Card>
            <CardHeader>
              <CardTitle class="text-base">Financials</CardTitle>
            </CardHeader>
            <CardContent class="space-y-2 text-sm">
              <AdminDetailRow
                label="Lifetime Value"
                :value="formatCurrency(sub.totalPaid, sub.currency)"
                value-class="font-medium"
              />
              <AdminDetailRow label="Payment Count" :value="String(sub.paymentCount)" />
              <AdminDetailRow
                label="Average Payment"
                :value="formatCurrency(avgPayment, sub.currency)"
              />
              <div
                v-if="sub.exchangeRate !== 1"
                class="flex justify-between text-xs text-muted-foreground"
              >
                <span>Exchange Rate</span>
                <span>1 {{ sub.currency }} = {{ sub.exchangeRate }} {{ sub.baseCurrency }}</span>
              </div>
            </CardContent>
          </Card>

          <!-- Line Items -->
          <Card v-if="sub.lineItems.length">
            <CardHeader>
              <CardTitle class="text-base">Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                v-for="item in sub.lineItems"
                :key="item.productId"
                class="flex items-center justify-between py-1.5 text-sm"
              >
                <span>
                  <span class="mr-2">{{ item.productIcon }}</span>
                  {{ item.productName }}
                  <span v-if="item.quantity > 1" class="text-muted-foreground"
                    >x{{ item.quantity }}</span
                  >
                </span>
                <span class="font-medium">{{
                  formatCurrency(item.unitPrice * item.quantity, sub.currency)
                }}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <!-- Payment History -->
        <Card v-if="payments.length" class="mt-6">
          <CardHeader>
            <CardTitle class="text-base">Payment History</CardTitle>
          </CardHeader>
          <CardContent>
            <AdminDataTable
              :columns="donationColumns"
              :data="payments"
              :show-pagination="payments.length > 10"
              :page-size="10"
              @row-click="handleRowClick"
            />
          </CardContent>
        </Card>
      </template>
    </div>
  </div>
</template>
