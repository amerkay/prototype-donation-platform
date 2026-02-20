import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type {
  CharitySettings,
  CharityAddress,
  CharityCurrencyOverride
} from '~/features/settings/admin/types'
import { CHARITY_STORE_FIELDS } from '~/features/settings/admin/types'
import { charitySettings } from '~/sample-api-responses/api-sample-response-settings'
import { useEditableState } from '~/features/_admin/composables/defineEditableStore'
import { formatCharityAddress } from '~/features/settings/admin/utils/formatCharityAddress'
import { useCurrencySettingsStore } from '~/features/settings/admin/stores/currencySettings'

const EMPTY_OVERRIDE: CharityCurrencyOverride = {
  enabled: false,
  name: '',
  registrationNumber: '',
  phone: '',
  replyToEmail: '',
  website: '',
  description: '',
  address: { address1: '', address2: '', city: '', region: '', postcode: '', country: '' }
}

/**
 * Organization-level charity settings store
 *
 * Provides charity identity data used across donor-facing pages.
 * Per-currency overrides allow different registration details per jurisdiction.
 */
export const useCharitySettingsStore = defineStore('charitySettings', () => {
  const { isDirty, isSaving, markDirty, markClean } = useEditableState()
  const currencyStore = useCurrencySettingsStore()

  // State
  const slug = ref(charitySettings.slug)
  const name = ref(charitySettings.name)
  const registrationNumber = ref(charitySettings.registrationNumber)
  const phone = ref(charitySettings.phone)
  const replyToEmail = ref(charitySettings.replyToEmail)
  const website = ref(charitySettings.website)
  const description = ref(charitySettings.description)
  const emailSenderId = ref(charitySettings.emailSenderId)
  const emailSenderName = ref(charitySettings.emailSenderName)
  const emailSenderAddress = ref(charitySettings.emailSenderAddress)
  const emailSignature = ref(charitySettings.emailSignature)
  const address = ref<CharityAddress>({ ...charitySettings.address })
  const currencyOverrides = ref<Record<string, CharityCurrencyOverride>>({
    ...charitySettings.currencyOverrides
  })

  // Ref lookup for iteration (avoids repeating field names in snapshot/load)
  const fieldRefs = {
    slug,
    name,
    registrationNumber,
    phone,
    replyToEmail,
    website,
    description,
    emailSenderId,
    emailSenderName,
    emailSenderAddress,
    emailSignature
  } as const

  /** Snapshot current state as a plain CharitySettings object */
  function toSnapshot(): CharitySettings {
    return {
      ...Object.fromEntries(CHARITY_STORE_FIELDS.map((k) => [k, fieldRefs[k].value])),
      address: address.value,
      currencyOverrides: currencyOverrides.value
    } as CharitySettings
  }

  /** Load all state from a CharitySettings object */
  function loadSnapshot(s: CharitySettings) {
    for (const k of CHARITY_STORE_FIELDS) fieldRefs[k].value = s[k]
    address.value = { ...s.address }
    currencyOverrides.value = { ...s.currencyOverrides }
  }

  /** Ensure all supported currencies have override entries (required for $storePath writes) */
  function ensureOverrideEntries() {
    const overrides = currencyOverrides.value
    let changed = false
    for (const currency of currencyStore.supportedCurrencies) {
      if (currency === currencyStore.defaultCurrency) continue
      if (!overrides[currency]) {
        overrides[currency] = { ...EMPTY_OVERRIDE, address: { ...EMPTY_OVERRIDE.address! } }
        changed = true
      }
    }
    if (changed) currencyOverrides.value = { ...overrides }
  }

  // Getters
  const formattedAddress = computed(() => formatCharityAddress(address.value))

  const getCharityForCurrency = computed(
    () =>
      (
        currency: string
      ): {
        name: string
        registrationNumber: string
        phone: string
        replyToEmail: string
        website: string
        description: string
        address: string
      } => {
        const formatted = formattedAddress.value
        const override = currencyOverrides.value[currency]
        if (override?.enabled) {
          const overrideAddr = override.address ? formatCharityAddress(override.address) : ''
          return {
            name: override.name || name.value,
            registrationNumber: override.registrationNumber || registrationNumber.value,
            phone: override.phone || phone.value,
            replyToEmail: override.replyToEmail || replyToEmail.value,
            website: override.website || website.value,
            description: override.description || description.value,
            address: overrideAddr || formatted
          }
        }
        return {
          name: name.value,
          registrationNumber: registrationNumber.value,
          phone: phone.value,
          replyToEmail: replyToEmail.value,
          website: website.value,
          description: description.value,
          address: formatted
        }
      }
  )

  // Actions
  function initialize(settings: CharitySettings) {
    loadSnapshot(settings)
    ensureOverrideEntries()
    markClean()
  }

  function updateSettings(settings: Partial<CharitySettings>) {
    for (const k of CHARITY_STORE_FIELDS) {
      if (settings[k] !== undefined) fieldRefs[k].value = settings[k]!
    }
    if (settings.address !== undefined) address.value = { ...settings.address }
    if (settings.currencyOverrides !== undefined)
      currencyOverrides.value = { ...settings.currencyOverrides }
    markDirty()
  }

  // Persistence - hydrate on load, save only on explicit call
  let hydrated = false
  function $hydrate() {
    if (hydrated) return
    try {
      const saved = sessionStorage.getItem('settings-charity')
      if (saved) initialize(JSON.parse(saved))
    } catch {
      /* ignore */
    }
    hydrated = true
  }

  function save() {
    try {
      sessionStorage.setItem('settings-charity', JSON.stringify(toSnapshot()))
    } catch {
      /* ignore */
    }
  }

  // Hydrate immediately on client, then ensure entries exist
  if (import.meta.client) {
    $hydrate()
    ensureOverrideEntries()
  }
  watch(() => currencyStore.supportedCurrencies, ensureOverrideEntries, { deep: true })

  return {
    // State
    slug,
    name,
    registrationNumber,
    phone,
    replyToEmail,
    website,
    description,
    emailSenderId,
    emailSenderName,
    emailSenderAddress,
    emailSignature,
    address,
    formattedAddress,
    currencyOverrides,
    isDirty,
    isSaving,
    // Getters
    getCharityForCurrency,
    // Actions
    toSnapshot,
    initialize,
    updateSettings,
    markDirty,
    markClean,
    $hydrate,
    save
  }
})
