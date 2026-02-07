import * as z from 'zod'
import { defineForm, textField, selectField } from '~/features/_library/form-builder/api'

export const useTeamInviteForm = defineForm('teamInvite', () => {
  const name = textField('name', {
    label: 'Name',
    placeholder: 'Full name',
    rules: z.string().min(1, 'Name is required')
  })

  const email = textField('email', {
    label: 'Email',
    placeholder: 'email@example.com',
    rules: z.string().email('Must be a valid email address')
  })

  const role = selectField('role', {
    label: 'Role',
    options: [
      { value: 'admin', label: 'Admin' },
      { value: 'editor', label: 'Editor' },
      { value: 'viewer', label: 'Viewer' }
    ]
  })

  return { name, email, role }
})
