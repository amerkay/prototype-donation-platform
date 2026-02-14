<script setup lang="ts">
import { computed, ref } from 'vue'
import { useProducts } from '~/features/products/admin/composables/useProducts'
import { useCertificateTemplates } from '~/features/templates/admin/composables/useCertificateTemplates'
import { useCertificateTemplateStore } from '~/features/templates/admin/stores/certificateTemplate'
import { certificatePreviewProductId } from '~/features/templates/admin/forms/certificate-template-form'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Package, Plus, X, Eye } from 'lucide-vue-next'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

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

const showPopover = ref(false)

function linkProduct(productId: string) {
  store.addPendingProductLink(productId)
  showPopover.value = false
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
          :class="certificatePreviewProductId === product.id ? 'text-primary' : 'text-muted-foreground'"
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

    <Popover v-model:open="showPopover">
      <PopoverTrigger as-child>
        <Button variant="outline" size="sm">
          <Plus class="w-3.5 h-3.5 mr-1.5" />
          Add Product
        </Button>
      </PopoverTrigger>
      <PopoverContent class="w-72 p-2" align="start">
        <div v-if="availableProducts.length" class="space-y-1 max-h-52 overflow-y-auto">
          <button
            v-for="product in availableProducts"
            :key="product.id"
            type="button"
            class="w-full flex items-center gap-2.5 p-2 rounded-md hover:bg-muted/50 transition-colors text-left"
            @click="linkProduct(product.id)"
          >
            <img
              v-if="product.image"
              :src="product.image"
              :alt="product.name"
              class="w-7 h-7 rounded object-cover shrink-0"
            />
            <div v-else class="w-7 h-7 rounded bg-muted flex items-center justify-center shrink-0">
              <Package class="size-3.5 text-muted-foreground" />
            </div>
            <div class="min-w-0 flex-1">
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
        <p v-else class="text-sm text-muted-foreground p-2 text-center">All products are linked.</p>
      </PopoverContent>
    </Popover>
  </div>
</template>
