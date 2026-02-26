import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  CharitySettings,
  CharityInfo,
  CharityAddress,
  CharityCostsSettings,
  TermsSettings
} from '~/features/settings/admin/types'
import { charitySettings } from '~/sample-api-responses/api-sample-response-settings'
import { useEditableState } from '~/features/_admin/composables/defineEditableStore'
import { formatCharityAddress } from '~/features/settings/admin/utils/formatCharityAddress'

const EMPTY_ADDRESS: CharityAddress = {
  address1: '',
  address2: '',
  city: '',
  region: '',
  postcode: '',
  country: ''
}

const EMPTY_CHARITY: CharityInfo = {
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

/**
 * Organization-level charity settings store
 *
 * Flat single charity identity — no per-currency overrides.
 */
export const useCharitySettingsStore = defineStore('charitySettings', () => {
  const { isDirty, isSaving, markDirty, markClean } = useEditableState()

  // Org-level fields
  const slug = ref(charitySettings.slug)

  // Flat charity identity
  const charity = ref<CharityInfo>(charitySettings.charity ?? { ...EMPTY_CHARITY })

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
      charity: JSON.parse(JSON.stringify(charity.value)),
      charityCosts: JSON.parse(JSON.stringify(charityCosts.value)),
      terms: JSON.parse(JSON.stringify(terms.value))
    }
  }

  /** Load all state from a CharitySettings object */
  function loadSnapshot(s: CharitySettings) {
    slug.value = s.slug
    charity.value = JSON.parse(JSON.stringify(s.charity))
    if (s.charityCosts) charityCosts.value = JSON.parse(JSON.stringify(s.charityCosts))
    if (s.terms) terms.value = JSON.parse(JSON.stringify(s.terms))
  }

  // Convenience getters — read directly from flat charity object
  const name = computed(() => charity.value.name)
  const registrationNumber = computed(() => charity.value.registrationNumber)
  const phone = computed(() => charity.value.phone)
  const website = computed(() => charity.value.website)
  const description = computed(() => charity.value.description)
  const address = computed(() => charity.value.address)
  const formattedAddress = computed(() => formatCharityAddress(address.value))
  const emailSenderId = computed(() => charity.value.emailSenderId)
  const emailSenderName = computed(() => charity.value.emailSenderName)
  const emailSenderAddress = computed(() => charity.value.emailSenderAddress)
  const emailSignature = computed(() => charity.value.emailSignature)

  // Actions
  function initialize(settings: CharitySettings) {
    loadSnapshot(settings)
    markClean()
  }

  function updateSettings(settings: Partial<CharitySettings>) {
    if (settings.slug !== undefined) slug.value = settings.slug
    if (settings.charity !== undefined) charity.value = { ...settings.charity }
    markDirty()
  }

  // Persistence
  let hydrated = false
  function $hydrate() {
    if (hydrated) return
    try {
      // TODO-SUPABASE: Replace with supabase.from('org_identity').select('slug, charity').single()
      const saved = sessionStorage.getItem('settings-charity')
      if (saved) initialize(JSON.parse(saved))
    } catch {
      /* ignore */
    }
    hydrated = true
  }

  function save() {
    try {
      // TODO-SUPABASE: Replace with supabase.from('org_identity').upsert({ org_id: orgId, slug, charity })
      sessionStorage.setItem('settings-charity', JSON.stringify(toSnapshot()))
    } catch {
      /* ignore */
    }
  }

  if (import.meta.client) {
    $hydrate()
  }

  return {
    // State
    slug,
    charity,
    charityCosts,
    terms,
    isDirty,
    isSaving,
    // Convenience getters
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
