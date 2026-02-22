<script setup lang="ts">
import type { ImpactProduct } from '~/features/products/admin/types'
import { useProducts } from '~/features/products/admin/composables/useProducts'
import { useCertificateTemplates } from '~/features/templates/admin/composables/useCertificateTemplates'
import AdminEntityCard from '~/features/_admin/components/AdminEntityCard.vue'
import AdminEntityCardPlaceholder from '~/features/_admin/components/AdminEntityCardPlaceholder.vue'
import AdminDeleteButton from '~/features/_admin/components/AdminDeleteButton.vue'
import StatusBadge from '~/components/StatusBadge.vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Copy, Package, Pencil, Award } from 'lucide-vue-next'

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
const href = computed(() => `/admin/products/${props.product.id}`)

const priceDisplay = computed(() => {
  const p = props.product
  if (p.price) return `$${p.price}`
  if (p.minPrice && p.default) return `$${p.minPrice}-$${p.default}`
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
  <AdminEntityCard :title="product.name" :href="href" :updated-at="product.updatedAt">
    <template #image>
      <img
        v-if="product.image"
        :src="product.image"
        :alt="product.name"
        class="w-full h-full object-cover"
      />
      <AdminEntityCardPlaceholder v-else :icon="Package" />
    </template>

    <template #badges>
      <Badge variant="outline" class="text-[10px] px-1.5 py-0">
        {{ FREQUENCY_LABELS[product.frequency] }}
      </Badge>
      <Badge variant="secondary" class="text-[10px] px-1.5 py-0">
        {{ priceDisplay }}
      </Badge>
      <StatusBadge :status="product.status" class="text-[10px] px-1.5 py-0" />
      <p v-if="certificateName" class="flex items-center gap-1 text-xs text-muted-foreground">
        <Award class="w-3 h-3" />
        {{ certificateName }}
      </p>
    </template>

    <template #actions>
      <div class="flex gap-2">
        <Button variant="default" size="sm" class="flex-1" as-child>
          <NuxtLink :to="href">
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
      </div>
    </template>
  </AdminEntityCard>
</template>
