import * as z from 'zod'
import { defineForm, fieldGroup, textField, toggleField } from '~/features/form-builder/api'
import type { ComposableForm } from '~/features/form-builder/types'
import { createMessageFields } from '~/features/donation-form/forms/optional-message-field'

/**
 * Donor information form section
 * Collects basic contact information from the donor
 */
export const useDonorInfoFormSection: ComposableForm = defineForm('donor-info', (ctx) => {
  ctx.title = 'Your Information'

  const firstName = textField('firstName', {
    label: 'First Name',
    placeholder: 'John',
    autocomplete: 'given-name',
    defaultValue: '',
    rules: z.string().min(2, 'First name is required')
  })

  const lastName = textField('lastName', {
    label: 'Last Name',
    placeholder: 'Doe',
    autocomplete: 'family-name',
    defaultValue: '',
    rules: z.string().min(2, 'Last name is required')
  })

  const name = fieldGroup('name', {
    // label: 'Name',
    class: 'grid grid-cols-2 gap-x-3',
    fields: { firstName, lastName }
  })

  const email = textField('email', {
    label: 'Email Address',
    placeholder: 'john@example.com',
    description: "We'll send your donation receipt here",
    autocomplete: 'email',
    defaultValue: '',
    rules: z.string().min(1, 'Email is required').email('Enter a valid email address')
  })

  const phone = textField('phone', {
    label: 'Phone Number',
    placeholder: '+1 (555) 123-4567',
    description: 'Optional - for order updates',
    autocomplete: 'tel',
    optional: true,
    defaultValue: '',
    isSeparatorAfter: true,
    visibleWhen: ({ values }) => {
      if (!values.email || typeof values.email !== 'string') return false
      return z.string().email().safeParse(values.email).success
    },
    rules: z.string().optional()
  })

  const anonymous = toggleField('anonymous', {
    label: 'Donate Anonymously',
    description: ({ values }) => {
      const isAnonymous = values.anonymous === true
      return isAnonymous
        ? 'Your name will show as "Anonymous" on our crowdfunding pages'
        : 'Your first name and last initial will be displayed on our crowdfunding pages'
    },
    optional: true,
    defaultValue: false
  })

  return {
    name,
    email,
    phone,
    anonymous,
    // Message fields (toggle + textarea)
    ...createMessageFields()
  }
})
