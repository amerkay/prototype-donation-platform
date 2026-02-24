<script setup lang="ts">
import type { TransactionLineItem } from '~/features/donor-portal/types'
import { ReceiptText } from 'lucide-vue-next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { formatCurrency } from '~/lib/formatCurrency'

defineProps<{
  lineItems: TransactionLineItem[]
  currency: string
  campaignName?: string
}>()
</script>

<template>
  <Card v-if="lineItems.length > 0" class="min-w-0 overflow-hidden">
    <CardHeader>
      <CardTitle class="text-base flex items-center gap-2">
        <ReceiptText class="h-4 w-4" />
        Order Details
      </CardTitle>
    </CardHeader>
    <CardContent>
      <p v-if="campaignName" class="text-sm text-muted-foreground mb-3">
        {{ campaignName }}
      </p>
      <div class="overflow-x-auto">
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
            <TableRow v-for="item in lineItems" :key="item.productId">
              <TableCell>{{ item.productTitle }}</TableCell>
              <TableCell class="text-right">{{ item.quantity }}</TableCell>
              <TableCell class="text-right">{{
                formatCurrency(item.unitPrice, currency)
              }}</TableCell>
              <TableCell class="text-right font-medium">{{
                formatCurrency(item.unitPrice * item.quantity, currency)
              }}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </CardContent>
  </Card>
</template>
