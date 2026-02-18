import { computed } from 'vue'
import {
  FORM_TYPE_DEFAULTS,
  FEATURE_FORM_TYPE_SUPPORT,
  type FormType,
  type FormTypeLabels
} from '~/features/donation-form/shared/types'
import { useFormConfigStore } from '~/features/donation-form/shared/stores/formConfig'

/**
 * Provides form-type-aware labels and feature support checks.
 * Single source of truth for all form-type-dependent rendering.
 */
export function useFormTypeLabels() {
  const configStore = useFormConfigStore()

  const formType = computed<FormType>(() => configStore.form?.formType ?? 'donation')

  const labels = computed<FormTypeLabels>(() => FORM_TYPE_DEFAULTS[formType.value])

  const isDonation = computed(() => formType.value === 'donation')

  function isFeatureSupported(featureKey: string): boolean {
    const supportedTypes = FEATURE_FORM_TYPE_SUPPORT[featureKey]
    // If feature isn't listed, it's supported by all types
    if (!supportedTypes) return true
    return supportedTypes.includes(formType.value)
  }

  return { formType, labels, isDonation, isFeatureSupported }
}
