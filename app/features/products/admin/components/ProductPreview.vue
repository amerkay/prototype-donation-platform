<script setup lang="ts">
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowRight } from 'lucide-vue-next'
import { useProductStore } from '~/features/products/admin/stores/product'
import { useCurrencySettingsStore } from '~/features/settings/admin/stores/currencySettings'
import { useCertificateTemplates } from '~/features/templates/admin/composables/useCertificateTemplates'
import { useCertificateTemplateStore } from '~/features/templates/admin/stores/certificateTemplate'
import DonorProductCard from '~/features/donation-form/features/product/donor/components/ProductCard.vue'
import CertificatePreview from '~/features/templates/admin/components/CertificatePreview.vue'
import ProductOptionsContent from '~/features/donation-form/features/product/shared/components/ProductOptionsContent.vue'
import PreviewEditable from '~/features/_admin/components/PreviewEditable.vue'
import { CERTIFICATE_TEMPLATE_TARGETS } from '~/features/templates/admin/forms/certificate-template-form'
import { productOpenAccordionId } from '~/features/products/admin/forms/product-form'
import type { CertificateTemplateTargets } from '~/features/templates/shared/types'
import type { Product } from '~/features/donation-form/features/product/shared/types'

withDefaults(defineProps<{ editable?: boolean }>(), { editable: false })

/** On the product page, product sub-elements target product form fields */
const PRODUCT_CERT_TARGETS: CertificateTemplateTargets = {
  ...CERTIFICATE_TEMPLATE_TARGETS,
  productImage: 'basic.image',
  productTitle: 'certificateSettings.certificateTitle',
  productText: 'certificateSettings.certificateText'
}

const store = useProductStore()
const currencyStore = useCurrencySettingsStore()
const { getTemplateById } = useCertificateTemplates()
const certStore = useCertificateTemplateStore()

const activeTab = ref('card')

const previewProduct = computed<Product>(() => ({
  id: store.id ?? '',
  name: store.name || 'Untitled Product',
  title: store.title || store.name || 'Untitled Product',
  description: store.description,
  frequency: store.frequency,
  price: store.price,
  minPrice: store.minPrice,
  default: store.default,
  image: store.image,
  isShippingRequired: store.isShippingRequired,
  certificateTemplateId: store.certificateTemplateId,
  certificateTitle: store.certificateTitle,
  certificateText: store.certificateText
}))

const STATIC_TABS = [
  { value: 'card', label: 'Card' },
  { value: 'donation', label: 'Donation' }
] as const

const tabs = computed(() => {
  if (!store.certificateTemplateId) return STATIC_TABS
  return [
    ...STATIC_TABS,
    {
      value: 'certificate',
      label: 'Certificate',
      link: `/admin/templates/certificates/${store.certificateTemplateId}`,
      linkLabel: 'Edit Certificate'
    }
  ]
})

// Hydrate certificate store when template is linked
watch(
  () => store.certificateTemplateId,
  (templateId) => {
    if (!templateId) return
    const template = getTemplateById(templateId)
    if (template) certStore.initialize(template)
  },
  { immediate: true }
)

// Reset to card tab when certificate is unlinked
watch(
  () => store.certificateTemplateId,
  (id) => {
    if (!id && activeTab.value === 'certificate') {
      activeTab.value = 'card'
    }
  }
)

// Sync preview tab with open accordion section
watch(productOpenAccordionId, (id) => {
  if (id === 'product.basic') activeTab.value = 'card'
  else if (id === 'product.pricing') activeTab.value = 'donation'
  else if (id === 'product.certificateSettings' && store.certificateTemplateId)
    activeTab.value = 'certificate'
})
</script>

<template>
  <PreviewEditable :enabled="editable">
    <div class="space-y-3">
      <Tabs v-model="activeTab">
        <TabsList class="w-full overflow-x-auto" data-preview-nav>
          <TabsTrigger v-for="tab in tabs" :key="tab.value" :value="tab.value" class="text-xs">
            {{ tab.label }}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="card">
          <DonorProductCard
            :product="previewProduct"
            :currency="currencyStore.defaultCurrency"
            icon="lucide:plus"
            data-field="basic"
          />
        </TabsContent>

        <TabsContent value="donation">
          <div class="rounded-xl border bg-card p-4">
            <ProductOptionsContent
              :product="previewProduct"
              :currency="currencyStore.defaultCurrency"
            />
          </div>
        </TabsContent>

        <TabsContent v-if="store.certificateTemplateId" value="certificate">
          <CertificatePreview
            :product="previewProduct"
            :targets="PRODUCT_CERT_TARGETS"
            :editable="editable"
          />
          <div class="flex justify-end text-xs text-muted-foreground px-1 mt-3">
            <NuxtLink
              :to="`/admin/templates/certificates/${store.certificateTemplateId}`"
              class="flex items-center gap-1 text-primary hover:underline"
            >
              Edit Certificate
              <ArrowRight class="size-3" />
            </NuxtLink>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  </PreviewEditable>
</template>
