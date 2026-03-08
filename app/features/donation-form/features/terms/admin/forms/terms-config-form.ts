import * as z from 'zod'
import {
  defineForm,
  toggleField,
  fieldGroup,
  textField,
  selectField,
  richTextField
} from '~/features/_library/form-builder/api'
import { useFormConfigStore } from '~/features/donation-form/shared/stores/formConfig'

/**
 * Admin config section for Terms & Conditions feature
 */
export const useTermsConfigSection = defineForm('terms', (_ctx) => {
  const enabled = toggleField('enabled', {
    label: 'Enable Terms & Conditions',
    description: 'Require donors to accept terms before completing',
    labelClass: 'font-bold',
    showSeparatorAfter: true,
    rules: () => {
      const terms = useFormConfigStore().terms as Record<string, unknown>
      const mode = terms?.mode
      const hasContent =
        mode === 'link' ? !!terms?.externalUrl : mode === 'content' ? !!terms?.richContent : false
      return z.boolean().refine((val) => !val || hasContent, {
        message: 'Terms URL or content must be provided before enabling'
      })
    }
  })

  const mode = selectField('mode', {
    label: 'Terms Mode',
    description: 'How to present terms content to donors',
    options: [
      { label: 'External Link', value: 'link' },
      { label: 'Inline Content (Modal)', value: 'content' }
    ],
    defaultValue: 'link'
  })

  const externalUrl = textField('externalUrl', {
    label: 'Terms URL',
    description: 'Link to your external terms and conditions page',
    placeholder: 'https://example.com/terms',
    visibleWhen: ({ values }) => values.mode === 'link',
    rules: z.string().url('Must be a valid URL').or(z.literal(''))
  })

  const richContent = richTextField('richContent', {
    label: 'Terms Content',
    description: 'Rich text content shown in a modal when donors click to view terms',
    placeholder: 'Enter your terms and conditions...',
    visibleWhen: ({ values }) => values.mode === 'content'
  })

  const label = textField('label', {
    label: 'Checkbox Label',
    description: 'Text shown next to the terms acceptance checkbox',
    placeholder: 'I accept the terms and conditions'
  })

  const description = textField('description', {
    label: 'Description',
    description: 'Additional text shown below the checkbox',
    placeholder: 'I agree to the Terms of Service and Privacy Policy.'
  })

  const settings = fieldGroup('settings', {
    label: 'Terms Settings',
    collapsible: true,
    collapsibleDefaultOpen: false,
    showSeparatorAfter: true,
    fields: { mode, externalUrl, richContent, label, description }
  })

  return { enabled, settings, mode, externalUrl, richContent, label, description }
})
