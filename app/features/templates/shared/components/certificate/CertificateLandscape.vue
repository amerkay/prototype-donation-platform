<script setup lang="ts">
import type { CertificateModel } from '~/features/templates/shared/types'
import { useCertificateColors } from '~/features/templates/shared/composables/useCertificateColors'
import CertBackground from './sections/CertBackground.vue'
import CertLogo from './sections/CertLogo.vue'
import CertTitle from './sections/CertTitle.vue'
import CertAwardBlock from './sections/CertAwardBlock.vue'
import CertProduct from './sections/CertProduct.vue'
import CertBody from './sections/CertBody.vue'
import CertBottomRow from './sections/CertBottomRow.vue'
import CertSeparator from './sections/CertSeparator.vue'

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

const isLogoLeft = computed(
  () => props.model.header.showLogo && props.model.header.logoPosition === 'left'
)

const isLogoCentered = computed(
  () => props.model.header.showLogo && props.model.header.logoPosition !== 'left'
)

const headerZoom = computed(() => (isLogoCentered.value ? 0.8 : undefined))
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
      :data-field="model.targets?.page"
    />

    <!-- Logo absolutely positioned in corner when 'left' -->
    <CertLogo
      v-if="isLogoLeft"
      position="left"
      :logo-url="model.branding.logoUrl"
      :size="model.header.logoSize"
      :data-field="model.targets?.showLogo"
      class="absolute top-7 left-7 z-20"
    />

    <div class="relative z-10 flex flex-col h-full overflow-hidden px-12 pt-8 pb-4">
      <!-- Header -->
      <div class="text-center shrink-0" :style="{ zoom: headerZoom }">
        <!-- Centered logo (default) -->
        <CertLogo
          v-if="isLogoCentered"
          position="center"
          :logo-url="model.branding.logoUrl"
          :size="model.header.logoSize"
          :data-field="model.targets?.showLogo"
        />

        <CertTitle
          :title-line1="model.header.titleLine1"
          :title-line2="model.header.titleLine2"
          :color-line2="colors.titleText"
          :data-field-line1="model.targets?.titleLine1"
          :data-field-line2="model.targets?.titleLine2"
          class="max-w-xl mx-auto"
        />

        <!-- Award block -->
        <CertAwardBlock
          v-if="model.awardBlock"
          class="mt-6"
          :award-block="model.awardBlock"
          :data-field="model.targets?.award"
        />
      </div>

      <!-- Content -->
      <div
        class="flex-1 flex flex-col items-center justify-start text-center min-h-0 overflow-hidden mt-4"
      >
        <CertProduct
          v-if="model.product?.show"
          :name="model.product.name"
          :image="model.product.image"
          :image-shape="model.product.imageShape"
          :border-color="colors.separatorsAndBorders"
          :border-width="props.thickness.productPx"
          :adaptive="true"
          :text="model.product.text"
          :data-field="model.targets?.product"
          class="mb-4"
        />

        <CertSeparator
          v-if="!model.product?.show"
          :color="colors.separatorsAndBorders"
          :thickness="props.thickness.separatorPx"
        />

        <CertBody
          v-if="model.bodyHtml"
          :body-html="model.bodyHtml"
          :data-field="model.targets?.body"
          class="mb-3"
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
