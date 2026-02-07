import { ref, computed } from 'vue'
import { toast } from 'vue-sonner'
import type { ImpactProduct } from '~/features/products/admin/types'
import { products as mockProducts } from '~/sample-api-responses/api-sample-response-products'

/**
 * Composable for admin impact product management.
 * Singleton pattern with sessionStorage persistence.
 */

const products = ref<ImpactProduct[]>([])
let hydrated = false

function createImpactProduct(base: (typeof mockProducts)[0], linkedFormsCount = 0): ImpactProduct {
  return {
    ...base,
    status: 'active',
    createdAt: '2025-09-01T00:00:00Z',
    updatedAt: '2026-01-15T00:00:00Z',
    linkedFormsCount
  }
}

function $hydrate(): void {
  if (hydrated) return
  if (!import.meta.client) return

  try {
    const saved = sessionStorage.getItem('impact-products')
    if (saved) {
      products.value = JSON.parse(saved)
    } else {
      products.value = mockProducts.map((p) =>
        createImpactProduct(p, p.id === 'adopt-bumi' ? 2 : 1)
      )
    }
    hydrated = true
  } catch {
    products.value = mockProducts.map((p) => createImpactProduct(p, 1))
    hydrated = true
  }
}

function $persist(): void {
  if (!import.meta.client) return
  try {
    sessionStorage.setItem('impact-products', JSON.stringify(products.value))
  } catch {
    /* ignore */
  }
}

export function useProducts() {
  if (!hydrated) $hydrate()

  const activeProducts = computed(() => products.value.filter((p) => p.status === 'active'))

  const stats = computed(() => [
    { value: products.value.length, label: 'products' },
    { value: activeProducts.value.length, label: 'active' },
    {
      value: products.value.filter((p) => p.frequency === 'monthly').length,
      label: 'recurring'
    },
    {
      value: products.value.filter((p) => p.frequency === 'once').length,
      label: 'one-time'
    }
  ])

  const createProduct = (data: Partial<ImpactProduct>): string => {
    const id = `product-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    const now = new Date().toISOString()

    const newProduct: ImpactProduct = {
      id,
      name: data.name ?? 'New Product',
      description: data.description ?? '',
      frequency: data.frequency ?? 'once',
      price: data.price,
      minPrice: data.minPrice,
      default: data.default,
      image: data.image ?? data.icon ?? '📦',
      thumbnail: data.thumbnail ?? data.icon ?? '📦',
      icon: data.icon ?? '📦',
      status: 'active',
      createdAt: now,
      updatedAt: now,
      linkedFormsCount: 0
    }

    products.value.push(newProduct)
    $persist()
    toast.success('Product created')
    return id
  }

  const updateProduct = (id: string, updates: Partial<ImpactProduct>): void => {
    const now = new Date().toISOString()
    products.value = products.value.map((p) =>
      p.id === id ? { ...p, ...updates, updatedAt: now } : p
    )
    $persist()
  }

  const deleteProduct = (id: string): void => {
    const index = products.value.findIndex((p) => p.id === id)
    if (index === -1) return

    products.value.splice(index, 1)
    $persist()
    toast.success('Product deleted')
  }

  return {
    products: computed(() => products.value),
    activeProducts,
    stats,
    createProduct,
    updateProduct,
    deleteProduct
  }
}
