<script setup lang="ts">
import { ref, computed } from 'vue'
import { Button } from '@/components/ui/button'
import BaseDialogOrDrawer from '~/components/donation-form/common/BaseDialogOrDrawer.vue'
import ProductOptionsModal from '~/components/donation-form/product/ProductOptionsModal.vue'
import ProductTributeForm from '~/components/donation-form/tribute/ProductTributeForm.vue'
import ProductCard from '~/components/donation-form/product/ProductCard.vue'
import type { Product, TributeData } from '@/lib/common/types'

interface Props {
  currency: string
  currentFrequency: string
  products: Product[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  amountsConfig: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  config: any
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'adoption-select': [product: Product]
  'tribute-save': [tributeData: TributeData | undefined]
  'product-modal-confirm': [
    product: Product,
    price: number,
    quantity: number,
    mode: 'add' | 'edit',
    itemKey?: string,
    tribute?: TributeData
  ]
}>()

// Refs
const productOptionsModalRef = ref<InstanceType<typeof ProductOptionsModal> | null>(null)
const tributeFormRef = ref<InstanceType<typeof ProductTributeForm> | null>(null)
const adoptionDialogOpen = ref(false)
const tributeDialogOpen = ref(false)
const tempTributeData = ref<TributeData | undefined>(undefined)

// Computed
const adoptionProducts = computed(() => {
  return props.products.filter((p) => !p.isBonusItem && p.frequency === props.currentFrequency)
})

const isTributeFormValid = computed(() => {
  if (!tributeFormRef.value) return true
  return tributeFormRef.value.isValid
})

const adoptionModalTitle = computed(() => props.config.adoptionFeature.modalTitle)

const adoptionModalDescription = computed(() =>
  props.config.adoptionFeature.modalDescription.replace('{frequency}', props.currentFrequency)
)

const adoptionNoProductsMessage = computed(() =>
  props.config.adoptionFeature.noProductsMessage.replace('{frequency}', props.currentFrequency)
)

// Methods
const handleAdoptProductSelect = (product: Product) => {
  emit('adoption-select', product)
  adoptionDialogOpen.value = false
}

const handleTributeSave = () => {
  emit('tribute-save', tempTributeData.value)
  tributeDialogOpen.value = false
}

const handleTributeCancel = () => {
  tempTributeData.value = undefined
  tributeDialogOpen.value = false
}

const handleProductModalConfirm = (
  product: Product,
  price: number,
  quantity: number,
  mode: 'add' | 'edit',
  itemKey?: string,
  tribute?: TributeData
) => {
  emit('product-modal-confirm', product, price, quantity, mode, itemKey, tribute)
}

// Expose methods for parent to open modals
defineExpose({
  openAdoptionModal: () => {
    adoptionDialogOpen.value = true
  },
  openTributeModal: (currentTributeData?: TributeData) => {
    tempTributeData.value = currentTributeData
      ? JSON.parse(JSON.stringify(currentTributeData))
      : undefined
    tributeDialogOpen.value = true
  },
  openProductModalForAdd: (product: Product, price: number) => {
    productOptionsModalRef.value?.openForAdd(product, price)
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  openProductModalForEdit: (item: any, itemKey: string) => {
    productOptionsModalRef.value?.openForEdit(item, itemKey)
  }
})
</script>

<template>
  <!-- Adoption Selection Modal -->
  <BaseDialogOrDrawer v-model:open="adoptionDialogOpen" :dismissible="true">
    <template #header>
      <h2 class="text-2xl font-semibold">{{ adoptionModalTitle }}</h2>
      <p class="text-sm text-muted-foreground">
        {{ adoptionModalDescription }}
      </p>
    </template>
    <template #content>
      <div class="space-y-2 max-h-96 overflow-y-auto">
        <ProductCard
          v-for="product in adoptionProducts"
          :key="product.id"
          :product="product"
          :currency="currency"
          @click="handleAdoptProductSelect(product)"
        />
        <div v-if="adoptionProducts.length === 0" class="py-12 text-center text-muted-foreground">
          {{ adoptionNoProductsMessage }}
        </div>
      </div>
    </template>
  </BaseDialogOrDrawer>

  <!-- Tribute Form Modal (Gift or In Memory) -->
  <BaseDialogOrDrawer v-model:open="tributeDialogOpen" :dismissible="true">
    <template #header>
      <h2 class="text-2xl font-semibold">Gift or In Memory</h2>
      <p class="text-sm text-muted-foreground">
        Make this donation in honor or memory of someone special
      </p>
    </template>
    <template #content>
      <ProductTributeForm
        ref="tributeFormRef"
        v-model="tempTributeData"
        @submit="handleTributeSave"
      />
    </template>
    <template #footer>
      <Button
        class="flex-1 md:flex-1 h-12"
        :disabled="!isTributeFormValid"
        @click="handleTributeSave"
      >
        Save
      </Button>
      <Button variant="outline" class="flex-1 md:flex-1 h-12" @click="handleTributeCancel">
        Cancel
      </Button>
    </template>
  </BaseDialogOrDrawer>

  <!-- Product Configuration Modal (Dialog on desktop, Drawer on mobile) -->
  <ProductOptionsModal
    ref="productOptionsModalRef"
    :currency="currency"
    :amounts-config="amountsConfig"
    @confirm="handleProductModalConfirm"
  />
</template>
