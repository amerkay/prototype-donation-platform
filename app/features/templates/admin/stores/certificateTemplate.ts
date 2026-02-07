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
          signatureTitle: signatureTitle.value
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
