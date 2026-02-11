<script setup lang="ts">
import type {
  CertificateModel,
  ResolvedColors,
  ResolvedThickness
} from '~/features/templates/shared/types'
import { getThickness, BORDER_STYLES } from '~/features/templates/shared/types'
import { useCertificateColors } from '~/features/templates/shared/composables/useCertificateColors'
import CertBackground from './sections/CertBackground.vue'
import CertLogo from './sections/CertLogo.vue'
import CertTitle from './sections/CertTitle.vue'
import CertSubtitle from './sections/CertSubtitle.vue'
import CertDonorName from './sections/CertDonorName.vue'
import CertProduct from './sections/CertProduct.vue'
import CertBody from './sections/CertBody.vue'
import CertSeparator from './sections/CertSeparator.vue'
import CertBottomRow from './sections/CertBottomRow.vue'

const props = defineProps<{
  model: CertificateModel
}>()

const colors = computed<ResolvedColors>(() =>
  useCertificateColors(props.model.branding, props.model.design, props.model.header.titleTextColor)
)

const thickness = computed<ResolvedThickness>(() =>
  getThickness(props.model.design.pageBorderThickness)
)

const borderStyle = computed(() => {
  const style = props.model.design.pageBorderStyle
  if (style === 'none') return 'none'
  const styleFn = BORDER_STYLES[style] ?? BORDER_STYLES.border
  return styleFn(thickness.value.borderPx)
})

const borderRadius = computed(() =>
  props.model.design.pageBorderStyle === 'rounded' ? '2rem' : undefined
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

    <div
      class="relative z-10 flex flex-col items-center h-full text-center overflow-hidden px-20 py-12"
    >
      <!-- Header -->
      <div class="w-full shrink-0">
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
      <div class="w-full flex-1 flex flex-col items-center min-h-0 overflow-hidden">
        <CertProduct
          v-if="model.product?.show"
          :name="model.product.name"
          :image="model.product.image"
          :image-shape="model.product.imageShape"
          :border-color="colors.separatorsAndBorders"
          :border-width="thickness.productPx"
          :adaptive="true"
          :data-field="model.targets?.productSettings"
        />

        <CertDonorName
          v-if="showDonorNameBelow"
          :name="model.donorName!.value"
          :font-family="model.donorName!.fontFamily"
          :data-field="model.targets?.donorName"
        />

        <CertSeparator :color="colors.separatorsAndBorders" :thickness="thickness.separatorPx" />

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
        :separator-thickness="thickness.separatorPx"
        :targets="model.targets"
      />
    </div>
  </div>
</template>
