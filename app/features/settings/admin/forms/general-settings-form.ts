import * as z from 'zod'
import {
  defineForm,
  textField,
  selectField,
  fieldGroup
} from '~/features/_library/form-builder/api'

export const useGeneralSettingsForm = defineForm('generalSettings', () => {
  const timezone = selectField('timezone', {
    label: 'Timezone',
    description: 'Used for scheduling and date display',
    options: [
      { value: 'Europe/London', label: 'Europe/London (GMT/BST)' },
      { value: 'America/New_York', label: 'America/New York (EST/EDT)' },
      { value: 'America/Los_Angeles', label: 'America/Los Angeles (PST/PDT)' },
      { value: 'Europe/Paris', label: 'Europe/Paris (CET/CEST)' },
      { value: 'Asia/Tokyo', label: 'Asia/Tokyo (JST)' },
      { value: 'Australia/Sydney', label: 'Australia/Sydney (AEST/AEDT)' }
    ],
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
    rules: z.string().min(1)
  })

  const language = selectField('language', {
    label: 'Default Language',
    description: 'Primary language for donor-facing pages',
    options: [
      { value: 'en', label: 'English' },
      { value: 'es', label: 'Spanish' },
      { value: 'fr', label: 'French' },
      { value: 'de', label: 'German' }
    ],
    rules: z.string().min(1),
    showSeparatorAfter: true
  })

  const emailSenderName = textField('emailSenderName', {
    label: 'Email Sender Name',
    description: 'Name shown in donor email "From" field',
    placeholder: 'Borneo Orangutan Survival',
    rules: z.string().min(1, 'Sender name is required')
  })

  const emailSenderAddress = textField('emailSenderAddress', {
    label: 'Email Sender Address',
    description: 'Email address used to send receipts and notifications',
    placeholder: 'noreply@example.org',
    rules: z.string().email('Must be a valid email address')
  })

  const supportEmail = textField('supportEmail', {
    label: 'Support Email',
    description: 'Displayed on error pages and in footer',
    placeholder: 'support@example.org',
    rules: z.string().email('Must be a valid email address')
  })

  const general = fieldGroup('general', {
    label: 'General Settings',
    description: 'Configure organization-wide defaults.',
    wrapperClass: 'px-4 py-6 sm:px-6 bg-muted/50 rounded-xl border',
    fields: { timezone, dateFormat, language, emailSenderName, emailSenderAddress, supportEmail },
    $storePath: {
      timezone: 'timezone',
      dateFormat: 'dateFormat',
      language: 'language',
      emailSenderName: 'emailSenderName',
      emailSenderAddress: 'emailSenderAddress',
      supportEmail: 'supportEmail'
    }
  })

  return { general }
})
