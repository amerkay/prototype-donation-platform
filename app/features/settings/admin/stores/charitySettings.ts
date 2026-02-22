import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type {
  CharitySettings,
  CharityAddress,
  CharityCurrencyEntry,
  CharityCostsSettings,
  TermsSettings,
  CHARITY_ENTRY_FIELDS
} from '~/features/settings/admin/types'
import { charitySettings } from '~/sample-api-responses/api-sample-response-settings'
import { useEditableState } from '~/features/_admin/composables/defineEditableStore'
import { formatCharityAddress } from '~/features/settings/admin/utils/formatCharityAddress'
import { useCurrencySettingsStore } from '~/features/settings/admin/stores/currencySettings'

const EMPTY_ADDRESS: CharityAddress = {
  address1: '',
  address2: '',
  city: '',
  region: '',
  postcode: '',
  country: ''
}

function createEmptyEntry(currency: string): CharityCurrencyEntry {
  return {
    currency,
    name: '',
    registrationNumber: '',
    phone: '',
    website: '',
    description: '',
    address: { ...EMPTY_ADDRESS },
    emailSenderId: '',
    emailSenderName: '',
    emailSenderAddress: '',
    emailSignature: ''
  }
}

/**
 * Organization-level charity settings store
 *
 * All per-currency charity details are stored as equal entries in `currencyEntries`.
 * No "base vs override" distinction — every currency has a full entry.
 */
export const useCharitySettingsStore = defineStore('charitySettings', () => {
  const { isDirty, isSaving, markDirty, markClean } = useEditableState()
  const currencyStore = useCurrencySettingsStore()

  // Org-level fields (not per-currency)
  const slug = ref(charitySettings.slug)

  // Per-currency entries (all equal, keyed by currency code)
  const currencyEntries = ref<Record<string, CharityCurrencyEntry>>({
    ...charitySettings.currencyEntries
  })

  // Org-level charity costs (for cover costs upsell modal)
  const charityCosts = ref<CharityCostsSettings>(
    charitySettings.charityCosts ?? {
      heading: 'Help Us Keep More for the Orangutans',
      introText:
        'Running a modern charity requires essential technology and services. By covering these operational costs, you ensure 100% of your donation goes directly to protecting orangutans and their habitat.',
      outroText:
        'Your optional contribution helps offset these necessary costs, meaning every penny of your main donation can directly fund orangutan conservation work.',
      costs: []
    }
  )

  // Org-level terms & conditions settings
  const terms = ref<TermsSettings>(
    charitySettings.terms ?? {
      enabled: true,
      settings: {
        mode: 'link',
        externalUrl: '',
        richContent: '',
        label: 'I accept the terms and conditions',
        description: 'I agree to the Terms of Service and Privacy Policy.'
      }
    }
  )

  /** Snapshot current state */
  function toSnapshot(): CharitySettings {
    return {
      slug: slug.value,
      currencyEntries: JSON.parse(JSON.stringify(currencyEntries.value)),
      charityCosts: JSON.parse(JSON.stringify(charityCosts.value)),
      terms: JSON.parse(JSON.stringify(terms.value))
    }
  }

  /** Load all state from a CharitySettings object */
  function loadSnapshot(s: CharitySettings) {
    slug.value = s.slug
    currencyEntries.value = JSON.parse(JSON.stringify(s.currencyEntries))
    if (s.charityCosts) charityCosts.value = JSON.parse(JSON.stringify(s.charityCosts))
    if (s.terms) terms.value = JSON.parse(JSON.stringify(s.terms))
  }

  /** Ensure all supported currencies have entries (required for $storePath writes) */
  function ensureCurrencyEntries() {
    // TODO-SUPABASE: Replaced by DB trigger on org_identity.supported_currencies change (auto-populates organization_charity_currencies)
    const entries = currencyEntries.value
    let changed = false
    for (const currency of currencyStore.supportedCurrencies) {
      if (!entries[currency]) {
        entries[currency] = createEmptyEntry(currency)
        changed = true
      }
    }
    if (changed) currencyEntries.value = { ...entries }
  }

  // Convenience getters — resolve from default currency entry (for backward compat)
  const defaultEntry = computed(() => currencyEntries.value[currencyStore.defaultCurrency])
  const name = computed(() => defaultEntry.value?.name ?? '')
  const registrationNumber = computed(() => defaultEntry.value?.registrationNumber ?? '')
  const phone = computed(() => defaultEntry.value?.phone ?? '')
  const website = computed(() => defaultEntry.value?.website ?? '')
  const description = computed(() => defaultEntry.value?.description ?? '')
  const address = computed(
    () =>
      defaultEntry.value?.address ?? {
        address1: '',
        address2: '',
        city: '',
        region: '',
        postcode: '',
        country: ''
      }
  )
  const formattedAddress = computed(() => formatCharityAddress(address.value))
  const emailSenderId = computed(() => defaultEntry.value?.emailSenderId ?? '')
  const emailSenderName = computed(() => defaultEntry.value?.emailSenderName ?? '')
  const emailSenderAddress = computed(() => defaultEntry.value?.emailSenderAddress ?? '')
  const emailSignature = computed(() => defaultEntry.value?.emailSignature ?? '')

  // Getters
  const getCharityForCurrency = computed(
    () =>
      (
        currency: string
      ): {
        name: string
        registrationNumber: string
        phone: string
        email: string
        website: string
        description: string
        address: string
      } => {
        const entry = currencyEntries.value[currency]
        const defEntry = currencyEntries.value[currencyStore.defaultCurrency]

        // Use entry's field if non-empty, otherwise fall back to default currency's field
        const resolve = (field: (typeof CHARITY_ENTRY_FIELDS)[number]) =>
          entry?.[field] || defEntry?.[field] || ''

        const entryAddr = entry?.address ? formatCharityAddress(entry.address) : ''
        const defaultAddr = defEntry?.address ? formatCharityAddress(defEntry.address) : ''

        return {
          name: resolve('name'),
          registrationNumber: resolve('registrationNumber'),
          phone: resolve('phone'),
          email: entry?.emailSenderAddress || defEntry?.emailSenderAddress || '',
          website: resolve('website'),
          description: resolve('description'),
          address: entryAddr || defaultAddr
        }
      }
  )

  // Actions
  function initialize(settings: CharitySettings) {
    loadSnapshot(settings)
    ensureCurrencyEntries()
    markClean()
  }

  function updateSettings(settings: Partial<CharitySettings>) {
    if (settings.slug !== undefined) slug.value = settings.slug
    if (settings.currencyEntries !== undefined)
      currencyEntries.value = { ...settings.currencyEntries }
    markDirty()
  }

  // Persistence
  let hydrated = false
  function $hydrate() {
    if (hydrated) return
    try {
      // TODO-SUPABASE: Replace with supabase.from('org_identity').select('slug').single() + from('organization_charity_currencies').select('*').eq('org_id', orgId)
      const saved = sessionStorage.getItem('settings-charity')
      if (saved) initialize(JSON.parse(saved))
    } catch {
      /* ignore */
    }
    hydrated = true
  }

  function save() {
    try {
      // TODO-SUPABASE: Replace with supabase.from('org_identity').upsert({ org_id: orgId, slug }) + from('organization_charity_currencies').upsert(currencyEntries rows)
      sessionStorage.setItem('settings-charity', JSON.stringify(toSnapshot()))
    } catch {
      /* ignore */
    }
  }

  // Hydrate immediately on client, then ensure entries exist
  if (import.meta.client) {
    $hydrate()
    ensureCurrencyEntries()
  }
  watch(() => currencyStore.supportedCurrencies, ensureCurrencyEntries, { deep: true })

  return {
    // State
    slug,
    currencyEntries,
    charityCosts,
    terms,
    isDirty,
    isSaving,
    // Convenience getters (from default currency entry)
    name,
    registrationNumber,
    phone,
    website,
    description,
    address,
    formattedAddress,
    emailSenderId,
    emailSenderName,
    emailSenderAddress,
    emailSignature,
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
