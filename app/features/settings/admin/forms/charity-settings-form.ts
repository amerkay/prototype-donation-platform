import * as z from 'zod'
import {
  defineForm,
  textField,
  textareaField,
  selectField,
  fieldGroup
} from '~/features/_library/form-builder/api'
import { ref, computed } from 'vue'
import { useCharitySettingsStore } from '~/features/settings/admin/stores/charitySettings'
import { useTeamSettingsStore } from '~/features/settings/admin/stores/teamSettings'
import { useAddressFields } from '~/features/donation-form/shared/forms/address-form'
import { useCharityCostsForm } from '~/features/settings/admin/forms/charity-costs-form'
import { useTermsConfigSection } from '~/features/donation-form/features/terms/admin/forms/terms-config-form'
import { formatCharityAddress } from '~/features/settings/admin/utils/formatCharityAddress'
import type { CharityAddress } from '~/features/settings/admin/types'

/** Single shared accordion state — passed to provideAccordionGroup() for single-open behavior */
export const charityOpenAccordionId = ref<string | undefined>(undefined)

function formatAddressSummary(a: Partial<CharityAddress> | undefined): string {
  if (!a) return ''
  return formatCharityAddress(a as CharityAddress)
}

/**
 * Charity settings form configuration
 * Single flat section — no per-currency tabs.
 */
export const useCharitySettingsForm = defineForm('charitySettings', (ctx) => {
  const charityStore = useCharitySettingsStore()
  const teamStore = useTeamSettingsStore()

  const name = textField('name', {
    label: 'Charity Name',
    description: 'Official registered charity name',
    placeholder: 'Borneo Orangutan Survival Foundation',
    maxLength: 120,
    rules: z.string().min(3, 'Charity name must be at least 3 characters').max(120)
  })

  const registrationNumber = textField('registrationNumber', {
    label: 'Registration Number',
    description: 'Official charity registration number (e.g., RCN123456)',
    placeholder: 'RCN123456',
    maxLength: 50,
    rules: z.string().min(3, 'Registration number is required').max(50)
  })

  const addressSummary = computed(() => {
    const addr = charityStore.charity.address
    if (!addr) return 'Registered charity address'
    const required = [addr.address1, addr.city, addr.region, addr.postcode, addr.country]
    const filled = required.filter(Boolean).length
    if (filled === 0) return 'Registered charity address'
    const summary = formatAddressSummary(addr)
    if (filled < required.length) return `Incomplete — ${summary}`
    return summary
  })

  const addressFields = useAddressFields()
  const address = fieldGroup('address', {
    label: 'Address',
    collapsible: true,
    collapsibleDefaultOpen: false,
    description: addressSummary,
    wrapperClass: 'border rounded-lg p-4',
    fields: addressFields
  })

  const phone = textField('phone', {
    label: 'Phone Number',
    description: 'Contact phone number shown on receipts',
    placeholder: '+44 20 7219 3000',
    maxLength: 30,
    rules: z.string().max(30).optional().or(z.literal(''))
  })

  const website = textField('website', {
    label: 'Website URL',
    description: 'Charity website (must start with http:// or https://)',
    placeholder: 'https://example.org',
    maxLength: 200,
    showSeparatorAfter: true,
    rules: z.string().url('Must be a valid URL').max(200)
  })

  const description = textareaField('description', {
    label: 'Description',
    description: 'Brief description of the charity (max 275 chars)',
    placeholder: 'We rescue, rehabilitate, and release orangutans...',
    maxLength: 275,
    rows: 3,
    showSeparatorAfter: true,
    rules: z.string().min(20, 'Description must be at least 20 characters').max(275)
  })

  const supportEmail = selectField('supportEmail', {
    label: 'Support Email',
    description:
      'Team member whose name and email are used as the sender, reply-to, and support contact',
    placeholder: 'Select team member...',
    options: () =>
      teamStore.activeMembers.map((m) => ({
        value: m.id,
        label: `${m.name} (${m.email})`
      })),
    rules: z.string().min(1, 'Support email is required'),
    onChange: ({ value }) => {
      const member = teamStore.activeMembers.find((m) => m.id === value)
      if (member) {
        charityStore.charity.emailSenderName = member.name
        charityStore.charity.emailSenderAddress = member.email
      }
    }
  })

  const emailSignature = textareaField('emailSignature', {
    label: 'Email Signature',
    description: 'Appended to all outgoing emails as {{ SIGNATURE }}',
    placeholder: 'With gratitude,\nYour Team',
    showSeparatorAfter: true
  })

  const charitySettings = fieldGroup('charitySettings', {
    label: 'Charity Details',
    description: 'Identity, address, and email sender shown on receipts and donor communications.',
    collapsible: true,
    collapsibleDefaultOpen: false,
    wrapperClass: 'px-4 py-6 sm:px-6 bg-muted/50 rounded-xl border',
    fields: {
      name,
      registrationNumber,
      address,
      phone,
      website,
      description,
      supportEmail,
      emailSignature
    },
    $storePath: {
      name: 'charity.name',
      registrationNumber: 'charity.registrationNumber',
      phone: 'charity.phone',
      website: 'charity.website',
      description: 'charity.description',
      supportEmail: 'charity.emailSenderId',
      emailSignature: 'charity.emailSignature',
      'address.address1': 'charity.address.address1',
      'address.address2': 'charity.address.address2',
      'address.city': 'charity.address.city',
      'address.country': 'charity.address.country',
      'address.group1.region': 'charity.address.region',
      'address.group1.postcode': 'charity.address.postcode'
    }
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

  // Terms & Conditions — org-level terms settings
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
