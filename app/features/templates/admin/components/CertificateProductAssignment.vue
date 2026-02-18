<script setup lang="ts">
import { computed, ref } from 'vue'
import { useProducts } from '~/features/products/admin/composables/useProducts'
import { useCertificateTemplates } from '~/features/templates/admin/composables/useCertificateTemplates'
import { useCertificateTemplateStore } from '~/features/templates/admin/stores/certificateTemplate'
import { certificatePreviewProductId } from '~/features/templates/admin/forms/certificate-template-form'
import ProductPickerList from '~/features/products/admin/components/ProductPickerList.vue'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Eye } from 'lucide-vue-next'

const { products } = useProducts()
const { getTemplateById } = useCertificateTemplates()
const store = useCertificateTemplateStore()

const currentId = computed(() => store.id)
const isArchived = computed(() => store.status === 'archived')

// Effective preview product: explicit selection if still linked, otherwise first linked product
const activePreviewProductId = computed(() => {
  const explicit = certificatePreviewProductId.value
  if (explicit && linkedProducts.value.some((p) => p.id === explicit)) return explicit
  return linkedProducts.value[0]?.id
})

// Effective linked products: (currently linked - pending unlinks) + pending links
const linkedProducts = computed(() =>
  products.value.filter((p) => {
    const isCurrentlyLinked = p.certificateTemplateId === currentId.value
    if (store.pendingProductUnlinks.has(p.id)) return false
    if (store.pendingProductLinks.has(p.id)) return true
    return isCurrentlyLinked
  })
)

// Available = all products not in the effective linked list
const linkedIds = computed(() => new Set(linkedProducts.value.map((p) => p.id)))
const availableProducts = computed(() => products.value.filter((p) => !linkedIds.value.has(p.id)))

const showReassignDialog = ref(false)
const pendingAddIds = ref<string[]>([])

// Products from pending add that are already assigned to a different template
const reassignProducts = computed(() =>
  availableProducts.value.filter(
    (p) =>
      pendingAddIds.value.includes(p.id) &&
      p.certificateTemplateId &&
      p.certificateTemplateId !== currentId.value
  )
)

function handleAdd(productIds: string[]) {
  // Check if any selected products need reassignment
  const needsReassign = productIds.some((id) => {
    const p = availableProducts.value.find((prod) => prod.id === id)
    return p?.certificateTemplateId && p.certificateTemplateId !== currentId.value
  })

  if (needsReassign) {
    pendingAddIds.value = productIds
    showReassignDialog.value = true
  } else {
    commitAdd(productIds)
  }
}

function commitAdd(productIds: string[]) {
  for (const productId of productIds) {
    store.addPendingProductLink(productId)
  }
  showReassignDialog.value = false
}

function handleRemove(productId: string) {
  store.addPendingProductUnlink(productId)
  if (certificatePreviewProductId.value === productId) {
    certificatePreviewProductId.value = undefined
  }
}

function getOtherTemplateName(templateId?: string): string | undefined {
  if (!templateId || templateId === currentId.value) return undefined
  return getTemplateById(templateId)?.name
}
</script>

<template>
  <ProductPickerList
    :products="linkedProducts"
    :available="availableProducts"
    :disabled="isArchived"
    empty-label="No products linked to this template."
    all-added-label="All products are linked."
    @add="handleAdd"
    @remove="handleRemove"
  >
    <template #item-actions="{ product }">
      <Button
        variant="ghost"
        size="icon"
        class="h-7 w-7 shrink-0"
        :class="activePreviewProductId === product.id ? 'text-primary' : 'text-muted-foreground'"
        :disabled="activePreviewProductId === product.id"
        @click="certificatePreviewProductId = product.id"
      >
        <Eye class="h-3.5 w-3.5" />
      </Button>
    </template>

    <template #picker-item-extra="{ product }">
      <Badge
        v-if="getOtherTemplateName(product.certificateTemplateId)"
        variant="secondary"
        class="text-[10px] mt-0.5"
      >
        {{ getOtherTemplateName(product.certificateTemplateId) }}
      </Badge>
    </template>
  </ProductPickerList>

  <AlertDialog :open="showReassignDialog" @update:open="showReassignDialog = $event">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Reassign products?</AlertDialogTitle>
        <AlertDialogDescription>
          {{ reassignProducts.length === 1 ? 'This product is' : 'These products are' }}
          already assigned to another certificate template:
        </AlertDialogDescription>
      </AlertDialogHeader>
      <ul class="text-sm space-y-1 pl-1">
        <li v-for="p in reassignProducts" :key="p.id" class="flex items-center gap-2">
          <span class="truncate">{{ p.name }}</span>
          <Badge variant="secondary" class="text-[10px] shrink-0">
            {{ getOtherTemplateName(p.certificateTemplateId) }}
          </Badge>
        </li>
      </ul>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <Button @click="commitAdd(pendingAddIds)">Reassign</Button>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
