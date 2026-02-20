import { defineStore } from 'pinia'
import { reactive, ref, toRefs } from 'vue'
import type { ImpactProduct } from '~/features/products/admin/types'
import { useEditableState } from '~/features/_admin/composables/defineEditableStore'
import { useProducts } from '~/features/products/admin/composables/useProducts'

interface ProductSettings {
  description: string
  image: string | null
  frequency: 'once' | 'monthly' | 'yearly'
  price: number | undefined
  minPrice: number | undefined
  default: number | undefined
  isShippingRequired: boolean
  certificateTemplateId: string | undefined
  certificateTitle: string | undefined
  certificateText: string | undefined
}

const DEFAULTS: ProductSettings = {
  description: '',
  image: null,
  frequency: 'once',
  price: undefined,
  minPrice: undefined,
  default: undefined,
  isShippingRequired: false,
  certificateTemplateId: undefined,
  certificateTitle: undefined,
  certificateText: undefined
}

export const useProductStore = defineStore('product', () => {
  const { isDirty, isSaving, markDirty, markClean } = useEditableState()
  const settings = reactive<ProductSettings>({ ...DEFAULTS })
  const productId = ref<string | undefined>(undefined)
  const productName = ref('')
  const productTitle = ref('')
  const productStatus = ref<'active' | 'archived'>('active')

  function initialize(product: ImpactProduct) {
    productId.value = product.id
    productName.value = product.name
    productTitle.value = product.title
    productStatus.value = product.status ?? 'active'

    settings.description = product.description
    settings.image = product.image
    settings.frequency = product.frequency
    settings.price = product.price
    settings.minPrice = product.minPrice
    settings.default = product.default
    settings.isShippingRequired = product.isShippingRequired ?? false
    settings.certificateTemplateId = product.certificateTemplateId
    settings.certificateTitle = product.certificateTitle
    settings.certificateText = product.certificateText
    markClean()
  }

  function toSnapshot() {
    return {
      name: productName.value,
      title: productTitle.value,
      status: productStatus.value,
      ...settings
    }
  }

  function save() {
    if (!productId.value) return
    const { updateProduct } = useProducts()
    updateProduct(productId.value, toSnapshot())
  }

  return {
    ...toRefs(settings),
    id: productId,
    name: productName,
    title: productTitle,
    status: productStatus,
    isDirty,
    isSaving,
    initialize,
    markDirty,
    markClean,
    toSnapshot,
    save
  }
})
