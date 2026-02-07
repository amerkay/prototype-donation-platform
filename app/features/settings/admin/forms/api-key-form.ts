import * as z from 'zod'
import { defineForm, textField } from '~/features/_library/form-builder/api'

export const useApiKeyForm = defineForm('apiKey', () => {
  const name = textField('name', {
    label: 'Key Name',
    placeholder: 'e.g. Production Server',
    rules: z.string().min(1, 'Key name is required')
  })

  return { name }
})
