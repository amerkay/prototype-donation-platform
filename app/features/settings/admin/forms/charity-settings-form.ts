import * as z from 'zod'
import {
  defineForm,
  textField,
  textareaField,
  selectField,
  toggleField,
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
import { formatCharityAddress } from '~/features/settings/admin/utils/formatCharityAddress'
import type { CharityAddress } from '~/features/settings/admin/types'
import {
  CHARITY_OVERRIDE_FIELDS,
  CHARITY_ADDRESS_FIELDS,
  CHARITY_ADDRESS_GROUP_FIELDS
} from '~/features/settings/admin/types'

const CURRENCY_OPTIONS = getCurrencyOptionsForSelect()

function formatAddressSummary(a: Partial<CharityAddress> | undefined): string {
  if (!a) return ''
  return formatCharityAddress(a as CharityAddress)
}

/** Extract filled override field values from a tab's form data */
function getOverrideValues(d: Record<string, unknown>): string[] {
  const a = (d.address as Record<string, unknown>) ?? {}
  const g = (a.group1 as Record<string, unknown>) ?? {}
  return [
    ...CHARITY_OVERRIDE_FIELDS.map((f) => d[f]),
    ...CHARITY_ADDRESS_FIELDS.map((f) => a[f]),
    ...CHARITY_ADDRESS_GROUP_FIELDS.map((f) => g[f])
  ].filter((v): v is string => typeof v === 'string' && v.length > 0)
}

const hasOverrideContent = (d: Record<string, unknown>) => getOverrideValues(d).length > 0
const countOverrideFields = (d: Record<string, unknown>) => getOverrideValues(d).length

/**
 * Create the fields for a single currency tab (default or override).
 * Follows the donation-amounts pattern: flat fields, no wrapper group.
 */
function createTabFields(
  currency: string,
  isDefault: boolean,
  charityStore: ReturnType<typeof useCharitySettingsStore>
): Record<string, FieldDef> {
  const enabledVisibility = ({ values }: FieldContext) => (values.enabled as boolean) === true
  const visibleWhen = isDefault ? undefined : enabledVisibility

  const optionalString = (max: number) => z.string().max(max).optional().or(z.literal(''))
  const optionalEmail = z.string().email('Must be a valid email').optional().or(z.literal(''))
  const optionalUrl = z.string().url('Must be a valid URL').optional().or(z.literal(''))

  const name = textField('name', {
    label: 'Charity Name',
    description: 'Official registered charity name',
    placeholder: isDefault ? 'Borneo Orangutan Survival Foundation' : 'Override charity name',
    maxLength: 120,
    visibleWhen,
    rules: isDefault
      ? z.string().min(3, 'Charity name must be at least 3 characters').max(120)
      : optionalString(120)
  })

  const registrationNumber = textField('registrationNumber', {
    label: 'Registration Number',
    description: isDefault ? 'Official charity registration number (e.g., RCN123456)' : undefined,
    placeholder: isDefault ? 'RCN123456' : 'Override registration number',
    maxLength: 50,
    visibleWhen,
    rules: isDefault
      ? z.string().min(3, 'Registration number is required').max(50)
      : optionalString(50)
  })

  const phone = textField('phone', {
    label: 'Phone Number',
    description: isDefault ? 'Contact phone number shown on receipts' : undefined,
    placeholder: isDefault ? '+44 20 7219 3000' : 'Override phone number',
    maxLength: 30,
    visibleWhen,
    rules: optionalString(30)
  })

  const replyToEmail = textField('replyToEmail', {
    label: 'Reply-to Email',
    description: isDefault ? 'Email address used as reply-to on donor communications' : undefined,
    placeholder: isDefault ? 'info@example.org' : 'Override reply-to email',
    maxLength: 254,
    visibleWhen,
    rules: optionalEmail
  })

  const website = textField('website', {
    label: 'Website URL',
    description: isDefault ? 'Charity website (must start with http:// or https://)' : undefined,
    placeholder: isDefault ? 'https://example.org' : 'Override website URL',
    maxLength: 200,
    visibleWhen,
    showSeparatorAfter: true,
    rules: isDefault ? z.string().url('Must be a valid URL').max(200) : optionalUrl
  })

  const description = textareaField('description', {
    label: 'Description',
    description: isDefault ? 'Brief description of the charity (max 275 chars)' : undefined,
    placeholder: isDefault
      ? 'We rescue, rehabilitate, and release orangutans...'
      : 'Override description',
    maxLength: 275,
    rows: 3,
    visibleWhen,
    rules: isDefault
      ? z.string().min(20, 'Description must be at least 20 characters').max(275)
      : optionalString(275)
  })

  // Address
  const addressSummary = computed(() => {
    if (isDefault) {
      return formatAddressSummary(charityStore.address) || 'Registered charity address'
    }
    const addr = charityStore.currencyOverrides[currency]?.address
    if (!addr) return 'No override address'
    const required = [addr.address1, addr.city, addr.region, addr.postcode, addr.country]
    const filled = required.filter(Boolean).length
    if (filled === 0) return 'No override address'
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
    visibleWhen,
    fields: addressFieldsWithClear,
    rules: isDefault ? undefined : ADDRESS_ALL_OR_NOTHING_RULES
    // showSeparatorAfter: true
  })

  // Single ordered assembly — field order defined once
  const result: Record<string, FieldDef> = {}

  if (!isDefault) {
    result.enabled = toggleField('enabled', {
      label: `Use different details for ${currency}`,
      description: `Override charity details for ${currency} transactions`,
      defaultValue: false,
      rules: ({ values }: FieldContext) => {
        const enabled = values.enabled as boolean | undefined
        if (!enabled) return z.boolean()
        return z
          .boolean()
          .refine(
            () => hasOverrideContent(values as Record<string, unknown>),
            'Override at least one value, or toggle this off'
          )
      }
    })
  }

  // Shared field order (single source of truth)
  result.name = name
  result.registrationNumber = registrationNumber
  result.address = address
  result.phone = phone
  if (!isDefault) result.replyToEmail = replyToEmail
  result.website = isDefault ? { ...website, showSeparatorAfter: true } : website
  result.description = isDefault ? { ...description, showSeparatorAfter: true } : description

  if (isDefault) {
    const teamStore = useTeamSettingsStore()
    result.supportEmail = selectField('supportEmail', {
      label: 'Support Email',
      description:
        'Team member whose name and email are used as the sender, reply-to, and support contact',
      options: () =>
        teamStore.activeMembers.map((m) => ({
          value: m.id,
          label: `${m.name} (${m.email})`
        })),
      rules: z.string().min(1, 'Support email is required'),
      onChange: ({ value }) => {
        const member = teamStore.activeMembers.find((m) => m.id === value)
        if (member) {
          charityStore.emailSenderName = member.name
          charityStore.emailSenderAddress = member.email
          charityStore.replyToEmail = member.email
        }
      }
    })
    result.emailSignature = textareaField('emailSignature', {
      label: 'Email Signature',
      description: 'Appended to all outgoing emails as {{ SIGNATURE }}',
      placeholder: 'With gratitude,\nYour Team',
      showSeparatorAfter: true
    })
  }

  return result
}

/** Build $storePath mappings for a currency tab */
function buildStoreMappings(
  currency: string,
  isDefault: boolean,
  tabPath: string
): Record<string, string> {
  const m: Record<string, string> = {}
  const sp = isDefault ? '' : `currencyOverrides.${currency}.`

  // Scalar fields
  const fields = isDefault
    ? (['name', 'registrationNumber', 'phone', 'website', 'description'] as const)
    : (['enabled', ...CHARITY_OVERRIDE_FIELDS] as const)
  for (const f of fields) m[`${tabPath}.${f}`] = `${sp}${f}`

  // Default-only fields
  if (isDefault) {
    m[`${tabPath}.supportEmail`] = 'emailSenderId'
    m[`${tabPath}.emailSignature`] = 'emailSignature'
  }

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
 * Uses tabsField with one tab per currency — default + overrides
 */
export const useCharitySettingsForm = defineForm('charitySettings', () => {
  const currencyStore = useCurrencySettingsStore()
  const charityStore = useCharitySettingsStore()

  const charityInfoAlert = alertField('charityInfoAlert', {
    variant: 'info',
    description: () => {
      if (currencyStore.supportedCurrencies.length > 1) {
        return 'Configure charity details per currency. The default tab applies to your base currency; override tabs let you customise details for other currencies.'
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
  CURRENCY_OPTIONS.forEach(({ value: currency }) => {
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
            if (!tab.enabled) return ''
            const count = countOverrideFields(tab)
            return count > 0 ? String(count) : ''
          },
      badgeVariant: isDefault ? 'secondary' : 'default',
      fields: createTabFields(currency, isDefault, charityStore)
    })

    Object.assign(
      storeMappings,
      buildStoreMappings(currency, isDefault, `currencyTabs.${currency}`)
    )
  })

  const currencyTabs = tabsField('currencyTabs', {
    label: 'Currency-Specific Settings',
    tabsListClass: 'w-full',
    defaultValue: currencyStore.defaultCurrency,
    tabs
  })

  const charitySettings = fieldGroup('charitySettings', {
    wrapperClass: 'px-4 py-6 sm:px-6 bg-muted/50 rounded-xl border',
    fields: { currencyTabs, charityInfoAlert },
    $storePath: storeMappings
  })

  return { charitySettings }
})
