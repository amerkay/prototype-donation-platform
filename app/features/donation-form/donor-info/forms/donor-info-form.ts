import * as z from 'zod'
import type { FormDef } from '~/features/form-builder/types'
import { createMessageFields } from '~/features/donation-form/forms/optional-message-field'

/**
 * Donor information form section
 * Collects basic contact information from the donor
 */
export const donorInfoFormSection: FormDef = {
  id: 'donor-info',
  title: 'Your Information',
  fields: {
    name: {
      type: 'field-group',
      // label: 'Name',
      class: 'grid grid-cols-2 gap-x-3',
      isNoSeparatorAfter: true,
      fields: {
        firstName: {
          type: 'text',
          label: 'First Name',
          placeholder: 'John',
          autocomplete: 'given-name',
          defaultValue: '',
          rules: z.string().min(2, 'First name is required')
        },
        lastName: {
          type: 'text',
          label: 'Last Name',
          placeholder: 'Doe',
          autocomplete: 'family-name',
          defaultValue: '',
          rules: z.string().min(2, 'Last name is required')
        }
      }
    },
    email: {
      type: 'text',
      label: 'Email Address',
      placeholder: 'john@example.com',
      description: "We'll send your donation receipt here",
      autocomplete: 'email',
      isNoSeparatorAfter: true,
      defaultValue: '',
      rules: z.string().min(1, 'Email is required').email('Enter a valid email address')
    },
    phone: {
      type: 'text',
      label: 'Phone Number',
      placeholder: '+1 (555) 123-4567',
      description: 'Optional - for order updates',
      autocomplete: 'tel',
      optional: true,
      defaultValue: '',
      visibleWhen: (values) => {
        if (!values.email || typeof values.email !== 'string') return false
        return z.string().email().safeParse(values.email).success
      },
      rules: z.string().optional()
    },
    anonymous: {
      type: 'toggle',
      label: 'Donate Anonymously',
      description: (values) => {
        const isAnonymous = values.anonymous === true
        return isAnonymous
          ? 'Your name will show as "Anonymous" on our crowdfunding pages'
          : 'Your first name and last initial will be displayed on our crowdfunding pages'
      },
      optional: true,
      defaultValue: false
    },

    // Message fields (toggle + textarea)
    ...createMessageFields()
  }
}
