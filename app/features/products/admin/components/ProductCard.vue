<script setup lang="ts">
import type { ImpactProduct } from '~/features/products/admin/types'
import { useProducts } from '~/features/products/admin/composables/useProducts'
import { useCertificateTemplates } from '~/features/templates/admin/composables/useCertificateTemplates'
import AdminDeleteButton from '~/features/_admin/components/AdminDeleteButton.vue'
import StatusBadge from '~/components/StatusBadge.vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, Copy, Package, Pencil, Award } from 'lucide-vue-next'
import { formatDistance } from 'date-fns'

const FREQUENCY_LABELS: Record<string, string> = {
  once: 'One-time',
  monthly: 'Monthly',
  yearly: 'Yearly'
}

const props = defineProps<{
  product: ImpactProduct
}>()

defineEmits<{
  duplicate: []
  delete: []
}>()

const { getDeleteProtection } = useProducts()
const { getTemplateById } = useCertificateTemplates()

const deleteProtection = computed(() => getDeleteProtection(props.product.id))

const formattedDate = computed(() =>
  formatDistance(new Date(props.product.updatedAt), new Date(), { addSuffix: true })
)

const priceDisplay = computed(() => {
  const p = props.product
  if (p.price) return `$${p.price}`
  if (p.minPrice && p.default) return `$${p.minPrice}–$${p.default}`
  if (p.minPrice) return `From $${p.minPrice}`
  return 'Custom'
})

const certificateName = computed(() => {
  if (!props.product.certificateTemplateId) return null
  const template = getTemplateById(props.product.certificateTemplateId)
  return template?.name
})
</script>

<template>
  <Card class="transition-all hover:shadow-md overflow-hidden pt-0">
    <NuxtLink :to="`/admin/products/${product.id}`" class="block">
      <div v-if="product.image" class="bg-muted/30 border-b">
        <img :src="product.image" :alt="product.name" class="w-full h-36 object-cover" />
      </div>
      <div v-else class="h-36 bg-muted/30 border-b flex items-center justify-center">
        <Package class="w-10 h-10 text-muted-foreground/40" />
      </div>
    </NuxtLink>

    <CardHeader class="pb-2">
      <NuxtLink :to="`/admin/products/${product.id}`" class="hover:underline">
        <CardTitle class="text-base truncate">{{ product.name }}</CardTitle>
      </NuxtLink>
      <p v-if="product.description" class="text-xs text-muted-foreground truncate">
        {{ product.description }}
      </p>
      <div class="flex items-center gap-1.5 flex-wrap mt-2">
        <Badge variant="outline" class="text-[10px] px-1.5 py-0">
          {{ FREQUENCY_LABELS[product.frequency] }}
        </Badge>
        <Badge variant="secondary" class="text-[10px] px-1.5 py-0">
          {{ priceDisplay }}
        </Badge>
        <StatusBadge :status="product.status" class="text-[10px] px-1.5 py-0" />
      </div>
      <p v-if="certificateName" class="flex items-center gap-1 text-xs text-muted-foreground mt-2">
        <Award class="w-3 h-3" />
        {{ certificateName }}
      </p>
      <p class="flex items-center gap-1.5 text-xs text-muted-foreground mt-2">
        <Calendar class="w-3 h-3" />
        Updated {{ formattedDate }}
      </p>
    </CardHeader>

    <CardContent class="flex gap-2">
      <Button variant="default" size="sm" class="flex-1" as-child>
        <NuxtLink :to="`/admin/products/${product.id}`">
          <Pencil class="w-3.5 h-3.5 mr-1.5" />
          Edit
        </NuxtLink>
      </Button>
      <Button variant="outline" size="sm" @click="$emit('duplicate')">
        <Copy class="w-3.5 h-3.5" />
      </Button>
      <AdminDeleteButton
        :entity-name="product.name"
        entity-type="Product"
        :disabled="!deleteProtection.canDelete"
        :disabled-reason="deleteProtection.reason"
        @deleted="$emit('delete')"
      />
    </CardContent>
  </Card>
</template>
