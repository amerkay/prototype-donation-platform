import * as z from 'zod'
import { defineForm, textField, textareaField } from '~/features/form-builder/api'

/**
 * Charity information form
 * Handles "About the Charity" section details
 */
export const useCharityInfoForm = defineForm('charity', (_ctx) => {
  const name = textField('name', {
    label: 'Charity Name',
    description: 'Official registered charity name',
    placeholder: 'Borneo Orangutan Survival Foundation',
    rules: z.string().min(3, 'Charity name must be at least 3 characters')
  })

  const registrationNumber = textField('registrationNumber', {
    label: 'Registration Number',
    description: 'Official charity registration number (e.g., RCN123456)',
    placeholder: 'RCN123456',
    rules: z.string().min(3, 'Registration number is required')
  })

  const website = textField('website', {
    label: 'Website URL',
    description: 'Charity website (must start with http:// or https://)',
    placeholder: 'https://example.org',
    type: 'url',
    rules: z.string().url('Must be a valid URL')
  })

  const description = textareaField('description', {
    label: 'Description',
    description: 'Brief description of the charity (max 275 chars)',
    placeholder: 'We rescue, rehabilitate, and release orangutans...',
    maxLength: 275,
    rows: 3,
    rules: z.string().min(20, 'Description must be at least 20 characters').max(275)
  })

  return { name, registrationNumber, website, description }
})
