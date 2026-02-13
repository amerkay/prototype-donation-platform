<script setup lang="ts">
import { ref, computed } from 'vue'
import AdminEditLayout from '~/features/_admin/components/AdminEditLayout.vue'
import CertificateTemplateConfig from '~/features/templates/admin/components/CertificateTemplateConfig.vue'
import CertificatePreview from '~/features/templates/admin/components/CertificatePreview.vue'
import BaseDialogOrDrawer from '~/components/BaseDialogOrDrawer.vue'
import { useCertificateTemplateStore } from '~/features/templates/admin/stores/certificateTemplate'
import { useCurrencySettingsStore } from '~/features/settings/admin/stores/currencySettings'
import { useProducts } from '~/features/products/admin/composables/useProducts'
import { useAdminEdit } from '~/features/_admin/composables/useAdminEdit'
import { useGeneratePdf } from '~/features/templates/admin/composables/useGeneratePdf'
import { Button } from '@/components/ui/button'
import { Download, Loader2, ImageIcon } from 'lucide-vue-next'
import type { Product } from '~/features/donation-form/features/product/shared/types'

definePageMeta({ layout: 'admin' })

const store = useCertificateTemplateStore()
const currencyStore = useCurrencySettingsStore()
const { products } = useProducts()

const previewCurrency = ref(currencyStore.defaultCurrency)
const previewProductId = ref<string | undefined>(undefined)
const showProductSelector = ref(false)

const previewProduct = computed(() =>
  previewProductId.value ? products.value.find((p) => p.id === previewProductId.value) : undefined
)

function selectProduct(product: Product) {
  previewProductId.value = product.id
  showProductSelector.value = false
}

const originalData = computed(() => ({
  certificate: {
    page: { ...store.certificate.page },
    logo: { ...store.certificate.logo },
    title: { ...store.certificate.title },
    award: { ...store.certificate.award },
    body: { ...store.certificate.body },
    product: { ...store.certificate.product },
    footer: { ...store.certificate.footer }
  }
}))

const formConfigRef = ref()

const { handleSave, handleDiscard, confirmDiscard, showDiscardDialog } = useAdminEdit({
  store,
  formRef: formConfigRef,
  originalData,
  onSave: async () => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    store.save()
  }
})

const { isGenerating, downloadPdf } = useGeneratePdf()

const breadcrumbs = [
  { label: 'Dashboard', href: '/admin/dashboard' },
  { label: 'Templates', href: '#' },
  { label: 'Certificates' }
]
</script>

<template>
  <div>
    <AdminEditLayout
      :breadcrumbs="breadcrumbs"
      :is-dirty="store.isDirty"
      :show-discard-dialog="showDiscardDialog"
      :show-preview="false"
      @update:show-discard-dialog="showDiscardDialog = $event"
      @confirm-discard="confirmDiscard"
    >
      <template #content>
        <div class="space-y-6">
          <CertificateTemplateConfig
            ref="formConfigRef"
            @save="handleSave"
            @discard="handleDiscard"
          />
        </div>
      </template>

      <template #preview-actions>
        <Button variant="outline" size="sm" @click="showProductSelector = true">
          <ImageIcon class="w-4 h-4 mr-2" />
          Product
        </Button>
        <Button
          variant="outline"
          size="sm"
          :disabled="isGenerating"
          @click="
            downloadPdf('certificate', { currency: previewCurrency, product: previewProduct })
          "
        >
          <Loader2 v-if="isGenerating" class="w-4 h-4 mr-2 animate-spin" />
          <Download v-else class="w-4 h-4 mr-2" />
          PDF
        </Button>
      </template>

      <template #preview>
        <CertificatePreview :currency="previewCurrency" :product="previewProduct" editable />
      </template>
    </AdminEditLayout>

    <BaseDialogOrDrawer
      :open="showProductSelector"
      description="Select which product to display in the preview"
      max-width="sm:max-w-md"
      @update:open="showProductSelector = $event"
    >
      <template #header>Choose Preview Product</template>
      <template #content>
        <div class="space-y-2">
          <button
            v-for="product in products"
            :key="product.id"
            type="button"
            class="w-full flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors text-left overflow-hidden"
            :class="{ 'ring-2 ring-primary': previewProduct?.id === product.id }"
            @click="selectProduct(product)"
          >
            <img
              v-if="product.image"
              :src="product.image"
              :alt="product.name"
              class="w-12 h-12 rounded-md object-cover shrink-0"
            />
            <div
              v-else
              class="w-12 h-12 rounded-md bg-muted flex items-center justify-center shrink-0"
            >
              <ImageIcon class="w-6 h-6 text-muted-foreground" />
            </div>
            <div class="w-0 flex-1">
              <p class="font-medium truncate">
                {{ product.certificateOverrideName || product.name }}
              </p>
              <p class="text-sm text-muted-foreground truncate">{{ product.name }}</p>
            </div>
          </button>
        </div>
      </template>
    </BaseDialogOrDrawer>
  </div>
</template>
