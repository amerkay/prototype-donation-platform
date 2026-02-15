import * as z from 'zod'
import {
  defineForm,
  textField,
  textareaField,
  selectField,
  comboboxField,
  fieldGroup
} from '~/features/_library/form-builder/api'
import { getTimezoneOptions } from '~/features/settings/admin/utils/timezones'
import { useTeamSettingsStore } from '~/features/settings/admin/stores/teamSettings'
import { useGeneralSettingsStore } from '~/features/settings/admin/stores/generalSettings'

export const useGeneralSettingsForm = defineForm('generalSettings', () => {
  const timezone = comboboxField('timezone', {
    label: 'Timezone',
    description: 'Used for scheduling and date display',
    searchPlaceholder: 'Search timezones...',
    options: getTimezoneOptions(),
    rules: z.string().min(1, 'Timezone is required')
  })

  const dateFormat = selectField('dateFormat', {
    label: 'Date Format',
    description: 'How dates are displayed across the platform',
    options: [
      { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (UK)' },
      { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (US)' },
      { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (ISO)' }
    ],
    rules: z.string().min(1),
    showSeparatorAfter: true
  })

  const teamStore = useTeamSettingsStore()
  const emailSender = selectField('emailSender', {
    label: 'Email Sender',
    description: 'Team member whose name and email appear in the "From" field',
    options: () =>
      teamStore.activeMembers.map((m) => ({
        value: m.id,
        label: `${m.name} (${m.email})`
      })),
    rules: z.string().min(1, 'Email sender is required'),
    onChange: ({ value }) => {
      const member = teamStore.activeMembers.find((m) => m.id === value)
      if (member) {
        const generalStore = useGeneralSettingsStore()
        generalStore.emailSenderName = member.name
        generalStore.emailSenderAddress = member.email
      }
    }
  })

  const supportEmail = textField('supportEmail', {
    label: 'Support Email',
    description: 'Displayed on error pages and in footer',
    placeholder: 'support@example.org',
    rules: z.string().email('Must be a valid email address'),
    showSeparatorAfter: true
  })

  const emailSignature = textareaField('emailSignature', {
    label: 'Email Signature',
    description: 'Appended to all outgoing emails as {{ SIGNATURE }}',
    placeholder: 'With gratitude,\nYour Team'
  })

  const general = fieldGroup('general', {
    label: 'General Settings',
    description: 'Configure organization-wide defaults.',
    wrapperClass: 'px-4 py-6 sm:px-6 bg-muted/50 rounded-xl border',
    fields: { timezone, dateFormat, emailSender, supportEmail, emailSignature },
    $storePath: {
      timezone: 'timezone',
      dateFormat: 'dateFormat',
      emailSender: 'emailSenderId',
      supportEmail: 'supportEmail',
      emailSignature: 'emailSignature'
    }
  })

  return { general }
})
