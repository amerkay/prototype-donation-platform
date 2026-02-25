<script setup lang="ts">
import type { TransactionLineItem } from '~/features/donor-portal/types'
import { NuxtLink } from '#components'
import { ICON_SECTION_LINE_ITEMS } from '~/lib/icons'
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
  title?: string
  campaignName?: string
  campaignLink?: string
}>()
</script>

<template>
  <Card v-if="lineItems.length > 0" class="min-w-0 overflow-hidden">
    <CardHeader>
      <CardTitle class="text-base flex items-center gap-2">
        <ICON_SECTION_LINE_ITEMS class="h-4 w-4" />
        {{ title ?? 'Line Items' }}
      </CardTitle>
    </CardHeader>
    <CardContent class="space-y-3">
      <div v-if="campaignName" class="text-sm">
        <span class="text-muted-foreground">Campaign: </span>
        <NuxtLink
          v-if="campaignLink"
          :to="campaignLink"
          class="font-medium text-primary hover:underline"
        >
          {{ campaignName }}
        </NuxtLink>
        <span v-else class="font-medium">{{ campaignName }}</span>
      </div>
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
