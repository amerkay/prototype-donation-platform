<script setup lang="ts">
import AdminBreadcrumbBar from '~/features/_admin/components/AdminBreadcrumbBar.vue'
import BaseDialogOrDrawer from '~/components/BaseDialogOrDrawer.vue'
import FormRenderer from '~/features/_library/form-builder/FormRenderer.vue'
import { useBillingSettingsStore } from '~/features/settings/admin/stores/billingSettings'
import { useCardUpdateForm } from '~/features/settings/admin/forms/card-update-form'
import { formatCurrency } from '~/lib/formatCurrency'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { CreditCard, Receipt, Mail, Trash2 } from 'lucide-vue-next'

definePageMeta({ layout: 'admin' })

const store = useBillingSettingsStore()
const cardForm = useCardUpdateForm

const breadcrumbs = [
  { label: 'Dashboard', href: '/admin/dashboard' },
  { label: 'Settings', href: '#' },
  { label: 'Billing' }
]

const formatMonth = (month: string): string => {
  const [year, m] = month.split('-')
  const date = new Date(Number(year), Number(m) - 1)
  return new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric' }).format(date)
}

const statusVariant = (status: string) => {
  if (status === 'paid') return 'default' as const
  if (status === 'pending') return 'secondary' as const
  return 'destructive' as const
}

// Billing email edit
const editingEmail = ref(false)
const emailDraft = ref('')

function startEditEmail() {
  emailDraft.value = store.billingEmail
  editingEmail.value = true
}

function saveEmail() {
  if (emailDraft.value && emailDraft.value !== store.billingEmail) {
    store.updateBillingEmail(emailDraft.value)
  }
  editingEmail.value = false
}

// Card update dialog
const showCardDialog = ref(false)
const cardFormRef = ref()
const cardData = ref({ cardNumber: '', expMonth: '', expYear: '', cvc: '' })

function openCardDialog() {
  cardData.value = { cardNumber: '', expMonth: '', expYear: '', cvc: '' }
  showCardDialog.value = true
}

function saveCard() {
  const last4 = cardData.value.cardNumber.slice(-4) || '0000'
  store.updatePaymentCard({
    brand: 'Visa',
    last4,
    expMonth: Number(cardData.value.expMonth) || 12,
    expYear: Number(cardData.value.expYear) || 2027
  })
  showCardDialog.value = false
}
</script>

<template>
  <div>
    <AdminBreadcrumbBar :items="breadcrumbs" />

    <div class="flex flex-1 flex-col px-4 pt-0 pb-4 space-y-6">
      <div>
        <h1 class="text-3xl font-bold">Billing</h1>
        <p class="text-sm text-muted-foreground mt-1">
          Simple 3% flat fee on all payments. Billed on the 1st of each month.
        </p>
      </div>

      <div class="grid gap-6 lg:grid-cols-2">
        <!-- Payment Method -->
        <Card>
          <CardHeader>
            <div class="flex items-center gap-2">
              <CreditCard class="w-5 h-5 text-primary" />
              <CardTitle>Payment Method</CardTitle>
            </div>
            <CardDescription>Card on file for automatic monthly billing.</CardDescription>
          </CardHeader>
          <CardContent>
            <div v-if="store.paymentCard" class="space-y-3">
              <div class="flex items-center gap-3 rounded-lg border p-3">
                <div
                  class="flex h-10 w-14 items-center justify-center rounded bg-muted text-xs font-bold"
                >
                  {{ store.paymentCard.brand }}
                </div>
                <div class="flex-1">
                  <p class="text-sm font-medium">
                    &bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull;
                    {{ store.paymentCard.last4 }}
                  </p>
                  <p class="text-xs text-muted-foreground">
                    Expires {{ String(store.paymentCard.expMonth).padStart(2, '0') }}/{{
                      store.paymentCard.expYear
                    }}
                  </p>
                </div>
              </div>
              <div class="flex gap-2">
                <Button variant="outline" size="sm" @click="openCardDialog">Update Card</Button>
                <Button
                  variant="ghost"
                  size="sm"
                  class="text-destructive hover:text-destructive"
                  @click="store.removePaymentCard()"
                >
                  <Trash2 class="w-4 h-4 mr-1" />
                  Remove
                </Button>
              </div>
            </div>
            <div v-else class="space-y-3">
              <p class="text-sm text-muted-foreground">No payment card on file.</p>
              <Button size="sm" @click="openCardDialog">
                <CreditCard class="w-4 h-4 mr-2" />
                Add Card
              </Button>
            </div>
          </CardContent>
        </Card>

        <!-- Billing Email -->
        <Card>
          <CardHeader>
            <div class="flex items-center gap-2">
              <Mail class="w-5 h-5 text-primary" />
              <CardTitle>Billing Email</CardTitle>
            </div>
            <CardDescription>Invoices and receipts are sent to this address.</CardDescription>
          </CardHeader>
          <CardContent>
            <div v-if="editingEmail" class="space-y-3">
              <div class="grid gap-2">
                <Label>Email Address</Label>
                <Input v-model="emailDraft" type="email" />
              </div>
              <div class="flex gap-2">
                <Button size="sm" @click="saveEmail">Save</Button>
                <Button variant="outline" size="sm" @click="editingEmail = false">Cancel</Button>
              </div>
            </div>
            <div v-else class="flex items-center justify-between">
              <p class="text-sm">{{ store.billingEmail }}</p>
              <Button variant="outline" size="sm" @click="startEditEmail">Change</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Statements -->
      <Card>
        <CardHeader>
          <div class="flex items-center gap-2">
            <Receipt class="w-5 h-5 text-primary" />
            <CardTitle>Monthly Statements</CardTitle>
          </div>
          <CardDescription>
            3% platform fee on all payment income, plus {{ (store.taxRate * 100).toFixed(0) }}% tax.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div class="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead class="text-right">Payments</TableHead>
                  <TableHead class="text-right">Income</TableHead>
                  <TableHead class="text-right">Fee (3%)</TableHead>
                  <TableHead class="text-right">Tax</TableHead>
                  <TableHead class="text-right">Total</TableHead>
                  <TableHead class="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="stmt in store.statements" :key="stmt.id">
                  <TableCell class="font-medium">{{ formatMonth(stmt.month) }}</TableCell>
                  <TableCell class="text-right">{{ stmt.paymentCount.toLocaleString() }}</TableCell>
                  <TableCell class="text-right">{{ formatCurrency(stmt.totalIncome) }}</TableCell>
                  <TableCell class="text-right">{{ formatCurrency(stmt.platformFee) }}</TableCell>
                  <TableCell class="text-right">{{ formatCurrency(stmt.tax) }}</TableCell>
                  <TableCell class="text-right font-medium">
                    {{ formatCurrency(stmt.total) }}
                  </TableCell>
                  <TableCell class="text-center">
                    <Badge :variant="statusVariant(stmt.status)" class="capitalize text-xs">
                      {{ stmt.status }}
                    </Badge>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          <Separator class="my-4" />
          <div
            class="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between text-sm text-muted-foreground"
          >
            <span>
              {{ store.paidStatements.length }} paid &middot;
              {{ store.pendingStatements.length }} pending
            </span>
            <span>
              Total billed:
              {{ formatCurrency(store.paidStatements.reduce((sum, s) => sum + s.total, 0)) }}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Update Card Dialog -->
    <BaseDialogOrDrawer
      :open="showCardDialog"
      :description="`This card will be charged automatically on the 1st of each month.`"
      @update:open="showCardDialog = $event"
    >
      <template #header>{{ store.paymentCard ? 'Update' : 'Add' }} Payment Card</template>
      <template #content>
        <FormRenderer ref="cardFormRef" v-model="cardData" :section="cardForm" validate-on-mount />
      </template>
      <template #footer>
        <Button variant="outline" @click="showCardDialog = false">Cancel</Button>
        <Button :disabled="!cardFormRef?.isValid" @click="saveCard">
          {{ store.paymentCard ? 'Update' : 'Add' }} Card
        </Button>
      </template>
    </BaseDialogOrDrawer>
  </div>
</template>
