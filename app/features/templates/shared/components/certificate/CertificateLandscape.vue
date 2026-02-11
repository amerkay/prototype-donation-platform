<script setup lang="ts">
import type { CertificateModel } from '~/features/templates/shared/types'
import { useCertificateColors } from '~/features/templates/shared/composables/useCertificateColors'
import CertBackground from './sections/CertBackground.vue'
import CertLogo from './sections/CertLogo.vue'
import CertTitle from './sections/CertTitle.vue'
import CertSubtitle from './sections/CertSubtitle.vue'
import CertDonorName from './sections/CertDonorName.vue'
import CertProduct from './sections/CertProduct.vue'
import CertBody from './sections/CertBody.vue'
import CertBottomRow from './sections/CertBottomRow.vue'

const props = defineProps<{
  model: CertificateModel
  thickness: { borderPx: number; productPx: number; separatorPx: string }
}>()

const colors = computed(() =>
  useCertificateColors(props.model.branding, props.model.design, props.model.header.titleTextColor)
)

const borderStyle = computed(() => {
  const style = props.model.design.pageBorderStyle
  if (style === 'none') return 'none'
  const px = props.thickness.borderPx
  return style === 'double' ? `${px}px double` : `${px}px solid`
})

const borderRadius = computed(() =>
  props.model.design.pageBorderStyle === 'rounded' ? '1.5rem' : undefined
)

const showDonorNameAbove = computed(
  () => props.model.donorName?.show && props.model.donorName.position === 'above-product'
)

const showDonorNameBelow = computed(
  () => props.model.donorName?.show && props.model.donorName.position === 'below-product'
)
</script>

<template>
  <div
    class="relative w-full h-full overflow-hidden"
    :style="{
      fontFamily: model.branding.fontFamily,
      border: borderStyle,
      borderColor: colors.separatorsAndBorders,
      borderRadius
    }"
  >
    <CertBackground
      :background-image="model.design.backgroundImage"
      :data-field="model.targets?.design"
    />

    <div class="relative z-10 flex flex-col h-full overflow-hidden px-12 py-4 pb-3">
      <!-- Header -->
      <div class="text-center shrink-0">
        <CertLogo
          v-if="model.header.showLogo"
          :logo-url="model.branding.logoUrl"
          :primary-color="model.branding.primaryColor"
          :size="model.header.logoSize"
          :data-field="model.targets?.showLogo"
        />

        <CertTitle
          :title="model.header.title"
          :color="colors.titleText"
          :data-field="model.targets?.title"
        />

        <CertSubtitle :subtitle-html="model.subtitleHtml" :data-field="model.targets?.subtitle" />

        <CertDonorName
          v-if="showDonorNameAbove"
          :name="model.donorName!.value"
          :font-family="model.donorName!.fontFamily"
          :data-field="model.targets?.donorName"
        />
      </div>

      <!-- Content -->
      <div
        class="flex-1 flex flex-col items-center justify-start text-center min-h-0 overflow-hidden"
      >
        <CertProduct
          v-if="model.product?.show"
          :name="model.product.name"
          :image="model.product.image"
          :image-shape="model.product.imageShape"
          :border-color="colors.separatorsAndBorders"
          :border-width="props.thickness.productPx"
          :adaptive="true"
          :data-field="model.targets?.productSettings"
        />

        <CertDonorName
          v-if="showDonorNameBelow"
          :name="model.donorName!.value"
          :font-family="model.donorName!.fontFamily"
          :data-field="model.targets?.donorName"
        />

        <CertBody
          v-if="model.bodyHtml"
          :body-html="model.bodyHtml"
          :data-field="model.targets?.body"
        />
      </div>

      <!-- Footer -->
      <CertBottomRow
        :date="model.date"
        :signature="model.signature"
        :footer="model.footer"
        :separator-color="colors.separatorsAndBorders"
        :separator-thickness="props.thickness.separatorPx"
        :targets="model.targets"
      />
    </div>
  </div>
</template>
