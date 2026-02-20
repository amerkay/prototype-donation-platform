import { computed } from 'vue'
import { toast } from 'vue-sonner'
import type { ImpactProduct } from '~/features/products/admin/types'
import type { Product } from '~/features/donation-form/features/product/shared/types'
import type { DeleteProtection } from '~/features/_admin/composables/useAdminEdit'
import {
  products as donationProducts,
  stallBookingProducts,
  dogShowProducts,
  classicCarProducts
} from '~/sample-api-responses/api-sample-response-products'
import { useSessionStorageSingleton } from '~/features/_admin/composables/useSessionStorageSingleton'
import { generateEntityId } from '~/lib/generateEntityId'

/**
 * Composable for admin impact product management.
 * Singleton pattern with sessionStorage persistence.
 */

const allMockProducts = [
  ...donationProducts,
  ...stallBookingProducts,
  ...dogShowProducts,
  ...classicCarProducts
]

function createImpactProduct(
  base: (typeof allMockProducts)[0],
  linkedFormsCount = 0
): ImpactProduct {
  return {
    ...base,
    status: 'active',
    createdAt: '2025-09-01T00:00:00Z',
    updatedAt: '2026-01-15T00:00:00Z',
    linkedFormsCount
  }
}

const defaultProducts = allMockProducts.map((p) =>
  createImpactProduct(p, p.id === 'adopt-bumi' ? 2 : 1)
)

const {
  items: products,
  $persist,
  ensureHydrated
} = useSessionStorageSingleton<ImpactProduct>('impact-products', defaultProducts)

export function useProducts() {
  ensureHydrated()

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

  function getProductById(id: string): ImpactProduct | undefined {
    return products.value.find((p) => p.id === id)
  }

  function createProduct(data: Partial<ImpactProduct>): string {
    const id = generateEntityId('product')
    const now = new Date().toISOString()

    const newProduct: ImpactProduct = {
      id,
      name: data.name ?? 'New Product',
      title: data.title ?? '',
      description: data.description ?? '',
      frequency: data.frequency ?? 'once',
      price: data.price,
      minPrice: data.minPrice,
      default: data.default,
      image: data.image ?? null,
      certificateTitle: data.certificateTitle,
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

  function duplicateProduct(id: string): string | undefined {
    const source = getProductById(id)
    if (!source) return undefined

    const newId = generateEntityId('product')
    const now = new Date().toISOString()

    const duplicate: ImpactProduct = {
      ...source,
      id: newId,
      name: `${source.name} (Copy)`,
      status: 'active',
      createdAt: now,
      updatedAt: now,
      linkedFormsCount: 0
    }

    products.value.push(duplicate)
    $persist()
    toast.success('Product duplicated')
    return newId
  }

  function updateProduct(id: string, updates: Partial<ImpactProduct>): void {
    const now = new Date().toISOString()
    products.value = products.value.map((p) =>
      p.id === id ? { ...p, ...updates, updatedAt: now } : p
    )
    $persist()
  }

  function getDeleteProtection(id: string): DeleteProtection {
    const product = getProductById(id)
    if (!product) return { canDelete: false, reason: 'Product not found' }
    const n = product.linkedFormsCount ?? 0
    if (n > 0) {
      return { canDelete: false, reason: `Linked to ${n} form${n !== 1 ? 's' : ''} — unlink first` }
    }
    return { canDelete: true }
  }

  function updateProductName(id: string, name: string): void {
    updateProduct(id, { name })
    toast.success('Product name updated')
  }

  function updateProductStatus(id: string, status: ImpactProduct['status']): void {
    updateProduct(id, { status })
    toast.success('Product status updated')
  }

  function deleteProduct(id: string): void {
    const index = products.value.findIndex((p) => p.id === id)
    if (index === -1) return

    products.value.splice(index, 1)
    $persist()
    toast.success('Product deleted')
  }

  /**
   * Find-or-create products by name from blueprint definitions.
   * Used when seeding products from form templates.
   * Returns resolved ImpactProduct[] with real org-level IDs.
   */
  function seedProducts(blueprints: Product[]): ImpactProduct[] {
    const created: string[] = []
    const resolved = blueprints.map((bp) => {
      const existing = products.value.find((p) => p.name === bp.name)
      if (existing) return existing
      const id = generateEntityId('product')
      const now = new Date().toISOString()
      const newProduct: ImpactProduct = {
        ...bp,
        id,
        status: 'active',
        createdAt: now,
        updatedAt: now,
        linkedFormsCount: 0
      }
      products.value.push(newProduct)
      created.push(bp.name)
      return newProduct
    })
    if (created.length) {
      $persist()
      toast.success(`${created.length} product${created.length > 1 ? 's' : ''} added to catalog`)
    }
    return resolved
  }

  return {
    products: computed(() => products.value),
    activeProducts,
    stats,
    getProductById,
    createProduct,
    duplicateProduct,
    updateProduct,
    updateProductName,
    updateProductStatus,
    deleteProduct,
    getDeleteProtection,
    seedProducts
  }
}
