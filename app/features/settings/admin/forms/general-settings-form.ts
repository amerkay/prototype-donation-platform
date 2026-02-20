import * as z from 'zod'
import {
  defineForm,
  selectField,
  comboboxField,
  fieldGroup
} from '~/features/_library/form-builder/api'
import { getTimezoneOptions } from '~/features/settings/admin/utils/timezones'

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
    rules: z.string().min(1)
  })

  const general = fieldGroup('general', {
    label: 'General Settings',
    description: 'Configure organization-wide defaults.',
    wrapperClass: 'px-4 py-6 sm:px-6 bg-muted/50 rounded-xl border',
    fields: { timezone, dateFormat },
    $storePath: {
      timezone: 'timezone',
      dateFormat: 'dateFormat'
    }
  })

  return { general }
})
