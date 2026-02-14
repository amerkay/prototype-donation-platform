<script setup lang="ts">
import { computed, ref } from 'vue'
import { useProducts } from '~/features/products/admin/composables/useProducts'
import { useCertificateTemplates } from '~/features/templates/admin/composables/useCertificateTemplates'
import { useCertificateTemplateStore } from '~/features/templates/admin/stores/certificateTemplate'
import { certificatePreviewProductId } from '~/features/templates/admin/forms/certificate-template-form'
import BaseDialogOrDrawer from '~/components/BaseDialogOrDrawer.vue'
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
import { Checkbox } from '@/components/ui/checkbox'
import { Package, Plus, X, Eye } from 'lucide-vue-next'

const { products } = useProducts()
const { getTemplateById } = useCertificateTemplates()
const store = useCertificateTemplateStore()

const currentId = computed(() => store.id)

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

const showProductDialog = ref(false)
const showReassignDialog = ref(false)
const selectedProducts = ref<Set<string>>(new Set())

// Selected products that are already assigned to a different template
const reassignProducts = computed(() =>
  availableProducts.value.filter(
    (p) =>
      selectedProducts.value.has(p.id) &&
      p.certificateTemplateId &&
      p.certificateTemplateId !== currentId.value
  )
)

function openProductDialog() {
  selectedProducts.value = new Set()
  showProductDialog.value = true
}

function toggleProduct(productId: string) {
  const next = new Set(selectedProducts.value)
  if (next.has(productId)) {
    next.delete(productId)
  } else {
    next.add(productId)
  }
  selectedProducts.value = next
}

function commitSelection() {
  for (const productId of selectedProducts.value) {
    store.addPendingProductLink(productId)
  }
  showReassignDialog.value = false
  showProductDialog.value = false
}

function confirmSelection() {
  if (reassignProducts.value.length > 0) {
    showReassignDialog.value = true
  } else {
    commitSelection()
  }
}

function unlinkProduct(productId: string) {
  store.addPendingProductUnlink(productId)
}

function getOtherTemplateName(templateId?: string): string | undefined {
  if (!templateId || templateId === currentId.value) return undefined
  return getTemplateById(templateId)?.name
}
</script>

<template>
  <div class="space-y-3">
    <div v-if="linkedProducts.length" class="space-y-2">
      <div
        v-for="product in linkedProducts"
        :key="product.id"
        class="flex items-center gap-3 p-2.5 rounded-lg border bg-background"
      >
        <img
          v-if="product.image"
          :src="product.image"
          :alt="product.name"
          class="w-8 h-8 rounded-md object-cover shrink-0"
        />
        <div v-else class="w-8 h-8 rounded-md bg-muted flex items-center justify-center shrink-0">
          <Package class="size-4 text-muted-foreground" />
        </div>
        <span class="text-sm font-medium truncate flex-1">{{ product.name }}</span>
        <Button
          variant="ghost"
          size="icon"
          class="h-7 w-7 shrink-0"
          :class="
            certificatePreviewProductId === product.id ? 'text-primary' : 'text-muted-foreground'
          "
          @click="certificatePreviewProductId = product.id"
        >
          <Eye class="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          class="h-7 w-7 shrink-0"
          @click="unlinkProduct(product.id)"
        >
          <X class="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>

    <p v-else class="text-sm text-muted-foreground">No products linked to this template.</p>

    <Button variant="outline" size="sm" @click="openProductDialog">
      <Plus class="w-3.5 h-3.5 mr-1.5" />
      Add Product
    </Button>

    <BaseDialogOrDrawer
      :open="showProductDialog"
      description="Select products to link to this certificate template."
      max-width="sm:max-w-lg"
      @update:open="showProductDialog = $event"
    >
      <template #header>Add Products</template>
      <template #content>
        <div v-if="availableProducts.length" class="space-y-1 py-2">
          <button
            v-for="product in availableProducts"
            :key="product.id"
            type="button"
            class="w-full flex items-center gap-2.5 p-2 rounded-md hover:bg-muted/50 transition-colors text-left"
            @click="toggleProduct(product.id)"
          >
            <Checkbox :model-value="selectedProducts.has(product.id)" />
            <img
              v-if="product.image"
              :src="product.image"
              :alt="product.name"
              class="w-7 h-7 rounded object-cover shrink-0"
            />
            <div v-else class="w-7 h-7 rounded bg-muted flex items-center justify-center shrink-0">
              <Package class="size-3.5 text-muted-foreground" />
            </div>
            <div class="min-w-0 flex-1 overflow-hidden">
              <p class="text-sm truncate">{{ product.name }}</p>
              <Badge
                v-if="getOtherTemplateName(product.certificateTemplateId)"
                variant="secondary"
                class="text-[10px] mt-0.5"
              >
                {{ getOtherTemplateName(product.certificateTemplateId) }}
              </Badge>
            </div>
          </button>
        </div>
        <p v-else class="text-sm text-muted-foreground py-4 text-center">
          All products are linked.
        </p>
      </template>
      <template #footer>
        <Button variant="outline" @click="showProductDialog = false">Cancel</Button>
        <Button :disabled="!selectedProducts.size" @click="confirmSelection">
          Add {{ selectedProducts.size || '' }} Product{{ selectedProducts.size !== 1 ? 's' : '' }}
        </Button>
      </template>
    </BaseDialogOrDrawer>

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
          <Button @click="commitSelection">Reassign</Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>
