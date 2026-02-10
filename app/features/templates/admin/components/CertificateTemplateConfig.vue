<script setup lang="ts">
import FormRenderer from '~/features/_library/form-builder/FormRenderer.vue'
import StickyButtonGroup from '~/features/_admin/components/StickyButtonGroup.vue'
import {
  useCertificateTemplateForm,
  certificateOpenAccordionId
} from '~/features/templates/admin/forms/certificate-template-form'
import { useCertificateTemplateStore } from '~/features/templates/admin/stores/certificateTemplate'
import { useAdminConfigForm } from '~/features/_admin/composables/useAdminConfigForm'
import { provideAccordionGroup } from '~/features/_library/form-builder/composables/useAccordionGroup'

const store = useCertificateTemplateStore()

provideAccordionGroup(certificateOpenAccordionId)

type CertificateFormData = {
  certificate?: {
    header?: {
      showLogo?: boolean
      title?: string
      titleColor?: string
      subtitle?: string
    }
    body?: {
      bodyText?: string
      bodyTextFontSize?: 'small' | 'medium' | 'large'
    }
    productSettings?: {
      showProduct?: boolean
      productBorderRadius?: 'circle' | 'rounded' | 'square'
    }
    signatureSettings?: {
      showSignature?: boolean
      signatureName?: string
      signatureTitle?: string
      signatureFontFamily?: string
    }
    design?: {
      orientation?: 'landscape' | 'portrait'
      backgroundImage?: string | null
      borderStyle?: 'classic' | 'modern' | 'minimal' | 'ornate'
      separatorsAndBorders?: string
    }
  }
}

const { formRef, modelValue, form, expose } = useAdminConfigForm({
  store,
  form: useCertificateTemplateForm,
  autoMap: false,
  getData: (s): CertificateFormData => ({
    certificate: {
      header: { ...s.certificate.header },
      body: { ...s.certificate.body },
      productSettings: { ...s.certificate.productSettings },
      signatureSettings: { ...s.certificate.signatureSettings },
      design: { ...s.certificate.design }
    }
  }),
  setData: (s, value: CertificateFormData) => {
    const header = value.certificate?.header
    const body = value.certificate?.body
    const productSettings = value.certificate?.productSettings
    const signatureSettings = value.certificate?.signatureSettings
    const design = value.certificate?.design

    const next: Record<string, unknown> = {}

    if (header?.showLogo !== undefined) next.showLogo = header.showLogo
    if (header?.title !== undefined) next.title = header.title
    if (header?.titleColor !== undefined) next.titleColor = header.titleColor
    if (header?.subtitle !== undefined) next.subtitle = header.subtitle

    if (body?.bodyText !== undefined) next.bodyText = body.bodyText
    if (body?.bodyTextFontSize !== undefined) next.bodyTextFontSize = body.bodyTextFontSize

    if (productSettings?.showProduct !== undefined) next.showProduct = productSettings.showProduct
    if (productSettings?.productBorderRadius !== undefined) {
      next.productBorderRadius = productSettings.productBorderRadius
    }
    if (signatureSettings?.showSignature !== undefined) {
      next.showSignature = signatureSettings.showSignature
    }
    if (signatureSettings?.signatureName !== undefined) {
      next.signatureName = signatureSettings.signatureName
    }
    if (signatureSettings?.signatureTitle !== undefined) {
      next.signatureTitle = signatureSettings.signatureTitle
    }
    if (signatureSettings?.signatureFontFamily !== undefined) {
      next.signatureFontFamily = signatureSettings.signatureFontFamily
    }

    if (design?.orientation !== undefined) next.orientation = design.orientation
    if (design?.backgroundImage !== undefined) next.backgroundImage = design.backgroundImage
    if (design?.borderStyle !== undefined) next.borderStyle = design.borderStyle
    if (design?.separatorsAndBorders !== undefined) {
      next.separatorsAndBorders = design.separatorsAndBorders
    }

    s.updateSettings(next)
  }
})

defineEmits<{ save: []; discard: []; preview: [] }>()
defineExpose(expose)
</script>

<template>
  <div class="w-full mx-auto space-y-6">
    <FormRenderer
      ref="formRef"
      v-model="modelValue"
      :section="form"
      validate-on-mount
      update-only-when-valid
    />
    <StickyButtonGroup
      :is-dirty="store.isDirty"
      :is-saving="store.isSaving"
      :is-valid="formRef?.isValid ?? false"
      @save="$emit('save')"
      @discard="$emit('discard')"
    />
  </div>
</template>
