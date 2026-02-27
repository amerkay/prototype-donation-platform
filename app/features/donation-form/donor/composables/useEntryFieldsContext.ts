import { computed } from 'vue'
import type { ContextSchema } from '~/features/_library/form-builder/conditions'
import { useFormConfigStore } from '~/features/donation-form/shared/stores/formConfig'
import { useImpactCartStore } from '~/features/donation-form/features/impact-cart/donor/stores/impactCart'
import { useDonationFormStore } from '~/features/donation-form/donor/stores/donationForm'
import { useDonationCurrencies } from '~/features/donation-form/shared/composables/useDonationCurrencies'

/**
 * Shared context and context schema for entry fields forms.
 *
 * @param getCurrency - Reactive getter returning the active currency string.
 */
export function useEntryFieldsContext(getCurrency: () => string) {
  const formConfigStore = useFormConfigStore()
  const cartStore = useImpactCartStore()
  const donationStore = useDonationFormStore()
  const { effectiveCurrencies } = useDonationCurrencies()

  const cartProducts = computed(() => [
    ...new Set([
      ...cartStore.multipleCart.map((item) => item.id),
      ...(donationStore.selectedProducts.monthly
        ? [donationStore.selectedProducts.monthly.id]
        : []),
      ...(donationStore.selectedProducts.yearly ? [donationStore.selectedProducts.yearly.id] : [])
    ])
  ])

  const entryContext = computed(() => ({
    cartProducts: cartProducts.value,
    cartItemCount: cartStore.multipleCart.length,
    cartTotal: cartStore.multipleCartTotal,
    currency: getCurrency()
  }))

  const entryContextSchema = computed<ContextSchema>(() => ({
    cartProducts: {
      label: 'Cart Has Product',
      type: 'array',
      description: 'Products currently in donor cart (all frequencies)',
      options: formConfigStore.products.map((p) => ({ value: p.id, label: p.title }))
    },
    cartItemCount: { label: 'Cart Item Count', type: 'number' },
    cartTotal: { label: 'Cart Total', type: 'number' },
    currency: {
      label: 'Currency',
      type: 'array',
      options: effectiveCurrencies.value.supportedCurrencies.map((code) => ({
        value: code,
        label: code
      }))
    }
  }))

  return { entryContext, entryContextSchema }
}
