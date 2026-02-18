<script setup lang="ts">
import { ref, computed } from 'vue'
import { Package, Plus, X } from 'lucide-vue-next'
import BaseDialogOrDrawer from '~/components/BaseDialogOrDrawer.vue'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import type { Product } from '~/features/donation-form/features/product/shared/types'

interface Props {
  /** Currently selected/linked products */
  products: Product[]
  /** Products available to add */
  available: Product[]
  disabled?: boolean
  addLabel?: string
  emptyLabel?: string
  allAddedLabel?: string
}

withDefaults(defineProps<Props>(), {
  addLabel: 'Add Product',
  emptyLabel: 'No products linked.',
  allAddedLabel: 'All products are already added.'
})

const emit = defineEmits<{
  add: [productIds: string[]]
  remove: [productId: string]
}>()

defineSlots<{
  'item-actions'?: (props: { product: Product }) => void
  'item-below'?: (props: { product: Product }) => void
  'picker-item-extra'?: (props: { product: Product }) => void
}>()

const showDialog = ref(false)
const selected = ref<Set<string>>(new Set())

function openDialog() {
  selected.value = new Set()
  showDialog.value = true
}

function toggleProduct(productId: string) {
  const next = new Set(selected.value)
  if (next.has(productId)) {
    next.delete(productId)
  } else {
    next.add(productId)
  }
  selected.value = next
}

const selectedCount = computed(() => selected.value.size)

function confirmSelection() {
  emit('add', Array.from(selected.value))
  showDialog.value = false
}
</script>

<template>
  <div class="space-y-3">
    <div v-if="products.length" class="space-y-1.5">
      <div
        v-for="product in products"
        :key="product.id"
        class="px-2 py-1.5 rounded-lg border bg-background"
      >
        <div class="flex items-center gap-3">
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
          <slot name="item-actions" :product="product" />
          <Button
            variant="ghost"
            size="icon"
            class="h-7 w-7 shrink-0"
            :disabled="disabled"
            @click="emit('remove', product.id)"
          >
            <X class="h-3.5 w-3.5" />
          </Button>
        </div>
        <slot name="item-below" :product="product" />
      </div>
    </div>

    <p v-else class="text-sm text-muted-foreground">{{ emptyLabel }}</p>

    <Button variant="outline" size="sm" :disabled="disabled" @click="openDialog">
      <Plus class="w-3.5 h-3.5 mr-1.5" />
      {{ addLabel }}
    </Button>

    <BaseDialogOrDrawer
      :open="showDialog"
      description="Select products to add."
      size="md"
      @update:open="showDialog = $event"
    >
      <template #header>{{ addLabel }}</template>
      <template #content>
        <div v-if="available.length" class="space-y-1 py-2">
          <button
            v-for="product in available"
            :key="product.id"
            type="button"
            class="w-full flex items-center gap-2.5 p-2 rounded-md hover:bg-muted/50 transition-colors text-left"
            @click="toggleProduct(product.id)"
          >
            <Checkbox :model-value="selected.has(product.id)" />
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
              <slot name="picker-item-extra" :product="product" />
            </div>
          </button>
        </div>
        <p v-else class="text-sm text-muted-foreground py-4 text-center">
          {{ allAddedLabel }}
        </p>
      </template>
      <template #footer>
        <Button variant="outline" @click="showDialog = false">Cancel</Button>
        <Button :disabled="!selectedCount" @click="confirmSelection">
          Add {{ selectedCount || '' }} Product{{ selectedCount !== 1 ? 's' : '' }}
        </Button>
      </template>
    </BaseDialogOrDrawer>
  </div>
</template>
