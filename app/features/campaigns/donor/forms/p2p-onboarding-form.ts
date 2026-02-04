import { z } from 'zod'
import {
  defineForm,
  textField,
  textareaField,
  currencyField,
  fieldGroup
} from '~/features/_library/form-builder/api'
import type { ComposableForm } from '~/features/_library/form-builder/types'

/**
 * P2P Onboarding Step 2: Personal details
 */
export const useP2PDetailsForm: ComposableForm = defineForm('p2p-details', (ctx) => {
  ctx.title = 'Your Details'
  ctx.description = "Tell us a bit about yourself so donors know who they're supporting."

  const firstName = textField('firstName', {
    label: 'First name',
    placeholder: 'Jane',
    autocomplete: 'given-name',
    defaultValue: '',
    rules: z.string().min(1, 'First name is required')
  })

  const lastName = textField('lastName', {
    label: 'Last name',
    placeholder: 'Smith',
    autocomplete: 'family-name',
    defaultValue: '',
    optional: true
  })

  const name = fieldGroup('name', {
    class: 'grid grid-cols-2 gap-x-3',
    fields: { firstName, lastName }
  })

  const email = textField('email', {
    label: 'Email address',
    placeholder: 'jane@example.com',
    description: "We'll send donation notifications to this email.",
    autocomplete: 'email',
    defaultValue: '',
    rules: z.string().min(1, 'Email is required').email('Enter a valid email address')
  })

  return { name, email }
})

/**
 * P2P Onboarding Step 3: Customise fundraising page
 */
export function createP2PCustomiseForm(defaults: {
  pageTitle: string
  goal: number
  story: string
}): ComposableForm {
  return defineForm('p2p-customise', (ctx) => {
    ctx.title = 'Customise Your Page'
    ctx.description = 'Make your fundraising page personal. You can always edit these later.'

    const pageTitle = textField('pageTitle', {
      label: 'Page title',
      placeholder: 'My fundraiser for BOSF',
      defaultValue: defaults.pageTitle,
      rules: z.string().min(1, 'Page title is required')
    })

    const goal = currencyField('goal', {
      label: 'Fundraising goal',
      currencySymbol: '£',
      min: 10,
      defaultValue: defaults.goal,
      rules: z.number().min(10, 'Goal must be at least £10')
    })

    const story = textareaField('story', {
      label: 'Your story',
      placeholder: 'Tell potential donors why this cause matters to you...',
      rows: 5,
      defaultValue: defaults.story,
      optional: true
    })

    return { pageTitle, goal, story }
  })
}
