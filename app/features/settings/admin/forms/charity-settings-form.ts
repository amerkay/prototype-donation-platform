import * as z from 'zod'
import {
  defineForm,
  textField,
  textareaField,
  selectField,
  fieldGroup,
  alertField,
  tabsField,
  componentField
} from '~/features/_library/form-builder/api'
import type {
  FieldContext,
  FieldDef,
  TabDefinitionConfig
} from '~/features/_library/form-builder/types'
import { getCurrencyOptionsForSelect } from '~/features/donation-form/shared/composables/useCurrency'
import { computed, ref } from 'vue'
import { useCurrencySettingsStore } from '~/features/settings/admin/stores/currencySettings'
import { useCharitySettingsStore } from '~/features/settings/admin/stores/charitySettings'
import { useTeamSettingsStore } from '~/features/settings/admin/stores/teamSettings'
import {
  useAddressFields,
  ADDRESS_ALL_OR_NOTHING_RULES
} from '~/features/donation-form/shared/forms/address-form'
import ClearAddressButton from '~/features/settings/admin/components/ClearAddressButton.vue'
import { useCharityCostsForm } from '~/features/settings/admin/forms/charity-costs-form'
import { useTermsConfigSection } from '~/features/donation-form/features/terms/admin/forms/terms-config-form'
import { formatCharityAddress } from '~/features/settings/admin/utils/formatCharityAddress'
import type { CharityAddress, CharityCurrencyEntry } from '~/features/settings/admin/types'
import {
  CHARITY_ENTRY_FIELDS,
  CHARITY_ADDRESS_FIELDS,
  CHARITY_ADDRESS_GROUP_FIELDS
} from '~/features/settings/admin/types'

const CURRENCY_OPTIONS = getCurrencyOptionsForSelect()

/** Module-level ref for bi-directional preview ↔ form tab sync */
export const charityActiveTab = ref<string>('')

/** Single shared accordion state — passed to provideAccordionGroup() for single-open behavior */
export const charityOpenAccordionId = ref<string | undefined>(undefined)

function formatAddressSummary(a: Partial<CharityAddress> | undefined): string {
  if (!a) return ''
  return formatCharityAddress(a as CharityAddress)
}

/** Count filled fields in a currency tab's form data */
function countFilledFields(d: Record<string, unknown>): number {
  const a = (d.address as Record<string, unknown>) ?? {}
  const g = (a.group1 as Record<string, unknown>) ?? {}
  return [
    ...CHARITY_ENTRY_FIELDS.map((f) => d[f]),
    ...CHARITY_ADDRESS_FIELDS.map((f) => a[f]),
    ...CHARITY_ADDRESS_GROUP_FIELDS.map((f) => g[f])
  ].filter((v): v is string => typeof v === 'string' && v.length > 0).length
}

/**
 * Create the fields for a single currency tab.
 * All tabs show the same per-currency fields. Default tab additionally shows org-level fields.
 */
function createTabFields(
  currency: string,
  isDefault: boolean,
  charityStore: ReturnType<typeof useCharitySettingsStore>,
  defaultCurrency: string
): Record<string, FieldDef> {
  const optionalString = (max: number) => z.string().max(max).optional().or(z.literal(''))
  const optionalUrl = z.string().url('Must be a valid URL').optional().or(z.literal(''))

  /** For non-default tabs, show the default currency's value as placeholder */
  const overridePlaceholder = (field: keyof CharityCurrencyEntry, fallback: string) =>
    isDefault
      ? fallback
      : () => {
          const val = charityStore.currencyEntries[defaultCurrency]?.[field]
          return val ? `${val} (fill to override)` : fallback
        }

  const name = textField('name', {
    label: 'Charity Name',
    description: 'Official registered charity name',
    placeholder: overridePlaceholder('name', 'Borneo Orangutan Survival Foundation'),
    maxLength: 120,
    rules: isDefault
      ? z.string().min(3, 'Charity name must be at least 3 characters').max(120)
      : optionalString(120)
  })

  const registrationNumber = textField('registrationNumber', {
    label: 'Registration Number',
    description: isDefault ? 'Official charity registration number (e.g., RCN123456)' : undefined,
    placeholder: overridePlaceholder('registrationNumber', 'RCN123456'),
    maxLength: 50,
    rules: isDefault
      ? z.string().min(3, 'Registration number is required').max(50)
      : optionalString(50)
  })

  const phone = textField('phone', {
    label: 'Phone Number',
    description: isDefault ? 'Contact phone number shown on receipts' : undefined,
    placeholder: overridePlaceholder('phone', '+44 20 7219 3000'),
    maxLength: 30,
    rules: optionalString(30)
  })

  const website = textField('website', {
    label: 'Website URL',
    description: isDefault ? 'Charity website (must start with http:// or https://)' : undefined,
    placeholder: overridePlaceholder('website', 'https://example.org'),
    maxLength: 200,
    showSeparatorAfter: true,
    rules: isDefault ? z.string().url('Must be a valid URL').max(200) : optionalUrl
  })

  const description = textareaField('description', {
    label: 'Description',
    description: isDefault ? 'Brief description of the charity (max 275 chars)' : undefined,
    placeholder: overridePlaceholder(
      'description',
      'We rescue, rehabilitate, and release orangutans...'
    ),
    maxLength: 275,
    rows: 3,
    rules: isDefault
      ? z.string().min(20, 'Description must be at least 20 characters').max(275)
      : optionalString(275)
  })

  // Address
  const addressSummary = computed(() => {
    const addr = charityStore.currencyEntries[currency]?.address
    if (!addr) return isDefault ? 'No address set' : 'Fill to override default'
    const required = [addr.address1, addr.city, addr.region, addr.postcode, addr.country]
    const filled = required.filter(Boolean).length
    if (filled === 0) return isDefault ? 'Registered charity address' : 'Fill to override default'
    const summary = formatAddressSummary(addr)
    if (filled < required.length) return `Incomplete — ${summary}`
    return summary
  })

  const addressAccordionState = ref<string | undefined>(undefined)
  const addressFields = isDefault
    ? useAddressFields()
    : (() => {
        const fields = useAddressFields(undefined, 'shipping', undefined, true)
        if (fields.country) {
          fields.country = { ...fields.country, showSeparatorAfter: false }
        }
        return fields
      })()

  const addressFieldsWithClear: Record<string, FieldDef> = { ...addressFields }
  if (!isDefault) {
    addressFieldsWithClear.clearAddress = componentField('clearAddress', {
      component: ClearAddressButton,
      props: {
        onClear: () => {
          addressAccordionState.value = undefined
        }
      },
      visibleWhen: ({ values }: FieldContext) => {
        const g = (values.group1 as Record<string, unknown>) ?? {}
        return [values.address1, values.city, values.country, g.region, g.postcode].some(
          (v) => typeof v === 'string' && v.length > 0
        )
      }
    })
  }

  const address = fieldGroup('address', {
    label: 'Address',
    collapsible: true,
    collapsibleDefaultOpen: false,
    collapsibleStateRef: isDefault ? undefined : addressAccordionState,
    description: addressSummary,
    wrapperClass: 'border rounded-lg p-4',
    fields: addressFieldsWithClear,
    rules: isDefault ? undefined : ADDRESS_ALL_OR_NOTHING_RULES
  })

  // Assemble fields
  const result: Record<string, FieldDef> = {}

  if (!isDefault) {
    result.overrideNotice = alertField('overrideNotice', {
      variant: 'default',
      description: `Any value filled here will override the default on receipts issued in ${currency}. Empty fields fall back to your default currency settings.`
    })
  }

  result.name = name
  result.registrationNumber = registrationNumber
  result.address = address
  result.phone = phone
  result.website = { ...website, showSeparatorAfter: true }
  result.description = { ...description, showSeparatorAfter: true }

  // Email sender & signature — per currency
  const teamStore = useTeamSettingsStore()
  result.supportEmail = selectField('supportEmail', {
    label: 'Support Email',
    description:
      'Team member whose name and email are used as the sender, reply-to, and support contact',
    placeholder: isDefault
      ? 'Select team member...'
      : () => {
          const defaultId = charityStore.currencyEntries[defaultCurrency]?.emailSenderId
          if (!defaultId) return 'Select team member...'
          const member = teamStore.activeMembers.find((m) => m.id === defaultId)
          return member ? `${member.name} (fill to override)` : 'Select team member...'
        },
    options: () =>
      teamStore.activeMembers.map((m) => ({
        value: m.id,
        label: `${m.name} (${m.email})`
      })),
    rules: isDefault
      ? z.string().min(1, 'Support email is required')
      : z.string().optional().or(z.literal('')),
    onChange: ({ value }) => {
      const member = teamStore.activeMembers.find((m) => m.id === value)
      if (member) {
        const entry = charityStore.currencyEntries[currency]
        if (entry) {
          entry.emailSenderName = member.name
          entry.emailSenderAddress = member.email
        }
      }
    }
  })
  result.emailSignature = textareaField('emailSignature', {
    label: 'Email Signature',
    description: 'Appended to all outgoing emails as {{ SIGNATURE }}',
    placeholder: overridePlaceholder('emailSignature', 'With gratitude,\nYour Team'),
    showSeparatorAfter: true
  })

  return result
}

/** Build $storePath mappings for a currency tab */
function buildStoreMappings(currency: string, tabPath: string): Record<string, string> {
  const m: Record<string, string> = {}
  const sp = `currencyEntries.${currency}.`

  // Per-currency fields — all tabs use the same pattern
  for (const f of CHARITY_ENTRY_FIELDS) m[`${tabPath}.${f}`] = `${sp}${f}`

  // Email sender & signature — per currency
  m[`${tabPath}.supportEmail`] = `${sp}emailSenderId`
  m[`${tabPath}.emailSignature`] = `${sp}emailSignature`

  // Address (flat in store, nested group1 in form)
  for (const f of ['address1', 'address2', 'city', 'country'] as const) {
    m[`${tabPath}.address.${f}`] = `${sp}address.${f}`
  }
  m[`${tabPath}.address.group1.region`] = `${sp}address.region`
  m[`${tabPath}.address.group1.postcode`] = `${sp}address.postcode`

  return m
}

/**
 * Charity settings form configuration
 * Uses tabsField with one tab per currency — all tabs show equal fields
 */
export const useCharitySettingsForm = defineForm('charitySettings', (ctx) => {
  const currencyStore = useCurrencySettingsStore()
  const charityStore = useCharitySettingsStore()

  const charityInfoAlert = alertField('charityInfoAlert', {
    variant: 'info',
    description: () => {
      if (currencyStore.supportedCurrencies.length > 1) {
        return 'Configure charity details per currency. The default tab applies to your base currency; other tabs let you customise details for other currencies.'
      }
      return `Charity details shown to donors paying in ${currencyStore.defaultCurrency}.`
    },
    cta: {
      label: 'Change default currency',
      to: '/admin/settings/currency#defaultCurrency',
      inline: true
    }
  })

  // Build tabs dynamically
  const tabs: TabDefinitionConfig[] = []
  const storeMappings: Record<string, string> = {}
  const sortedCurrencies = [...CURRENCY_OPTIONS].sort((a, b) =>
    a.value === currencyStore.defaultCurrency
      ? -1
      : b.value === currencyStore.defaultCurrency
        ? 1
        : 0
  )
  sortedCurrencies.forEach(({ value: currency }) => {
    const isDefault = currency === currencyStore.defaultCurrency
    const isSupported = currencyStore.supportedCurrencies.includes(currency)
    if (!isSupported) return

    tabs.push({
      value: currency,
      label: currency,
      badgeLabel: isDefault
        ? 'Default'
        : ({ values }: FieldContext) => {
            const tab = (values[currency] as Record<string, unknown>) ?? {}
            const count = countFilledFields(tab)
            return count > 0 ? String(count) : ''
          },
      badgeVariant: isDefault ? 'secondary' : 'default',
      fields: createTabFields(currency, isDefault, charityStore, currencyStore.defaultCurrency)
    })

    Object.assign(storeMappings, buildStoreMappings(currency, `currencyTabs.${currency}`))
  })

  // Initialize charityActiveTab to default currency
  charityActiveTab.value = currencyStore.defaultCurrency

  const currencyTabs = tabsField('currencyTabs', {
    tabsListClass: 'w-full',
    defaultValue: currencyStore.defaultCurrency,
    onTabChange: (tab) => {
      charityActiveTab.value = tab
    },
    tabs
  })

  // Dynamic description: "GBP default · 2 EUR overrides, 1 USD override"
  const currencySettingsDescription = computed(() => {
    const def = currencyStore.defaultCurrency
    const nonDefault = currencyStore.supportedCurrencies.filter((c) => c !== def)
    if (nonDefault.length === 0) return `${def} · single currency`

    const withOverrides = nonDefault.flatMap((currency) => {
      const entry = charityStore.currencyEntries[currency]
      if (!entry) return []
      const values = [
        entry.name,
        entry.registrationNumber,
        entry.phone,
        entry.website,
        entry.description,
        entry.emailSenderId,
        entry.emailSignature,
        entry.address?.address1,
        entry.address?.city,
        entry.address?.country,
        entry.address?.region,
        entry.address?.postcode
      ]
      const count = values.filter((v) => typeof v === 'string' && v.length > 0).length
      return count > 0 ? [{ currency, count }] : []
    })

    if (withOverrides.length === 0) return `${def} default · no overrides for other currencies`
    const parts = withOverrides.map(
      ({ currency, count }) => `${count} ${currency} ${count === 1 ? 'override' : 'overrides'}`
    )
    return `${def} default · ${parts.join(', ')}`
  })

  const charitySettings = fieldGroup('charitySettings', {
    label: 'Charity Details',
    description: currencySettingsDescription,
    collapsible: true,
    collapsibleDefaultOpen: false,
    wrapperClass: 'px-4 py-6 sm:px-6 bg-muted/50 rounded-xl border',
    fields: { currencyTabs, charityInfoAlert },
    $storePath: storeMappings
  })

  // Charity Costs — org-level cost breakdown for cover costs modal
  const charityCostsFields = useCharityCostsForm.setup(ctx)
  const charityCostsSection = fieldGroup('charityCosts', {
    label: 'Charity Costs',
    description:
      'Configure the operational cost breakdown shown to donors in the cover costs modal.',
    collapsible: true,
    collapsibleDefaultOpen: false,
    wrapperClass: 'px-4 py-6 sm:px-6 bg-muted/50 rounded-xl border',
    fields: charityCostsFields,
    $storePath: {
      heading: 'charityCosts.heading',
      introText: 'charityCosts.introText',
      outroText: 'charityCosts.outroText',
      costs: 'charityCosts.costs'
    }
  })

  // Terms & Conditions — org-level terms settings (enabled toggle is per-form, not here)
  // Exclude enabled (per-form) and settings (grouped wrapper) — use raw fields directly
  const { enabled: _te, settings: _ts, ...termsFields } = useTermsConfigSection.setup(ctx)
  const termsSection = fieldGroup('terms', {
    label: 'Terms & Conditions',
    description: 'Configure the terms content shown to donors on all forms.',
    collapsible: true,
    collapsibleDefaultOpen: false,
    wrapperClass: 'px-4 py-6 sm:px-6 bg-muted/50 rounded-xl border',
    fields: termsFields,
    $storePath: {
      mode: 'terms.settings.mode',
      externalUrl: 'terms.settings.externalUrl',
      richContent: 'terms.settings.richContent',
      label: 'terms.settings.label',
      description: 'terms.settings.description'
    }
  })

  return { charitySettings, charityCosts: charityCostsSection, terms: termsSection }
})
