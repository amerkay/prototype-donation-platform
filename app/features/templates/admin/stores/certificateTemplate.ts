import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { CertificateTemplate } from '~/features/templates/admin/types'
import { certificateTemplate as defaults } from '~/sample-api-responses/api-sample-response-templates'
import { useEditableState } from '~/features/_admin/composables/defineEditableStore'

export const useCertificateTemplateStore = defineStore('certificateTemplate', () => {
  const { isDirty, isSaving, markDirty, markClean } = useEditableState()

  const title = ref(defaults.title)
  const subtitle = ref(defaults.subtitle)
  const bodyText = ref(defaults.bodyText)
  const borderStyle = ref(defaults.borderStyle)
  const showLogo = ref(defaults.showLogo)
  const showDate = ref(defaults.showDate)
  const showSignature = ref(defaults.showSignature)
  const signatureName = ref(defaults.signatureName)
  const signatureTitle = ref(defaults.signatureTitle)
  const orientation = ref(defaults.orientation)
  const backgroundImage = ref(defaults.backgroundImage)
  const showProduct = ref(defaults.showProduct)
  const productBorderRadius = ref(defaults.productBorderRadius)
  const productBorderColor = ref(defaults.productBorderColor)
  const productNameColor = ref(defaults.productNameColor)
  const titleColor = ref(defaults.titleColor)
  const signatureColor = ref(defaults.signatureColor)

  function initialize(t: CertificateTemplate) {
    title.value = t.title
    subtitle.value = t.subtitle
    bodyText.value = t.bodyText
    borderStyle.value = t.borderStyle
    showLogo.value = t.showLogo
    showDate.value = t.showDate
    showSignature.value = t.showSignature
    signatureName.value = t.signatureName
    signatureTitle.value = t.signatureTitle
    orientation.value = t.orientation
    backgroundImage.value = t.backgroundImage
    showProduct.value = t.showProduct ?? defaults.showProduct
    productBorderRadius.value = t.productBorderRadius ?? defaults.productBorderRadius
    productBorderColor.value = t.productBorderColor ?? defaults.productBorderColor
    productNameColor.value = t.productNameColor ?? defaults.productNameColor
    titleColor.value = t.titleColor ?? defaults.titleColor
    signatureColor.value = t.signatureColor ?? defaults.signatureColor
    markClean()
  }

  function updateSettings(t: Partial<CertificateTemplate>) {
    if (t.title !== undefined) title.value = t.title
    if (t.subtitle !== undefined) subtitle.value = t.subtitle
    if (t.bodyText !== undefined) bodyText.value = t.bodyText
    if (t.borderStyle !== undefined) borderStyle.value = t.borderStyle
    if (t.showLogo !== undefined) showLogo.value = t.showLogo
    if (t.showDate !== undefined) showDate.value = t.showDate
    if (t.showSignature !== undefined) showSignature.value = t.showSignature
    if (t.signatureName !== undefined) signatureName.value = t.signatureName
    if (t.signatureTitle !== undefined) signatureTitle.value = t.signatureTitle
    if (t.orientation !== undefined) orientation.value = t.orientation
    if (t.backgroundImage !== undefined) backgroundImage.value = t.backgroundImage
    if (t.showProduct !== undefined) showProduct.value = t.showProduct
    if (t.productBorderRadius !== undefined) productBorderRadius.value = t.productBorderRadius
    if (t.productBorderColor !== undefined) productBorderColor.value = t.productBorderColor
    if (t.productNameColor !== undefined) productNameColor.value = t.productNameColor
    if (t.titleColor !== undefined) titleColor.value = t.titleColor
    if (t.signatureColor !== undefined) signatureColor.value = t.signatureColor
    markDirty()
  }

  let hydrated = false
  function $hydrate() {
    if (hydrated) return
    try {
      const saved = sessionStorage.getItem('template-certificate')
      if (saved) initialize(JSON.parse(saved))
    } catch {
      /* ignore */
    }
    hydrated = true
  }

  function save() {
    try {
      sessionStorage.setItem(
        'template-certificate',
        JSON.stringify({
          title: title.value,
          subtitle: subtitle.value,
          bodyText: bodyText.value,
          borderStyle: borderStyle.value,
          showLogo: showLogo.value,
          showDate: showDate.value,
          showSignature: showSignature.value,
          signatureName: signatureName.value,
          signatureTitle: signatureTitle.value,
          orientation: orientation.value,
          backgroundImage: backgroundImage.value,
          showProduct: showProduct.value,
          productBorderRadius: productBorderRadius.value,
          productBorderColor: productBorderColor.value,
          productNameColor: productNameColor.value,
          titleColor: titleColor.value,
          signatureColor: signatureColor.value
        })
      )
    } catch {
      /* ignore */
    }
  }

  if (import.meta.client) $hydrate()

  return {
    title,
    subtitle,
    bodyText,
    borderStyle,
    showLogo,
    showDate,
    showSignature,
    signatureName,
    signatureTitle,
    orientation,
    backgroundImage,
    showProduct,
    productBorderRadius,
    productBorderColor,
    productNameColor,
    titleColor,
    signatureColor,
    isDirty,
    isSaving,
    initialize,
    updateSettings,
    markDirty,
    markClean,
    $hydrate,
    save
  }
})
